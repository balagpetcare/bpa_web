import { apiFetch, apiPost } from '@/lib/api';

export type SpayProcedure = 'neuter' | 'spay';
export type SpayOfferLifecycleState = 'scheduled' | 'active' | 'expired' | 'closed';

export interface SpayOfferClinicBranch {
  clinicBranch: {
    id: string;
    branchName: string;
    slug: string | null;
    address: string | null;
    area: string | null;
    district: string | null;
    published: boolean;
  };
}

export type SpayServiceTypeCode = 'SPAY' | 'NEUTER';

export interface SpayServiceChoice {
  code: SpayServiceTypeCode;
  displayName: string;
  displayNameBn: string;
  totalAmount: number;
  advanceAmount: number;
  remainingAmount: number;
  durationMinutes: number;
  enabled: boolean;
}

export interface SpayOfferGalleryImage {
  id: string;
  mediaId: string;
  url: string;
  altText?: string;
  caption?: string;
  sortOrder: number;
}

export interface SpayOfferVideo {
  id: string;
  videoId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  watchPageUrl: string;
  sortOrder: number;
}

export interface SpayOfferPublic {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  neuterTotalPriceBdt: number;
  spayTotalPriceBdt: number;
  advanceBdt: number;
  eligibilityText: string | null;
  medicalInstructions: string | null;
  fastingRules: string | null;
  cancellationPolicy: string | null;
  medicallyUnfitRefundable: boolean;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  startsAt: string | null;
  endsAt: string | null;
  bookingOpensAt: string | null;
  bookingClosesAt: string | null;
  status: string;
  lifecycleState: SpayOfferLifecycleState;
  bookable: boolean;
  serviceChoices: SpayServiceChoice[];
  mobileImage: { id: string; url: string; altText: string | null } | null;
  webImage: { id: string; url: string; altText: string | null } | null;
  clinics: SpayOfferClinicBranch[];
  galleryImages?: SpayOfferGalleryImage[];
  videos?: SpayOfferVideo[];
}

export interface SpayAvailabilityWindow {
  availabilityId: string;
  clinicBranchId: string;
  procedure: SpayProcedure;
  operationStartAt: string;
  operationEndAt: string;
  operationStartDhaka: string;
  operationEndDhaka: string;
  recommendedArrivalAt: string;
  earliestCheckinAt: string;
  capacity: number;
  remaining: number;
  bookable: boolean;
}

export interface MyPet {
  id: string;
  name: string;
  petType: string;
  species: string;
  breed: string | null;
  gender: string;
  latestWeightKg: number | null;
  dateOfBirth: string | null;
  isNeuteredOrSpayed: boolean | null;
}

export interface CreateHoldPayload {
  offerId: string;
  clinicBranchId: string;
  procedure: SpayProcedure;
  startAt: string;
  idempotencyKey: string;
}

export interface SpayHold {
  id: string;
  offerId: string;
  clinicBranchId: string;
  procedure: SpayProcedure;
  candidateStartAt: string;
  candidateEndAt: string;
  expiresAt: string;
}

export interface CreateBookingPayload {
  holdId: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  // A registered pet is optional for this promotional flow — omit entirely
  // rather than sending an empty string/placeholder id (see
  // lib/spay-neuter/slot-resume.ts / the booking page's Review step).
  externalPetId?: string;
  petNameSnapshot?: string;
  speciesSnapshot?: string;
  sexSnapshot?: string;
  breedSnapshot?: string;
  weightKgSnapshot?: number;
  wasAlreadyNeuteredSnapshot?: boolean;
  consentAccepted: true;
  notes?: string;
  platform: 'web';
}

// 'confirmed' is the ONLY status that means the BDT 500 online advance has
// been verified — every other value (most commonly 'pending_payment') must
// render as "payment pending", never as "Booking Confirmed" (see
// lib/spay-neuter/booking-confirmation.ts, which is the single place that
// decision is made).
export type SpayBookingStatus = 'pending_payment' | 'confirmed' | (string & {});

export interface CreateBookingResult {
  booking: {
    id: string;
    bookingNumber: string;
    bookingCode: string;
    status: SpayBookingStatus;
    totalPriceBdt: number;
    advancePaidBdt: number;
    balanceDueBdt: number;
  };
  paymentUrl: string | null;
  paymentGatewayUnavailable: boolean;
  /** ISO timestamp — the deadline computed server-side (SPAY_PENDING_PAYMENT_MINUTES) after which an unpaid booking is automatically cancelled and the slot released. Null only if the backend didn't return one (older API). */
  paymentDueAt?: string | null;
}

export interface RetryPaymentResult {
  booking: { id: string; bookingNumber: string; status: SpayBookingStatus };
  paymentUrl: string | null;
  paymentDueAt?: string | null;
}

export async function getPublicSpayOffers(fetchOptions?: RequestInit): Promise<SpayOfferPublic[]> {
  const res = await apiFetch<SpayOfferPublic[]>('/public/spay-neuter/offers', fetchOptions);
  return res.data;
}

