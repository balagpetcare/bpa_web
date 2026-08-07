// Pure, DOM/network-free decision logic for the /spay-neuter/payment/return
// page — the dedicated landing page a Spay & Neuter EPS payment now redirects
// to (see bpa_api's payment-callbacks.router.ts getRedirectUrl's spay_booking
// branch), replacing the old behavior where the generic /payment/success
// page's own fallback sent every bookingless success to the Community Pet
// Care membership-purchase lookup. Extracted so the outcome-to-copy mapping
// and the poll-budget logic are testable without rendering the page.

import type { SpayPaymentReturnOutcome } from '@/lib/api/spay-neuter';

export interface SpayPaymentReturnCopy {
  titleEn: string;
  messageEn: string;
  variant: 'success' | 'pending' | 'error';
  showRetryPayment: boolean;
  showRefreshStatus: boolean;
}

const COPY: Record<SpayPaymentReturnOutcome, SpayPaymentReturnCopy> = {
  verified_success: {
    titleEn: 'Booking Confirmed',
    messageEn: 'Your BDT 500 online advance payment was verified successfully.',
    variant: 'success',
    showRetryPayment: false,
    showRefreshStatus: false,
  },
  pending: {
    titleEn: 'Verifying Payment',
    messageEn: 'We are confirming your payment with the gateway. This can take a few moments.',
    variant: 'pending',
    showRetryPayment: false,
    showRefreshStatus: true,
  },
  // Distinct from 'pending': EPS has explicitly flagged the last attempt
  // for manual review — a genuinely different situation from "no signal
  // yet" and must read that way, never as an ordinary in-flight check.
  // Retry Payment is deliberately not offered while a review is in
  // progress (a second attempt would only create ambiguity for whoever is
  // reviewing the first one).
  pending_review: {
    titleEn: 'Payment Under Review',
    messageEn: 'The payment provider is running a routine manual check on this payment. Your booking has not been declined — we will update it as soon as the check completes.',
    variant: 'pending',
    showRetryPayment: false,
    showRefreshStatus: true,
  },
  failed: {
    titleEn: 'Payment Was Not Completed',
    messageEn: 'Your BDT 500 advance payment could not be completed. Your booking has not been confirmed.',
    variant: 'error',
    showRetryPayment: true,
    showRefreshStatus: false,
  },
  cancelled: {
    titleEn: 'Payment Cancelled',
    // A routine EPS Cancel on a live attempt does NOT reach this outcome —
    // getOwnedSpayPaymentReturnStatus reports that as 'failed' (with
    // retryableBookingId) instead, since cancelSpayBookingPayment (bpa_api)
    // only ever terminates the attempt, never the booking, while it's still
    // within its payment deadline. This 'cancelled' outcome is reached only
    // once the booking/slot itself has actually been released — the
    // payment-deadline job or an explicit cancellation — so there is
    // nothing left to retry; the copy below points the user at booking
    // again rather than offering a Retry Payment button that can never
    // succeed.
    messageEn: 'This booking is no longer available — its slot was released. Please make a new booking to try again.',
    variant: 'error',
    showRetryPayment: false,
    showRefreshStatus: false,
  },
  not_found: {
    // Deliberately generic — never confirms or denies whether a payment
    // reference exists for someone else's account (see the API's
    // getOwnedSpayPaymentReturnStatus docstring: 'not_found' is returned
    // identically for "unknown ref" and "belongs to a different user").
    titleEn: 'Payment Reference Not Found',
    messageEn: "We couldn't find a payment matching this reference on your account. If you completed a payment, check My Bookings or contact support with your booking reference.",
    variant: 'error',
    showRetryPayment: false,
    showRefreshStatus: false,
  },
};

export function resolveSpayPaymentReturnCopy(outcome: SpayPaymentReturnOutcome): SpayPaymentReturnCopy {
  return COPY[outcome];
}

// ─── Bounded auto-poll for the 'pending' outcome ─────────────────────────
//
// "automatically poll safely for a limited time" — never indefinitely (a
// tab left open on a permanently-broken verification must not poll
// forever), and always with a fixed, predictable cadence so a test can
// assert on it without depending on real timers.
export const PENDING_POLL_INTERVAL_MS = 3000;
export const PENDING_POLL_MAX_ATTEMPTS = 10; // 10 * 3s = 30s of automatic polling before falling back to a manual "Refresh Status" click

/** True while automatic polling should continue for a still-in-flight outcome ('pending' or 'pending_review') — false once the attempt budget is exhausted (manual Refresh Status remains available regardless). */
export function shouldContinuePolling(outcome: SpayPaymentReturnOutcome, attemptCount: number): boolean {
  return (outcome === 'pending' || outcome === 'pending_review') && attemptCount < PENDING_POLL_MAX_ATTEMPTS;
}
