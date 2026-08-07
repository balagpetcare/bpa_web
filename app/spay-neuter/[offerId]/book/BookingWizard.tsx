'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Clock, MapPin, CalendarDays, ArrowLeft, CheckCircle, Info } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { assertSafePaymentUrl } from '@/lib/utils/payment-redirect';
import { formatMoney } from '@/lib/utils/format';
import {
  getSpayAvailabilityDates,
  getSpayAvailabilitySlots,
  createSpayHold,
  createSpayBooking,
  retrySpayBookingPayment,
  type SpayOfferPublic,
  type SpayProcedure,
  type SpayAvailabilityWindow,
  type SpayHold,
  type SpayBookingStatus,
} from '@/lib/api/spay-neuter';
import { ApiError } from '@/lib/api';
import {
  computeAmountDueAtClinic,
  resolveBookingConfirmationCopy,
  resolveRetryPaymentErrorMessage,
} from '@/lib/spay-neuter/booking-confirmation';
import {
  formatDateChip,
  formatFullDateLabel,
  formatSlotAccessibleLabel,
  formatSlotTimeRange,
  getDayPeriod,
  getDayPeriodLabel,
  getSlotStatusLabel,
  getSlotUiStatus,
  slotGridClassName,
  type DayPeriod,
} from '@/lib/spay-neuter/slot-format';
import { getSlotResumeMessage, resolveInitialStep, resolvePreselectedSlot } from '@/lib/spay-neuter/slot-resume';
import { BOOKING_STEP_LABELS, CONSENT_TEXT_BN, CONSENT_TEXT_EN, TOTAL_BOOKING_STEPS, buildBookingPayload, buildBookingReturnQuery } from '@/lib/spay-neuter/booking-flow';
import {
  canSubmitPayment,
  classifyHoldError,
  computeHoldAttemptKey,
  getPaymentBlockReason,
  shouldStartNewHoldAttempt,
  type HoldErrorInfo,
  type HoldState,
} from '@/lib/spay-neuter/hold-state';

// A registered pet profile is intentionally NOT part of this flow — Spay &
// Neuter promotional bookings never require selecting or creating a pet
// (see spay-neuter.booking.service.ts on the API side: externalPetId is
// optional and no SpayBookingPet row is created when it's absent). This is
// a deliberate product decision for this module only; My Pets, Furtail, and
// pet selection in other campaigns/medical modules are untouched.
const STEP_LABELS = BOOKING_STEP_LABELS;
const TOTAL_STEPS = TOTAL_BOOKING_STEPS;
const DAY_PERIOD_ORDER: DayPeriod[] = ['morning', 'afternoon', 'evening'];

function todayDhakaDateStr(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka' }).format(new Date());
}