export async function getPublicSpayOffer(offerId: string, fetchOptions?: RequestInit): Promise<SpayOfferPublic> {
  const res = await apiFetch<SpayOfferPublic>(`/public/spay-neuter/offers/${offerId}`, fetchOptions);
  return res.data;
}

export async function getPublicOfferVideoDetail(offerId: string, videoId: string, fetchOptions?: RequestInit): Promise<SpayOfferVideo> {
  const res = await apiFetch<SpayOfferVideo>(`/public/spay-neuter/offers/${offerId}/videos/${videoId}`, fetchOptions);
  return res.data;
}


export async function getSpayAvailabilityDates(
  clinicBranchId: string,
  procedure: SpayProcedure,
  from: string,
  to: string,
): Promise<string[]> {
  const q = new URLSearchParams({ procedure, from, to });
  const res = await apiFetch<{ dates: string[] }>(`/public/spay-neuter/clinics/${clinicBranchId}/availability/dates?${q}`);
  return res.data.dates;
}

export async function getSpayAvailabilitySlots(
  clinicBranchId: string,
  procedure: SpayProcedure,
  date: string,
): Promise<SpayAvailabilityWindow[]> {
  const q = new URLSearchParams({ procedure, date });
  const res = await apiFetch<SpayAvailabilityWindow[]>(`/public/spay-neuter/clinics/${clinicBranchId}/availability/slots?${q}`);
  return res.data;
}

export async function getMyPetsForBooking(): Promise<MyPet[]> {
  const res = await apiFetch<MyPet[]>('/me/pets');
  return res.data;
}

export async function createSpayHold(payload: CreateHoldPayload, fetchOptions?: RequestInit): Promise<SpayHold> {
  const res = await apiPost<SpayHold>('/me/spay-neuter/holds', payload, {
    ...fetchOptions,
    headers: { 'Idempotency-Key': payload.idempotencyKey, ...fetchOptions?.headers },
  });
  return res.data;
}

export async function createSpayBooking(payload: CreateBookingPayload): Promise<CreateBookingResult> {
  const res = await apiPost<CreateBookingResult>('/me/spay-neuter/bookings', payload);
  return res.data;
}

/** Resumes online payment for a booking still awaiting its BDT 500 advance. Reuses the existing booking (and, once one exists, the existing Payment row) server-side — never creates a second booking. See retrySpayBookingPayment in bpa_api's spay-neuter.booking.service.ts. */
export async function retrySpayBookingPayment(bookingId: string): Promise<RetryPaymentResult> {
  const res = await apiPost<RetryPaymentResult>(`/me/spay-neuter/bookings/${bookingId}/retry-payment`, {});
  return res.data;
}

export interface PublicBookingPaymentStatus {
  bookingNumber: string;
  status: SpayBookingStatus;
  procedure: SpayProcedure;
  clinicName: string;
  scheduledStartAt: string;
  totalPriceBdt: number;
  advancePaidBdt: number;
  balanceDueBdt: number;
}

/**
 * Used only by the EPS-return-redirect verification effect (the browser
 * arriving back with a bookingRef query param after the gateway): the ONLY
 * source of truth for whether "Booking Confirmed" is safe to show — the
 * client never infers payment success from the redirect's own query
 * params/URL shape, only from what the backend reports the booking's
 * status actually is right now. Public + rate-limited on the API side
 * (spayLookupLimiter), output-minimized (no contact info) — see
 * getPublicBookingPaymentStatus in spay-neuter.verification.service.ts.
 */
export async function getPublicBookingPaymentStatus(bookingNumber: string): Promise<PublicBookingPaymentStatus> {
  const res = await apiFetch<PublicBookingPaymentStatus>(`/public/spay-neuter/bookings/payment-status/${encodeURIComponent(bookingNumber)}`);
  return res.data;
}

export type SpayPaymentReturnOutcome = 'verified_success' | 'pending' | 'pending_review' | 'failed' | 'cancelled' | 'not_found';

export interface SpayPaymentReturnStatus {
  outcome: SpayPaymentReturnOutcome;
  // Present on every outcome except not_found — true once no further
  // polling should occur for THIS attempt (verified_success/failed/
  // cancelled); false while genuinely still in flight (pending/pending_review).
  terminal: boolean;
  bookingId: string | null;
  bookingNumber: string | null;
  // Only meaningful while still actually payable (pending/pending_review/
  // failed) — null once confirmed or cancelled (no deadline left to show).
  paymentDueAt: string | null;
  booking?: {
    bookingNumber: string;
    procedure: SpayProcedure;
    clinicName: string;
    scheduledStartAt: string;
    totalPriceBdt: number;
    advancePaidBdt: number;
    balanceDueBdt: number;
  };
  // Present on pending/pending_review/failed — the verified/total/remaining
  // amounts, consistently named with the booking-detail fields above.
  totalPriceBdt?: number;
  advancePaidBdt?: number;
  balanceDueBdt?: number;
  /** Present for pending/failed — the caller's own booking (ownership already verified server-side), usable directly with retrySpayBookingPayment(). Absent for verified_success (nothing left to pay), pending_review (a second attempt during review would only create ambiguity), not_found, and cancelled (cancelSpayBookingPayment has already released the booking's slot, so retrying it would always be refused server-side — see resolveSpayPaymentReturnCopy's 'cancelled' entry). */
  retryableBookingId?: string;
}

