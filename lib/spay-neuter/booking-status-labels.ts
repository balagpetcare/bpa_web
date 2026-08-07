// Pure, DOM/network-free status-label logic for the My Bookings list/detail
// pages. Extracted (same convention as hold-state.ts, booking-confirmation.ts)
// so the mapping from the raw SpayBookingStatus enum to the six user-facing
// labels the product spec requires — Payment Pending, Confirmed, Cancelled,
// Expired, Completed, Pending Review — is exhaustively checked and testable
// without rendering a page. The one rule this whole module exists to
// enforce: a pending_payment booking is NEVER labeled Confirmed.

import type { SpayBookingFullStatus } from '@/lib/api/spay-neuter';
import { CLINIC_TIME_ZONE, formatClockTime } from './slot-format';

export type BookingStatusLabelKey = 'payment_pending' | 'confirmed' | 'cancelled' | 'expired' | 'completed' | 'pending_review';

export interface BookingStatusLabel {
  key: BookingStatusLabelKey;
  labelEn: string;
  labelBn: string;
  /** Tailwind-ish color bucket for the pill — not a design system, just three buckets so callers don't hardcode colors per raw status. */
  tone: 'success' | 'warning' | 'error' | 'neutral';
}

const LABELS: Record<BookingStatusLabelKey, BookingStatusLabel> = {
  payment_pending: { key: 'payment_pending', labelEn: 'Payment Pending', labelBn: 'পেমেন্ট বাকি', tone: 'warning' },
  confirmed: { key: 'confirmed', labelEn: 'Confirmed', labelBn: 'নিশ্চিত', tone: 'success' },
  cancelled: { key: 'cancelled', labelEn: 'Cancelled', labelBn: 'বাতিল', tone: 'error' },
  expired: { key: 'expired', labelEn: 'Expired', labelBn: 'মেয়াদোত্তীর্ণ', tone: 'error' },
  completed: { key: 'completed', labelEn: 'Completed', labelBn: 'সম্পন্ন', tone: 'neutral' },
  pending_review: { key: 'pending_review', labelEn: 'Pending Review', labelBn: 'পর্যালোচনাধীন', tone: 'warning' },
};

// Every clinic-workflow-in-progress status (checked in through refund
// handling) is deliberately bucketed as "Pending Review" — the six labels
// required by the spec are a fixed, small set; a customer-facing booking
// list is not the place to explain "ready_for_operation" vs "in_operation"
// distinctions, which the clinic dashboard already covers.
const STATUS_TO_LABEL_KEY: Record<SpayBookingFullStatus, BookingStatusLabelKey> = {
  pending_payment: 'payment_pending', // overridden to 'expired' by resolveBookingStatusLabel when the payment window has passed — see below
  confirmed: 'confirmed',
  checked_in: 'pending_review',
  pre_op_assessment: 'pending_review',
  ready_for_operation: 'pending_review',
  in_operation: 'pending_review',
  completed: 'completed',
  medically_unfit: 'pending_review',
  no_show: 'pending_review',
  cancelled_by_owner: 'cancelled',
  cancelled_by_clinic: 'cancelled',
  refund_pending: 'pending_review',
  refunded: 'pending_review',
};

/**
 * `paymentDueAt` (ISO) is required only to detect the one case the raw
 * enum can't represent on its own: a `pending_payment` booking whose
 * payment window has already elapsed (see SPAY_PENDING_PAYMENT_MINUTES /
 * computePaymentDueAt in bpa_api's spay-neuter.domain.ts) but that the
 * background cleanup job hasn't swept yet — still `pending_payment` in the
 * database, but no longer something "Retry Payment" can act on, so it must
 * never be shown as an ordinary Payment Pending booking. Every other
 * status maps directly; passing `nowMs` makes this testable without real
 * timers.
 */
export function resolveBookingStatusLabel(
  status: SpayBookingFullStatus,
  paymentDueAt?: string | null,
  nowMs: number = Date.now(),
): BookingStatusLabel {
  if (status === 'pending_payment' && paymentDueAt) {
    const due = new Date(paymentDueAt).getTime();
    if (Number.isFinite(due) && due <= nowMs) return LABELS.expired;
  }
  return LABELS[STATUS_TO_LABEL_KEY[status]];
}

/** True only for the raw statuses that represent a genuinely confirmed booking — the single predicate every "is this booking confirmed" check in the UI must go through, so pending_payment (or anything else) can never be mistaken for it. */
export function isBookingConfirmed(status: SpayBookingFullStatus): boolean {
  return status === 'confirmed';
}

/** Whether the booking is still within its BDT 500 payment window and Retry Payment should be offered — pending_payment AND not yet past paymentDueAt. */
export function isRetryPaymentEligible(
  status: SpayBookingFullStatus,
  paymentDueAt?: string | null,
  nowMs: number = Date.now(),
): boolean {
  if (status !== 'pending_payment') return false;
  if (!paymentDueAt) return true; // no deadline known — server will still authoritatively reject if actually expired
  const due = new Date(paymentDueAt).getTime();
  return !(Number.isFinite(due) && due <= nowMs);
}

/** Whether the owner-cancel action should be offered at all — mirrors bpa_api's NON_CANCELLABLE_STATUSES gate loosely (the API remains the final authority; this only avoids showing a button that will always be rejected). */
export function isOwnerCancellable(status: SpayBookingFullStatus): boolean {
  return status === 'pending_payment' || status === 'confirmed';
}

/**
 * True once the slot has genuinely been released with the advance never
 * paid — either the payment-deadline job (expireStalePendingPaymentBooking)
 * or an explicit cancellation, both of which land on cancelled_by_owner/
 * cancelled_by_clinic with cancellationReasonCode 'payment_failed' (see
 * bpa_api's SpayCancellationReasonCode). Retry Payment can never apply here
 * (isRetryPaymentEligible is false), and neither can Reschedule — bpa_api's
 * rescheduleBooking only accepts pending_payment/confirmed bookings, and
 * this web app has no reschedule UI at all (only the mobile app does) — so
 * the only path back is a brand new booking on the same offer.
 */
export function isSlotReleasedUnpaid(status: SpayBookingFullStatus, cancellationReasonCode: string | null): boolean {
  return (status === 'cancelled_by_owner' || status === 'cancelled_by_clinic') && cancellationReasonCode === 'payment_failed';
}

// computeAmountDueAtClinic already exists in ./booking-confirmation.ts
// (totalPriceBdt - advanceBdt, floored at 0) — reused from there rather
// than duplicated here.

/** "9 Aug 2026, 9:00 AM" (en) / Bengali equivalent — the one human-readable date+time format the My Bookings list/detail pages use for scheduledStartAt. Never a raw ISO string, never "Invalid Date". */
export function formatBookingDateTime(iso: string | null | undefined, locale: 'en' | 'bn'): string {
  const d = iso ? new Date(iso) : null;
  if (!d || Number.isNaN(d.getTime())) return locale === 'bn' ? 'তারিখ পাওয়া যায়নি' : 'Date unavailable';
  const loc = locale === 'bn' ? 'bn-BD' : 'en-GB';
  const datePart = new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'short', year: 'numeric', timeZone: CLINIC_TIME_ZONE }).format(d);
  return `${datePart}, ${formatClockTime(iso, locale)}`;
}