function addDaysToDateStr(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

function newIdempotencyKey(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

interface BookingWizardProps {
  offerId: string;
  // Fetched and validated server-side in page.tsx (existence + publication
  // status, via the same getPublicSpayOffer()/notFound() pattern the offer
  // detail page uses) — this component only ever sees a real, published
  // offer. "Not currently bookable" (offer.bookable === false) is a
  // different, non-404 state and is still handled below.
  initialOffer: SpayOfferPublic;
  // Already validated server-side (SPAY/NEUTER only, case-insensitive) via
  // normalizeServiceQueryParam — an invalid ?service= value arrives here as
  // null, never surfaced as an error, and the user simply picks a procedure
  // manually in Step 1 (still fully changeable either way).
  initialService: SpayProcedure | null;
}

function SpayBookingPageInner({ offerId, initialOffer, initialService }: BookingWizardProps) {
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const offer = initialOffer;

  const preselectedClinicId = searchParams.get('clinic') ?? '';
  const preselectedDate = searchParams.get('date') ?? '';
  const preselectedSlotId = searchParams.get('slot') ?? '';

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(() => resolveInitialStep({
    procedure: initialService ?? '',
    clinicBranchId: preselectedClinicId,
    selectedDate: preselectedDate,
  }));

  const [procedure, setProcedure] = useState<SpayProcedure | ''>(initialService ?? '');
  const [clinicBranchId, setClinicBranchId] = useState(preselectedClinicId);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [datesLoading, setDatesLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(preselectedDate);
  const [slots, setSlots] = useState<SpayAvailabilityWindow[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SpayAvailabilityWindow | null>(null);
  const [slotResumeNotice, setSlotResumeNotice] = useState('');
  const [slotResumeAttempted, setSlotResumeAttempted] = useState(false);

  const [hold, setHold] = useState<SpayHold | null>(null);
  const [holdIdempotencyKey, setHoldIdempotencyKey] = useState(newIdempotencyKey);
  const [holdState, setHoldState] = useState<HoldState>('idle');
  const [holdError, setHoldError] = useState<HoldErrorInfo | null>(null);
  // Identifies which exact (offer, procedure, clinic, date, slot, session,
  // idempotency key) combination the current/last hold attempt was started
  // for. A plain ref (not state) on purpose — comparing against it is how
  // the hold effect below decides whether to start a new attempt, abort a
  // stale one, or ignore a stale response, WITHOUT relying on React's
  // per-render effect cleanup (see the hold effect's comment for why that
  // was the original bug).
  const holdAttemptRef = useRef<{ key: string; controller: AbortController } | null>(null);

  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);
  // Set once createSpayBooking resolves (regardless of whether the BDT 500
  // advance was actually paid — see the approved online-advance policy).
  // `status` is the ONLY thing that governs whether the confirmation screen
  // is allowed to say "Booking Confirmed" — see
  // lib/spay-neuter/booking-confirmation.ts's resolveBookingConfirmationCopy,
  // never a boolean like the old paymentGatewayUnavailable-driven copy this
  // replaced (which said "Confirmed" + "pay at the clinic" even though the
  // backend had recorded the booking as pending_payment).
  // Set only by handleSubmit, right after createSpayBooking resolves in
  // THIS session (never by re-parsing a gateway-return URL — see
  // /spay-neuter/payment/return, the dedicated, authenticated,
  // server-verified return page every EPS redirect for a spay_booking
  // payment actually lands on; this page is never that redirect target).
  // `status` is the ONLY thing that governs whether this screen is allowed
  // to say "Booking Confirmed" — see lib/spay-neuter/booking-confirmation.
  // ts's resolveBookingConfirmationCopy, never a boolean like the old
  // paymentGatewayUnavailable-driven copy this replaced (which said
  // "Confirmed" + "pay at the clinic" even though the backend had recorded
  // the booking as pending_payment).
  const [confirmedBooking, setConfirmedBooking] = useState<{
    retryableBookingId: string;
    bookingNumber: string;
    status: SpayBookingStatus;
    totalPriceBdt: number;
    advancePaidBdt: number;
  } | null>(null);
  const [retryingPayment, setRetryingPayment] = useState(false);
  const [retryPaymentError, setRetryPaymentError] = useState('');

  useEffect(() => {
    if (user) {
      setContactName((n) => n || user.name || '');
      setContactPhone((p) => p || user.phone || '');
      setContactEmail((e) => e || user.email || '');
    }
  }, [user]);

  useEffect(() => {
    if (step !== 3 || !clinicBranchId || !procedure) return;
    setDatesLoading(true);
    const from = todayDhakaDateStr();
    const to = offer?.endsAt ? offer.endsAt.slice(0, 10) : addDaysToDateStr(from, 30);
    getSpayAvailabilityDates(clinicBranchId, procedure, from, to)
      .then(setAvailableDates)
      .catch(() => setError('Could not load available dates for this clinic.'))
      .finally(() => setDatesLoading(false));
  }, [step, clinicBranchId, procedure, offer]);

  useEffect(() => {
    if (!selectedDate || !clinicBranchId || !procedure) return;
    setSlotsLoading(true);
    getSpayAvailabilitySlots(clinicBranchId, procedure, selectedDate)
      .then(s => setSlots(s))
      .catch(() => setError('Could not load time slots for this date.'))
      .finally(() => setSlotsLoading(false));
  }, [selectedDate, clinicBranchId, procedure]);

  // Runs once, after the first live slot fetch completes, to resolve a slot
  // the user chose before being sent off for authentication (or arrived via
  // a deep link). The server's freshly-fetched slot list is the only source
  // of truth here — a slot that's gone or no longer bookable is never
  // silently re-selected, only ever surfaced as a message asking the user
  // to pick again.
  useEffect(() => {
    if (slotResumeAttempted || slotsLoading || !preselectedSlotId) return;
    if (!selectedDate || slots.length === 0) return;
    setSlotResumeAttempted(true);

    const result = resolvePreselectedSlot(slots, preselectedSlotId);
    if (result.outcome === 'restored' && result.slot) {
      setSelectedSlot(result.slot);
      setHoldIdempotencyKey(newIdempotencyKey());
      setStep((s) => Math.max(s, 4));
    } else if (result.outcome === 'unavailable' || result.outcome === 'not_found') {
      setSlotResumeNotice(getSlotResumeMessage(result.outcome));
    }
  }, [slots, slotsLoading, selectedDate, preselectedSlotId, slotResumeAttempted]);

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!hold?.expiresAt) { setTimeLeft(null); return; }
    const end = new Date(hold.expiresAt).getTime();
    const id = setInterval(() => {
      const remaining = Math.max(0, Math.floor((end - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [hold]);

  // Hold creation is no longer tied to a "select a pet" step transition —
  // there isn't one. It fires automatically the moment the Review & Payment
  // step is reached by a signed-in user with a chosen slot.
  //
  // ROOT CAUSE OF THE PREVIOUS "Securing…" hang: the old version of this
  // effect included its OWN "in flight" flag (`submitting`) in its own
  // dependency array, and called setSubmitting(true) synchronously inside
  // the effect body. That state flip is itself a dependency change, so React
  // re-ran this effect immediately — which first invoked the PREVIOUS run's
  // cleanup function (`cancelled = true`), permanently poisoning the
  // `cancelled` flag that the in-flight request's `.then`/`.catch`/`.finally`
  // were closed over. The hold request still completed on the server (or
  // failed), but every handler's `if (!cancelled)` guard was already false,
  // so `setHold`/`setSubmitting(false)` were never called — the spinner
  // could never clear, no matter what the server returned.
  //
  // Fix: the effect's own progress is no longer a dependency at all. Instead,
  // `holdAttemptRef` (a plain ref, not state) identifies which exact
  // selection combination is currently being attempted. A new attempt only
  // starts when the computed key differs from the ref; `.then`/`.catch`
  // compare the CURRENT ref value (not a closed-over boolean) before writing
  // state, so a stale response from an abandoned attempt is always ignored,
  // and the active/failed transition always fires for a real, still-current
  // attempt — this is what actually clears "securing" in every case.
  useEffect(() => {
    if (step !== TOTAL_STEPS || !user || !offer || !selectedSlot || !clinicBranchId || !procedure) return;
    if (holdState === 'active' || holdState === 'failed' || holdState === 'expired') return;

    const attemptKey = computeHoldAttemptKey({
      offerId: offer.id,
      clinicBranchId,
      procedure,
      selectedDate,
      slotId: selectedSlot.availabilityId,
      userId: user.id,
      idempotencyKey: holdIdempotencyKey,
    });

    // Already in flight (or already resolved) for this exact combination —
    // do nothing, regardless of why this render happened. This is what makes
    // rerenders for unrelated reasons (contact fields, step navigation, the
    // countdown timer) safe: none of them change the attempt key, so none of
    // them can ever retrigger or duplicate the hold request.
    if (!shouldStartNewHoldAttempt(holdAttemptRef.current?.key, attemptKey)) return;

    // A genuinely new attempt — abort whatever the previous (now-stale)
    // attempt was doing (only reached when the booking context actually
    // changed: procedure/clinic/date/slot/idempotency key).
    holdAttemptRef.current?.controller.abort();
    const controller = new AbortController();
    holdAttemptRef.current = { key: attemptKey, controller };

    setHoldState('securing');
    setHoldError(null);

    const HOLD_REQUEST_TIMEOUT_MS = 15_000;
    const timeoutSignal = typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(HOLD_REQUEST_TIMEOUT_MS) : null;
    const signal = timeoutSignal && typeof AbortSignal.any === 'function'
      ? AbortSignal.any([controller.signal, timeoutSignal])
      : controller.signal;

    createSpayHold(
      {
        offerId: offer.id,
        clinicBranchId,
        procedure: procedure as SpayProcedure,
        startAt: selectedSlot.operationStartAt,
        idempotencyKey: holdIdempotencyKey,
      },
      { signal },
    )
      .then((newHold) => {
        if (holdAttemptRef.current?.key !== attemptKey) return; // stale — a newer attempt has already superseded this one
        setHold(newHold);
        setHoldState('active');
      })
      .catch((e: unknown) => {
        if (holdAttemptRef.current?.key !== attemptKey) return;
        const info = classifyHoldError(e);
        if (info.kind === 'slot_unavailable') {
          // The chosen time is gone — never leave the user staring at a
          // dead Review step; send them back to reselect, with a clear,
          // specific reason (reusing the same notice slot the login-return
          // slot-revalidation flow already uses for this exact message).
          setHold(null);
          setHoldState('idle');
          setSelectedSlot(null);
          setHoldIdempotencyKey(newIdempotencyKey());
          setSlotResumeNotice(info.message);
          setStep(3);
          return;
        }
        setHoldState('failed');
        setHoldError(info);
      });
  }, [step, user, offer, selectedSlot, clinicBranchId, procedure, selectedDate, holdIdempotencyKey, holdState]);

  // True-unmount safety net only — aborts whatever attempt is current at the
  // moment the page is actually left, independent of the key-comparison
  // logic above (which intentionally never aborts on ordinary rerenders).
  useEffect(() => {
    return () => {
      holdAttemptRef.current?.controller.abort();
    };
  }, []);

  // idle/securing/failed -> expired is driven by the same server-issued
  // expiresAt the countdown already renders — never a client-guessed
  // duration. Once expired, payment is blocked until an explicit Retry
  // (a fresh idempotency key + a brand new hold attempt), never automatic.
  useEffect(() => {
    if (holdState === 'active' && timeLeft === 0) {
      setHoldState('expired');
    }
  }, [holdState, timeLeft]);

  const clinics = useMemo(() => (offer?.clinics ?? []).filter((c) => c.clinicBranch.published), [offer]);
  const selectedClinic = useMemo(() => clinics.find((c) => c.clinicBranch.id === clinicBranchId)?.clinicBranch ?? null, [clinics, clinicBranchId]);

  const priceBdt = useMemo(() => {
    if (!offer || !procedure) return 0;
    const choice = offer.serviceChoices.find(c => c.code === procedure.toUpperCase());
    return choice?.totalAmount ?? (procedure === 'neuter' ? offer.neuterTotalPriceBdt : offer.spayTotalPriceBdt);
  }, [offer, procedure]);

  const paymentGateInput = { holdState, timeLeft, contactName, contactPhone, consentAccepted };
  const paymentBlockReason = getPaymentBlockReason(paymentGateInput);
  const canPay = canSubmitPayment(paymentGateInput);

  function getSignInUrl() {
    // The query only ever carries the non-sensitive service/clinic/date/slot
    // selection (no hold/booking/payment reference, and no pet identity —
    // there's no pet input to this function at all) so the page can
    // re-resolve and revalidate the chosen time against a fresh server
    // fetch once the user is back from signing in, instead of forcing a
    // full reselection of an otherwise-still-valid choice.
    const q = buildBookingReturnQuery({
      procedure: procedure || undefined,
      clinicBranchId: clinicBranchId || undefined,
      selectedDate: selectedDate || undefined,
      slotId: selectedSlot?.availabilityId,
    });

    const path = typeof window !== 'undefined' ? window.location.pathname : `/spay-neuter/${offerId}/book`;
    const nextPath = `${path}?${q.toString()}`;
    return `/auth/sign-in?next=${encodeURIComponent(nextPath)}`;
  }

  function handleProcedureChange(p: SpayProcedure) {
    if (procedure !== p) {
      setProcedure(p);
      setSelectedSlot(null);
      setHold(null);
      setHoldState('idle');
      setHoldError(null);
      setSlotResumeNotice('');
      setHoldIdempotencyKey(newIdempotencyKey());
    }
  }

  function handleClinicChange(id: string) {
    if (clinicBranchId !== id) {
      setClinicBranchId(id);
      setSelectedDate('');
      setSelectedSlot(null);
      setHold(null);
      setHoldState('idle');
      setHoldError(null);
      setSlotResumeNotice('');
      setHoldIdempotencyKey(newIdempotencyKey());
    }
  }

  // A previously-created hold is tied to the OLD date's candidate start
  // time via holdIdempotencyKey — replaying that same key after picking a
  // new date would make createSpayHold() idempotently return the stale
  // hold for the old time instead of reserving the new one, so the key
  // must be regenerated here too, exactly like every other selection that
  // invalidates the current hold.
  function handleDateChange(dateStr: string) {
    if (selectedDate !== dateStr) {
      setSelectedDate(dateStr);
      setSelectedSlot(null);
      setHold(null);
      setHoldState('idle');
      setHoldError(null);
      setSlotResumeNotice('');
      setHoldIdempotencyKey(newIdempotencyKey());
    }
  }

  function handleSlotChange(s: SpayAvailabilityWindow) {
    if (selectedSlot?.availabilityId !== s.availabilityId) {
      setSelectedSlot(s);
      setHold(null);
      setHoldState('idle');
      setHoldError(null);
      setSlotResumeNotice('');
      setHoldIdempotencyKey(newIdempotencyKey());
    }
  }

  // Used both for an explicit "Retry" after a failure and for "Select
  // another time"'s counterpart when a hold has expired — either way, a
  // fresh idempotency key means the hold effect treats this as a genuinely
  // new attempt (idle -> securing), never a replay of the dead one.
  function retryHoldCreation() {
    setError('');
    setHold(null);
    setHoldState('idle');
    setHoldError(null);
    setHoldIdempotencyKey(newIdempotencyKey());
  }

  function validateStep(s: number): string {
    if (s === 1 && !procedure) return 'Please select a procedure.';
    if (s === 2 && !clinicBranchId) return 'Please select a clinic.';
    if (s === 3 && !selectedSlot) return 'Please select a date and time.';
    if (s === 4) {
      if (!user) return 'Please sign in to complete your booking.';
      if (paymentBlockReason) return paymentBlockReason;
    }
    return '';
  }

  function next() {
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setError('');
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  }

  function prev() { setError(''); setStep((s) => Math.max(1, s - 1)); }

  async function handleSubmit() {
    if (submitting) return; // guards against a double-click firing two concurrent booking/payment requests
    const err = validateStep(TOTAL_STEPS);
    if (err) { setError(err); return; }
    if (!offer || !selectedSlot || !hold) return;
    if (!canPay) return;

    setError('');
    setSubmitting(true);
    try {
      // No pet field is ever sent — a registered pet is optional for this
      // module and no placeholder/empty id is ever substituted for one.
      // The hold itself is re-validated atomically, server-side, by
      // createSpayBooking's underlying conditional UPDATE (status must
      // still be 'active' and unexpired) — this call IS the revalidation,
      // not a rubber stamp of the client's local countdown.
      const result = await createSpayBooking(buildBookingPayload({
        holdId: hold.id,
        contactName,
        contactPhone,
        contactEmail,
      }));
      if (result.paymentGatewayUnavailable || !result.paymentUrl) {
        // Booking exists, but the BDT 500 advance has NOT been paid or
        // verified — result.booking.status is 'pending_payment' here (the
        // backend never returns 'confirmed' without a verified payment).
        // The confirmation screen's copy is driven entirely by that status,
        // never by the paymentGatewayUnavailable flag itself — see
        // resolveBookingConfirmationCopy.
        setConfirmedBooking({
          retryableBookingId: result.booking.id,
          bookingNumber: result.booking.bookingNumber,
          status: result.booking.status,
          totalPriceBdt: result.booking.totalPriceBdt,
          advancePaidBdt: result.booking.advancePaidBdt,
        });
        setSubmitting(false);
        return;
      }
      assertSafePaymentUrl(result.paymentUrl);
      window.location.href = result.paymentUrl;
    } catch (e: unknown) {
      const errorMap: Record<string, string> = {
        'SERVICE_TYPE_REQUIRED': 'A service type (Spay/Neuter) must be selected.',
        'SERVICE_NOT_AVAILABLE_AT_CLINIC': 'This clinic does not offer the selected procedure.',
        'SLOT_SERVICE_MISMATCH': 'The selected time slot does not support this procedure.',
        'SLOT_UNAVAILABLE': 'This time slot is no longer available.',
        // The backend's actual code for a hold that expired before the
        // booking-creation transaction converted it (see createBookingFromHold
        // in spay-neuter.booking.service.ts) is SPAY_HOLD_EXPIRED, not
        // HOLD_EXPIRED — kept both here defensively in case either is ever
        // returned, but SPAY_HOLD_EXPIRED is the one that actually fires.
        'SPAY_HOLD_EXPIRED': 'Your time slot hold has expired. Please go back and select a time again.',
        'HOLD_EXPIRED': 'Your time slot hold has expired. Please go back and select a time again.',
        'OFFER_NOT_BOOKABLE': 'This campaign is no longer accepting bookings.',
        'PAYMENT_AMOUNT_MISMATCH': 'Payment amount mismatch. Please refresh and try again.',
      };

      const code = (e as { data?: { code?: string } }).data?.code;
      setSubmitting(false);

      if (code === 'SPAY_HOLD_EXPIRED' || code === 'HOLD_EXPIRED') {
        setHoldState('expired');
        return; // the expired-hold UI in Step 4 already explains this — no separate top-of-page error needed
      }
      if (code === 'SLOT_UNAVAILABLE' || code === 'SLOT_SERVICE_MISMATCH') {
        setHold(null);
        setHoldState('idle');
        setSelectedSlot(null);
        setHoldIdempotencyKey(newIdempotencyKey());
        setSlotResumeNotice(errorMap[code]);
        setStep(3);
        return; // the Date & Time step's notice already explains this
      }

      const msg = (code ? errorMap[code] : undefined) || (e as Error).message || 'Could not complete your booking.';
      setError(msg);
    }
  }

  // Resumes online payment for the SAME booking — never creates a second
  // one. Guarded by retryingPayment the same way handleSubmit is guarded by
  // submitting, so a double-click can't fire two concurrent EPS
  // initiations (the backend is independently idempotent too — see
  // retrySpayBookingPayment in spay-neuter.booking.service.ts — but the
  // button-level guard avoids the round-trip entirely).
  async function handleRetryPayment() {
    if (retryingPayment || !confirmedBooking?.retryableBookingId) return;
    setRetryPaymentError('');
    setRetryingPayment(true);
    try {
      const result = await retrySpayBookingPayment(confirmedBooking.retryableBookingId);
      if (!result.paymentUrl) {
        setRetryPaymentError(resolveRetryPaymentErrorMessage(undefined, 'Could not start the payment. Please try again.'));
        setRetryingPayment(false);
        return;
      }
      assertSafePaymentUrl(result.paymentUrl);
      window.location.href = result.paymentUrl;
    } catch (e: unknown) {
      const code = e instanceof ApiError ? e.code : undefined;
      const fallback = e instanceof Error ? e.message : 'Could not start the payment. Please try again.';
      setRetryPaymentError(resolveRetryPaymentErrorMessage(code, fallback));
      setRetryingPayment(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center pt-32">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-(--bpa-green) border-t-transparent" />
      </div>
    );
  }

  if (confirmedBooking) {
    const copy = resolveBookingConfirmationCopy({ status: confirmedBooking.status });
    const isConfirmed = copy.variant === 'confirmed';
    const amountDueAtClinic = computeAmountDueAtClinic(
      isConfirmed ? confirmedBooking.totalPriceBdt : priceBdt || confirmedBooking.totalPriceBdt,
      offer.advanceBdt,
    );

    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-10">
        <div className="max-w-lg mx-auto px-4 py-10">
          <div className={`bg-white rounded-2xl border shadow-sm p-7 text-center ${isConfirmed ? 'border-emerald-200' : 'border-amber-200'}`}>
            {isConfirmed ? (
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-(--bpa-green)" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock size={28} className="text-amber-600" />
              </div>
            )}
            <h2 className="text-xl font-bold text-(--bpa-navy) mb-1">{copy.titleEn}</h2>
            <p className="text-sm text-gray-500 mb-1">{copy.messageEn}</p>
            <p className="text-xs text-gray-400 mb-5" lang="bn">{copy.messageBn}</p>

            <div className={`rounded-xl px-4 py-4 mb-5 border ${isConfirmed ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isConfirmed ? 'text-emerald-600' : 'text-amber-600'}`}>Booking Reference</p>
              <p className="font-mono font-extrabold text-(--bpa-navy) text-2xl tracking-wider">{confirmedBooking.bookingNumber}</p>
              <p className="text-xs text-gray-500 mt-1">Save this reference — you&apos;ll need it at the clinic.</p>

              {selectedClinic && procedure && (
                <div className={`mt-4 pt-4 border-t text-left text-sm space-y-1 ${isConfirmed ? 'border-emerald-200' : 'border-amber-200'}`}>
                  <div className="flex justify-between">
                    <span className={isConfirmed ? 'text-emerald-700' : 'text-amber-700'}>Service</span>
                    <span className={`font-semibold capitalize ${isConfirmed ? 'text-emerald-900' : 'text-amber-900'}`}>{procedure}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isConfirmed ? 'text-emerald-700' : 'text-amber-700'}>Clinic</span>
                    <span className={`font-semibold ${isConfirmed ? 'text-emerald-900' : 'text-amber-900'}`}>{selectedClinic.branchName}</span>
                  </div>
                  {selectedDate && selectedSlot && (
                    <div className="flex justify-between">
                      <span className={isConfirmed ? 'text-emerald-700' : 'text-amber-700'}>Date &amp; time</span>
                      <span className={`font-semibold ${isConfirmed ? 'text-emerald-900' : 'text-amber-900'}`}>
                        {formatFullDateLabel(selectedDate, 'en', 'short')}, {formatSlotTimeRange(selectedSlot.operationStartAt, selectedSlot.operationEndAt, 'en')}
                      </span>
                    </div>
                  )}
                  <div className={`flex justify-between pt-2 mt-2 border-t ${isConfirmed ? 'border-emerald-200' : 'border-amber-200'}`}>
                    <span className={isConfirmed ? 'text-emerald-700' : 'text-amber-700'}>{isConfirmed ? 'Advance paid' : 'BDT 500 advance'}</span>
                    <span className={`font-bold ${isConfirmed ? 'text-emerald-900' : 'text-amber-900'}`}>
                      {isConfirmed ? formatMoney(confirmedBooking.advancePaidBdt) : `${formatMoney(offer.advanceBdt)} — pending`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isConfirmed ? 'text-emerald-700' : 'text-amber-700'}>Amount due at clinic</span>
                    <span className={isConfirmed ? 'text-emerald-900' : 'text-amber-900'}>{formatMoney(amountDueAtClinic)}</span>
                  </div>
                </div>
              )}
            </div>

            {!isConfirmed && copy.showRetryPayment && (
              <div className="mb-5 flex flex-col items-center gap-2">
                {retryPaymentError && (
                  <div className="w-full text-left"><Alert variant="error" message={retryPaymentError} /></div>
                )}
                <Button type="button" onClick={handleRetryPayment} loading={retryingPayment} disabled={retryingPayment}>
                  Retry Payment
                </Button>
              </div>
            )}

            <div className="flex items-center justify-center gap-4">
              <Link href={`/spay-neuter/${offer.id}`} className="text-sm text-(--bpa-green) hover:underline">
                ← Back to Offer
              </Link>
              <Link href="/profile/bookings" className="text-sm text-gray-500 hover:text-(--bpa-navy) hover:underline">
                My Bookings
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!offer.bookable) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-10">
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <Alert variant="info" title="Not accepting bookings" message="This campaign is not currently open for new bookings." />
          <Link href={`/spay-neuter/${offer.id}`} className="mt-6 inline-flex items-center gap-2 text-sm text-(--bpa-green) hover:underline">
            <ArrowLeft size={14} /> Back to Campaign
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-5">
          <Link href={`/spay-neuter/${offer.id}`} className="inline-flex items-center gap-1 text-sm text-(--bpa-green) hover:underline mb-3">
            <ArrowLeft size={14} /> Back to Campaign
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-(--bpa-navy) leading-tight">{offer.title}</h1>
          {user && <p className="text-xs text-gray-500 mt-1">Signed in as {user.name}</p>}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-(--bpa-green) uppercase tracking-widest">Step {step} / {TOTAL_STEPS}</span>
              <span className="text-xs font-semibold text-(--bpa-navy)">{STEP_LABELS[step - 1]}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div key={i} className={`h-full flex-1 ${i < step ? 'bg-(--bpa-green)' : 'bg-transparent'}`} />
              ))}
            </div>
          </div>

          {error && <div className="mb-5"><Alert variant="error" message={error} /></div>}

          {step === 1 && (
            <div>
              <h2 className="text-base font-bold text-(--bpa-navy) mb-3">Select a Procedure</h2>
              <div className="grid grid-cols-2 gap-3">
                {(['neuter', 'spay'] as SpayProcedure[]).map((proc) => {
                  const sel = procedure === proc;
                  const choice = offer.serviceChoices.find(c => c.code === proc.toUpperCase());
                  if (choice && !choice.enabled) return null;
                  const price = choice?.totalAmount ?? (proc === 'neuter' ? offer.neuterTotalPriceBdt : offer.spayTotalPriceBdt);
                  return (
                    <label
                      key={proc}
                      className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all ${sel ? 'border-(--bpa-green) bg-(--bpa-green-light)' : 'border-gray-200 hover:border-(--bpa-green)/60'}`}
                    >
                      <input type="radio" name="procedure" value={proc} checked={sel} onChange={() => handleProcedureChange(proc)} className="sr-only" />
                      <p className="font-bold text-(--bpa-navy) capitalize">{proc}</p>
                      {/* No pet profile exists at this point in the flow — sex
                          guidance is shown as a fixed, procedure-level label,
                          never inferred from a pet name or record. */}
                      <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
                        {proc === 'spay' ? 'For female cats' : 'For male cats'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{formatMoney(price)}</p>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-base font-bold text-(--bpa-navy) mb-3">Select a Clinic</h2>
              {clinics.length === 0 ? (
                <p className="text-sm text-gray-400">No clinics are currently participating in this campaign.</p>
              ) : (
                <div className="grid gap-3">
                  {clinics.map((c) => {
                    const sel = clinicBranchId === c.clinicBranch.id;
                    return (
                      <button
                        key={c.clinicBranch.id}
                        type="button"
                        onClick={() => handleClinicChange(c.clinicBranch.id)}
                        className={`text-left rounded-xl border-2 p-4 transition-all ${sel ? 'border-(--bpa-green) bg-(--bpa-green-light)' : 'border-gray-200 hover:border-(--bpa-green)/60'}`}
                      >
                        <p className="flex items-center gap-1.5 font-bold text-(--bpa-navy) text-sm">
                          <MapPin size={13} className="text-(--bpa-green)" />{c.clinicBranch.branchName}
                        </p>
                        {c.clinicBranch.address && <p className="text-xs text-gray-500 mt-0.5 ml-5">{c.clinicBranch.address}</p>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-base font-bold text-(--bpa-navy) mb-3">Select a Date &amp; Time</h2>
              <div className="text-sm text-gray-600 mb-3 flex items-start gap-1.5 bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
                <span>
                  {procedure === 'spay'
                    ? 'Spay appointments use an approximately 40-minute allocated slot.'
                    : 'Neuter appointments use an approximately 20-minute allocated slot.'}
                  <span className="block text-gray-500" lang="bn">
                    {procedure === 'spay'
                      ? 'স্পে অ্যাপয়েন্টমেন্টে প্রায় ৪০ মিনিট সময় বরাদ্দ থাকে।'
                      : 'নিউটার অ্যাপয়েন্টমেন্টে প্রায় ২০ মিনিট সময় বরাদ্দ থাকে।'}
                  </span>
                  <span className="block text-gray-400 mt-0.5">This is an estimated slot duration, not a guaranteed surgery or recovery time.</span>
                </span>
              </div>

              {slotResumeNotice && (
                <div className="mb-4">
                  <Alert variant="info" message={slotResumeNotice} />
                </div>
              )}

              {datesLoading ? (
                <p className="text-sm text-gray-400">Loading available dates…</p>
              ) : availableDates.length === 0 ? (
                <p className="text-sm text-gray-400">No available dates for this clinic in the current booking window.</p>
              ) : (
                <div className="flex gap-2.5 overflow-x-auto pb-3 mb-4">
                  {availableDates.map((d) => {
                    const chipEn = formatDateChip(d, 'en');
                    const chipBn = formatDateChip(d, 'bn');
                    const sel = selectedDate === d;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handleDateChange(d)}
                        aria-pressed={sel}
                        aria-label={formatFullDateLabel(d, 'en', 'long')}
                        className={`shrink-0 flex flex-col items-center w-[68px] rounded-xl border-2 py-2.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--bpa-green) focus-visible:ring-offset-1 ${sel ? 'border-(--bpa-green) bg-(--bpa-green) text-white' : 'border-gray-200 hover:border-(--bpa-green)/60'}`}
                      >
                        <span className="text-[10px] font-bold uppercase">{chipEn.weekday}</span>
                        <span className="text-lg font-extrabold">{chipEn.day}</span>
                        <span className="text-[10px] font-semibold">{chipEn.month}</span>
                        <span className={`text-[9px] mt-0.5 ${sel ? 'text-white/70' : 'text-gray-400'}`} lang="bn">
                          {chipBn.weekday}, {chipBn.day}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedDate && (
                slotsLoading ? (
                  <p className="text-sm text-gray-400">Loading time slots…</p>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-gray-400">No time slots are available on this date. Please choose a different date.</p>
                ) : (
                  <div className="space-y-4">
                    {DAY_PERIOD_ORDER.map((period) => {
                      const periodSlots = slots.filter((s) => getDayPeriod(s.operationStartAt) === period);
                      if (periodSlots.length === 0) return null;
                      return (
                        <div key={period}>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">
                            {getDayPeriodLabel(period, 'en')} <span className="normal-case font-normal text-gray-300" lang="bn">/ {getDayPeriodLabel(period, 'bn')}</span>
                          </p>
                          <div className={slotGridClassName()}>
                            {periodSlots.map((s) => {
                              const sel = selectedSlot?.availabilityId === s.availabilityId;
                              const status = getSlotUiStatus(s.bookable, sel);
                              const accessibleLabel = formatSlotAccessibleLabel({
                                dateStr: selectedDate,
                                startAtIso: s.operationStartAt,
                                endAtIso: s.operationEndAt,
                                status,
                                locale: 'en',
                              });
                              const isLowAvailability = s.bookable && s.remaining > 0 && s.remaining <= 2;
                              return (
                                <button
                                  key={s.availabilityId}
                                  type="button"
                                  disabled={!s.bookable}
                                  aria-pressed={sel}
                                  aria-label={accessibleLabel}
                                  aria-disabled={!s.bookable}
                                  onClick={() => handleSlotChange(s)}
                                  className={`rounded-lg border-2 px-2 py-2.5 text-xs font-semibold transition-all text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--bpa-green) focus-visible:ring-offset-1 ${
                                    sel ? 'border-(--bpa-green) bg-(--bpa-green) text-white'
                                      : !s.bookable ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                      : 'border-gray-200 hover:border-(--bpa-green)/60'
                                  }`}
                                >
                                  <span className="block whitespace-nowrap">{formatSlotTimeRange(s.operationStartAt, s.operationEndAt, 'en')}</span>
                                  <span className={`block text-[10px] font-normal mt-1 ${sel ? 'text-white/80' : !s.bookable ? 'text-gray-400' : 'text-gray-400'}`}>
                                    {getSlotStatusLabel(status, 'en')}
                                    {isLowAvailability && !sel && ` · ${s.remaining} left`}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="flex justify-between items-end mb-3">
                <h2 className="text-base font-bold text-(--bpa-navy)">Review &amp; Payment</h2>
                {user && timeLeft !== null && (
                  <div className={`text-xs font-bold px-2 py-1 rounded ${timeLeft < 60 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                    Hold expires in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </div>
                )}
              </div>

              {!user ? (
                <div className="text-center py-8">
                  <Alert variant="info" title="Sign in required" message="Please sign in to secure this time slot and complete your booking." />
                  <Link
                    href={getSignInUrl()}
                    className="mt-6 inline-flex items-center justify-center bg-(--bpa-green) text-white font-bold text-sm px-6 py-3 rounded-xl hover:opacity-90"
                  >
                    Sign in to continue
                  </Link>
                </div>
              ) : (
                <>
                  {(holdState === 'idle' || holdState === 'securing') && (
                    <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
                      <span className="animate-spin h-4 w-4 border-2 border-(--bpa-green) border-t-transparent rounded-full shrink-0" />
                      Securing your selected time slot…
                    </div>
                  )}

                  {holdState === 'failed' && holdError && (
                    <div className="mb-4">
                      <Alert variant="error" message={holdError.message} />
                      {holdError.kind === 'session' ? (
                        <Link href={getSignInUrl()} className="mt-2 inline-block text-sm font-semibold text-(--bpa-green) hover:underline">
                          Sign in again
                        </Link>
                      ) : (
                        <button type="button" onClick={retryHoldCreation} className="mt-2 text-sm font-semibold text-(--bpa-green) hover:underline">
                          Retry
                        </button>
                      )}
                    </div>
                  )}

                  {holdState === 'expired' && (
                    <div className="mb-4">
                      <Alert variant="error" message="This hold has expired." />
                      <div className="mt-2 flex items-center gap-4">
                        <button type="button" onClick={retryHoldCreation} className="text-sm font-semibold text-(--bpa-green) hover:underline">
                          Retry
                        </button>
                        <button
                          type="button"
                          onClick={() => { setError(''); setSelectedSlot(null); setHold(null); setHoldState('idle'); setHoldError(null); setStep(3); }}
                          className="text-sm font-semibold text-gray-500 hover:text-(--bpa-navy)"
                        >
                          Select another time
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Service</span><span className="font-semibold text-(--bpa-navy) capitalize">{procedure}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Clinic</span><span className="font-semibold text-(--bpa-navy)">{selectedClinic?.branchName}</span></div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-gray-500 flex items-center gap-1"><CalendarDays size={12} />Date &amp; time</span>
                      <span className="font-semibold text-(--bpa-navy) text-right flex items-center gap-1">
                        <Clock size={12} className="shrink-0" />
                        {selectedSlot
                          ? `${formatFullDateLabel(selectedDate, 'en', 'short')}, ${formatSlotTimeRange(selectedSlot.operationStartAt, selectedSlot.operationEndAt, 'en')}`
                          : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 mt-2 border-t border-gray-200">
                      <span className="text-gray-500">Total price</span><span className="font-bold text-(--bpa-navy)">{formatMoney(priceBdt)}</span>
                    </div>
                    <div className="flex justify-between"><span className="text-gray-500">Advance (due now)</span><span className="font-bold text-(--bpa-green)">{formatMoney(offer.advanceBdt)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Amount due at clinic</span><span className="text-gray-600">{formatMoney(priceBdt - offer.advanceBdt)}</span></div>
                  </div>

                  <div className="mb-4 p-3 rounded-lg border border-blue-100 bg-blue-50 text-sm text-blue-800 flex items-start gap-2">
                    <Info size={14} className="mt-0.5 shrink-0 text-blue-500" />
                    <span>
                      {procedure === 'spay'
                        ? 'This booking is for a Spay procedure, normally for a female cat.'
                        : 'This booking is for a Neuter procedure, normally for a male cat.'}
                      <span className="block text-blue-600/80" lang="bn">
                        {procedure === 'spay'
                          ? 'এই বুকিংটি স্পে পদ্ধতির জন্য, সাধারণত স্ত্রী বিড়ালের জন্য প্রযোজ্য।'
                          : 'এই বুকিংটি নিউটার পদ্ধতির জন্য, সাধারণত পুরুষ বিড়ালের জন্য প্রযোজ্য।'}
                      </span>
                      <span className="block text-blue-400 mt-0.5">A registered pet profile is not required to complete this booking.</span>
                    </span>
                  </div>

                  <div className="grid gap-3 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Your name</label>
                      <input value={contactName} onChange={(e) => setContactName(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green)" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Mobile number</label>
                      <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green)" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Email (optional)</label>
                      <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green)" />
                    </div>
                  </div>

                  {offer.cancellationPolicy && (
                    <p className="text-xs text-gray-500 mb-3 bg-gray-50 p-3 rounded-lg border border-gray-200">{offer.cancellationPolicy}</p>
                  )}

                  <label className="flex items-start gap-2 text-sm text-gray-600 mb-2 cursor-pointer">
                    <input type="checkbox" checked={consentAccepted} onChange={(e) => setConsentAccepted(e.target.checked)} className="mt-1 rounded text-(--bpa-green) focus:ring-(--bpa-green)" />
                    <span>
                      {CONSENT_TEXT_EN}
                      <span className="block text-gray-400" lang="bn">
                        {CONSENT_TEXT_BN}
                      </span>
                    </span>
                  </label>
                </>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-7 border-t border-gray-100 pt-5">
            {step > 1 ? (
              <button type="button" onClick={prev} className="text-sm font-semibold text-gray-500 hover:text-(--bpa-navy)">← Back</button>
            ) : <span />}

            {step === TOTAL_STEPS && !user ? null : step < TOTAL_STEPS ? (
              <Button type="button" onClick={next}>Continue</Button>
            ) : (
              <div className="flex flex-col items-end gap-1.5">
                <Button
                  type="button"
                  onClick={handleSubmit}
                  loading={submitting}
                  disabled={submitting || !canPay}
                >
                  Pay {formatMoney(offer.advanceBdt)} &amp; Confirm
                </Button>
                {!submitting && user && paymentBlockReason && (
                  <p className="text-xs text-gray-400">{paymentBlockReason}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingWizard(props: BookingWizardProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex justify-center pt-32">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-(--bpa-green) border-t-transparent" />
        </div>
      }
    >
      <SpayBookingPageInner {...props} />
    </Suspense>
  );
}