/**
 * The ONLY thing /spay-neuter/payment/return is allowed to trust after EPS
 * redirects the browser back. `ref` is the merchantTransactionId the
 * callback router's redirect URL carries (see payment-callbacks.router.ts's
 * getRedirectUrl spay_booking branch) — never a booking UUID, never
 * anything read from this page's own status/success query params.
 * Authenticated (owner-scoped): the API returns the identical 'not_found'
 * outcome both for an unknown ref AND for a ref that belongs to a
 * different signed-in account, so this call can never be used to probe
 * whether another user's payment exists.
 */
export async function getSpayPaymentReturnStatus(ref: string): Promise<SpayPaymentReturnStatus> {
  const res = await apiFetch<SpayPaymentReturnStatus>(`/me/spay-neuter/payments/${encodeURIComponent(ref)}/status`);
  return res.data;
}

// ─── My Bookings (owner-facing list/detail) ──────────────────────────────
//
// Every canonical status the SpayBookingStatus enum can hold (see bpa_api's
// prisma/schema.prisma) — kept in sync deliberately rather than typed as a
// bare `string`, so a label mapping (lib/spay-neuter/booking-status-labels.ts)
// can be exhaustively checked against it at compile time.
export type SpayBookingFullStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'checked_in'
  | 'pre_op_assessment'
  | 'ready_for_operation'
  | 'in_operation'
  | 'completed'
  | 'medically_unfit'
  | 'no_show'
  | 'cancelled_by_owner'
  | 'cancelled_by_clinic'
  | 'refund_pending'
  | 'refunded';

/**
 * The fields the My Bookings list/detail pages actually read, out of the
 * full row GET /me/spay-neuter/bookings[/:id] returns (that endpoint
 * currently sends every SpayBooking column — safe here because it's
 * already ownership-scoped, but this type intentionally only names what
 * this UI uses, not the full row shape, so a future trim of the API
 * response doesn't quietly break unrelated fields nobody reads).
 */
export interface SpayBookingRecord {
  id: string;
  bookingNumber: string;
  bookingCode: string;
  offerId: string;
  procedure: SpayProcedure;
  status: SpayBookingFullStatus;
  clinicNameSnapshot: string;
  clinicAddressSnapshot: string | null;
  scheduledStartAt: string;
  scheduledEndAt: string;
  totalPriceBdt: number;
  advancePaidBdt: number;
  balanceDueBdt: number;
  cancellationPolicySnapshot: string | null;
  cancellationCutoffAt: string;
  // Only ever 'payment_failed' | 'owner_before_cutoff' | 'owner_late' |
  // 'no_show' | 'clinic_cancelled' | 'medically_unfit' | null — see
  // SpayCancellationReasonCode in bpa_api's prisma schema. Typed loosely
  // here (this UI only ever checks it against the single literal
  // 'payment_failed' — see isSlotReleasedUnpaid) so a future enum value
  // doesn't require a type-level change on this page.
  cancellationReasonCode: string | null;
  paymentId: string | null;
  createdAt: string;
  // Server-computed (createdAt + SPAY_PENDING_PAYMENT_MINUTES), present
  // only while status === 'pending_payment' — see withLinkedPaymentStatus
  // in spay-neuter.controller.ts. Never estimate this client-side; null
  // here means "not currently payable", not "unknown".
  paymentDueAt: string | null;
}

/** GET /me/spay-neuter/bookings — owner-scoped (centralAuthUserId filter is applied server-side, never client-supplied), no pagination (the endpoint returns the full list; see the API contract note in the final report). */
export async function listMySpayBookings(): Promise<SpayBookingRecord[]> {
  const res = await apiFetch<SpayBookingRecord[]>('/me/spay-neuter/bookings');
  return res.data;
}

/** GET /me/spay-neuter/bookings/:bookingId — 403 (surfaced as ApiError) if the booking belongs to a different account; the ownership check happens server-side, this call never trusts anything client-supplied beyond the id itself. */
export async function getMySpayBooking(bookingId: string): Promise<SpayBookingRecord> {
  const res = await apiFetch<SpayBookingRecord>(`/me/spay-neuter/bookings/${encodeURIComponent(bookingId)}`);
  return res.data;
}

export async function cancelMySpayBooking(bookingId: string, reason?: string): Promise<SpayBookingRecord> {
  const res = await apiPost<SpayBookingRecord>(`/me/spay-neuter/bookings/${encodeURIComponent(bookingId)}/cancel`, { reason });
  return res.data;
}
