import assert from 'node:assert/strict';
import test from 'node:test';
import {
  resolveSpayPaymentReturnCopy,
  shouldContinuePolling,
  PENDING_POLL_MAX_ATTEMPTS,
} from './payment-return';

// Regression coverage for the /spay-neuter/payment/return page — the
// dedicated landing page that replaces the old "redirected to Community Pet
// Care membership lookup" bug for Spay & Neuter EPS payments.

test('6. verified_success renders "Booking Confirmed" copy and offers neither retry nor refresh (nothing left to do)', () => {
  const copy = resolveSpayPaymentReturnCopy('verified_success');
  assert.equal(copy.titleEn, 'Booking Confirmed');
  assert.equal(copy.variant, 'success');
  assert.equal(copy.showRetryPayment, false);
  assert.equal(copy.showRefreshStatus, false);
});

test('7. pending renders "Verifying Payment" copy and offers Refresh Status, never Retry Payment', () => {
  const copy = resolveSpayPaymentReturnCopy('pending');
  assert.equal(copy.titleEn, 'Verifying Payment');
  assert.equal(copy.variant, 'pending');
  assert.equal(copy.showRefreshStatus, true);
  assert.equal(copy.showRetryPayment, false);
});

test('8. failed and cancelled both render as unconfirmed, never success copy', () => {
  for (const outcome of ['failed', 'cancelled'] as const) {
    const copy = resolveSpayPaymentReturnCopy(outcome);
    assert.notEqual(copy.titleEn, 'Booking Confirmed');
    assert.equal(copy.variant, 'error');
  }
});

test('failed offers Retry Payment — the booking is still pending_payment and genuinely resumable', () => {
  const copy = resolveSpayPaymentReturnCopy('failed');
  assert.equal(copy.showRetryPayment, true);
});

test('cancelled never offers Retry Payment — this outcome is only reached once the booking/slot itself has been released (payment-deadline expiry or an explicit cancellation), so retrying would always be refused server-side (SPAY_BOOKING_NOT_PAYABLE)', () => {
  const copy = resolveSpayPaymentReturnCopy('cancelled');
  assert.equal(copy.showRetryPayment, false);
});

test('10. not_found renders a safe generic message that never confirms or denies another user\'s payment exists', () => {
  const copy = resolveSpayPaymentReturnCopy('not_found');
  assert.equal(copy.variant, 'error');
  assert.equal(copy.showRetryPayment, false);
  assert.equal(copy.showRefreshStatus, false);
  assert.doesNotMatch(copy.messageEn.toLowerCase(), /belongs to|another account|different user/);
});

test('polling only continues for the "pending"/"pending_review" outcomes, and only up to the fixed attempt budget', () => {
  assert.equal(shouldContinuePolling('pending', 0), true);
  assert.equal(shouldContinuePolling('pending', PENDING_POLL_MAX_ATTEMPTS - 1), true);
  assert.equal(shouldContinuePolling('pending', PENDING_POLL_MAX_ATTEMPTS), false); // budget exhausted — must stop auto-polling
  assert.equal(shouldContinuePolling('pending_review', 0), true);
  assert.equal(shouldContinuePolling('pending_review', PENDING_POLL_MAX_ATTEMPTS), false);
  assert.equal(shouldContinuePolling('verified_success', 0), false);
  assert.equal(shouldContinuePolling('failed', 0), false);
  assert.equal(shouldContinuePolling('cancelled', 0), false);
  assert.equal(shouldContinuePolling('not_found', 0), false);
});

test('pending_review renders a distinct "under review" copy — never plain "Verifying Payment", never Retry, but still offers Refresh Status', () => {
  const copy = resolveSpayPaymentReturnCopy('pending_review');
  assert.equal(copy.titleEn, 'Payment Under Review');
  assert.notEqual(copy.titleEn, resolveSpayPaymentReturnCopy('pending').titleEn);
  assert.equal(copy.variant, 'pending');
  assert.equal(copy.showRetryPayment, false);
  assert.equal(copy.showRefreshStatus, true);
});

test('pending_review copy never implies failure or claims a false success', () => {
  const copy = resolveSpayPaymentReturnCopy('pending_review');
  assert.notEqual(copy.titleEn, 'Booking Confirmed');
  assert.doesNotMatch(copy.messageEn.toLowerCase(), /\bfailed\b|error|could not/);
});
