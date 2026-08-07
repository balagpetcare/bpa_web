// Pure, DOM/network-free decision logic for the Spay & Neuter Review &
// Payment step's slot-hold state machine. Extracted so the exact state
// machine (idle -> securing -> active|failed, active -> expired,
// failed/expired -> securing on retry) and its error classification and
// payment-button gating are independently testable without rendering the
// page — the established convention in this repo (see slot-format.ts,
// slot-resume.ts, booking-flow.ts).

import { ApiError, ApiNetworkError } from '@/lib/api';

export type HoldState = 'idle' | 'securing' | 'active' | 'failed' | 'expired';

export type HoldErrorKind = 'session' | 'slot_unavailable' | 'offer_unavailable' | 'validation' | 'network';

export interface HoldErrorInfo {
  kind: HoldErrorKind;
  message: string;
}

const GENERIC_NETWORK_MESSAGE = "We couldn't secure this time slot. Please try again.";
const SLOT_UNAVAILABLE_MESSAGE = 'This time slot is no longer available. Please select another slot.';
const SESSION_MESSAGE = 'Your session needs to be refreshed. Please sign in again to secure this time slot.';

// Codes that can come back from POST /me/spay-neuter/holds meaning "not this
// exact time" — the only correct remedy is picking a different date/time,
// never a bare retry of the same request.
const SLOT_UNAVAILABLE_CODES = new Set([
  'SLOT_UNAVAILABLE',
  'SPAY_SLOT_FULL',
  'SLOT_SERVICE_MISMATCH',
  'SPAY_CLINIC_INACTIVE',
  'SPAY_BEYOND_HORIZON',
  'SPAY_PAST_TIME',
]);

const SESSION_CODES = new Set(['UNAUTHORIZED', 'TOKEN_EXPIRED', 'TOKEN_INVALID']);

/** Maps any error a hold-creation attempt can throw to one of a small, exhaustive set of UI-actionable categories — never left as an unmapped/blank state. */
export function classifyHoldError(err: unknown): HoldErrorInfo {
  if (err instanceof ApiError) {
    if (err.status === 401 || (err.code && SESSION_CODES.has(err.code))) {
      return { kind: 'session', message: SESSION_MESSAGE };
    }
    if (err.code && SLOT_UNAVAILABLE_CODES.has(err.code)) {
      return { kind: 'slot_unavailable', message: SLOT_UNAVAILABLE_MESSAGE };
    }
    if (err.code === 'OFFER_NOT_BOOKABLE') {
      return { kind: 'offer_unavailable', message: err.message || 'This campaign is no longer accepting bookings.' };
    }
    if (err.status === 422 || (err.status === 400 && err.code === 'VALIDATION_ERROR')) {
      let msg = err.message || 'This request could not be validated. Please review your selection.';
      const errData = err.data as { error?: { details?: unknown } } | undefined;
      const details = errData?.error?.details;
      if (Array.isArray(details) && details.length > 0) {
        msg +=
          ' | Details: ' +
          details
            .map((d) => {
              const detail = d as { path?: string; message?: string };
              return `${detail.path} - ${detail.message}`;
            })
            .join(', ');
      }
      return { kind: 'validation', message: msg };
    }
    if (err.status >= 500) {
      return { kind: 'network', message: GENERIC_NETWORK_MESSAGE };
    }
    // Any other unmapped 4xx still needs a concrete, safe, actionable
    // message — never a blank error or a permanently stuck spinner.
    return { kind: 'validation', message: err.message || GENERIC_NETWORK_MESSAGE };
  }
  if (err instanceof ApiNetworkError) {
    return { kind: 'network', message: GENERIC_NETWORK_MESSAGE };
  }
  // A DOMException named "AbortError" is what our own request-timeout (or an
  // explicit abort of a stale attempt) throws — from the user's perspective
  // it's indistinguishable from any other network failure.
  if (err instanceof Error && err.name === 'AbortError') {
    return { kind: 'network', message: GENERIC_NETWORK_MESSAGE };
  }
  return { kind: 'network', message: GENERIC_NETWORK_MESSAGE };
}

/** A hold is expired once its server-issued expiresAt has passed — the only source of truth is the timestamp the server returned, never a client-guessed duration. */
export function isHoldExpired(expiresAt: string | null | undefined, nowMs: number = Date.now()): boolean {
  if (!expiresAt) return false;
  const t = new Date(expiresAt).getTime();
  return Number.isFinite(t) && t <= nowMs;
}

export interface HoldAttemptKeyInput {
  offerId: string;
  clinicBranchId: string;
  procedure: string;
  selectedDate: string;
  slotId: string;
  userId: string;
  idempotencyKey: string;
}

/** One hold attempt per unique (offer, procedure, clinic, date, slot, session, idempotency key) combination — used as a stable identity to decide whether an in-flight/completed attempt is still the one that matches the user's current selection, or is stale and should be ignored/aborted. */
export function computeHoldAttemptKey(input: HoldAttemptKeyInput): string {
  return [input.offerId, input.clinicBranchId, input.procedure, input.selectedDate, input.slotId, input.userId, input.idempotencyKey].join('|');
}

/** The entire re-entrancy guard for hold creation, in one testable function: a new attempt is only warranted when the freshly-computed key differs from whatever attempt is currently recorded. Same key on a rerender (unrelated state change, step navigation, the countdown ticking) => no new attempt; a genuinely different key (procedure/clinic/date/slot/idempotency key changed) => yes. */
export function shouldStartNewHoldAttempt(currentAttemptKey: string | null | undefined, computedKey: string): boolean {
  return currentAttemptKey !== computedKey;
}

export interface PaymentGateInput {
  holdState: HoldState;
  timeLeft: number | null;
  contactName: string;
  contactPhone: string;
  consentAccepted: boolean;
}

/** The single reason (if any) the "Pay & Confirm" button is currently blocked — shown to the user near the button, never left implicit. Empty string means nothing is blocking it. */
export function getPaymentBlockReason(input: PaymentGateInput): string {
  if (input.holdState === 'idle' || input.holdState === 'securing') return 'Securing your time slot…';
  if (input.holdState === 'failed') return 'This time slot could not be secured.';
  if (input.holdState === 'expired' || input.timeLeft === 0) return 'This hold has expired.';
  if (!input.contactName.trim()) return 'Please enter your name.';
  if (!input.contactPhone.trim() || input.contactPhone.trim().length < 7) return 'Please enter a valid mobile number.';
  if (!input.consentAccepted) return 'Please accept the policies.';
  return '';
}

/** Payment is only ever enabled with an active, non-expired hold, valid contact details, and accepted consent — deliberately independent of any pet field. */
export function canSubmitPayment(input: PaymentGateInput): boolean {
  return input.holdState === 'active' && input.timeLeft !== 0 && getPaymentBlockReason(input) === '';
}
