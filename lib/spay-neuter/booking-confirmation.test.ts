import assert from 'node:assert/strict';
import test from 'node:test';
import {
  computeAmountDueAtClinic,
  resolveBookingConfirmationCopy,
  resolveRetryPaymentErrorMessage,
} from './booking-confirmation';

// Regression coverage for the approved online-advance policy: a
// pending_payment booking (including when paymentGatewayUnavailable is
// true) must never render "Booking Confirmed" or tell the customer to pay
// the advance at the clinic — only a verified 'confirmed' status may.

test('1 & 2. pending_payment (including paymentGatewayUnavailable) renders the Payment Pending copy, never "Booking Confirmed"', () => {
  const copy = resolveBookingConfirmationCopy({ status: 'pending_payment' });
  assert.equal(copy.variant, 'pending');
  assert.equal(copy.titleEn, 'Booking Created — Payment Pending');
  assert.doesNotMatch(copy.titleEn, /Booking Confirmed/);
  assert.match(copy.messageEn, /not confirmed until the BDT 500 online advance is paid/);
  assert.match(copy.messageBn, /৫০০ টাকা অগ্রিম/);
  assert.equal(copy.showRetryPayment, true);
});

test('3. no "pay advance at clinic" copy appears anywhere in the pending-state copy (no approved fallback policy exists)', () => {
  const copy = resolveBookingConfirmationCopy({ status: 'pending_payment' });
  assert.doesNotMatch(copy.messageEn.toLowerCase(), /pay.*at the clinic/);
  assert.doesNotMatch(copy.titleEn.toLowerCase(), /pay.*at the clinic/);
});

test('4. a verified "confirmed" status renders the Booking Confirmed copy', () => {
  const copy = resolveBookingConfirmationCopy({ status: 'confirmed' });
  assert.equal(copy.variant, 'confirmed');
  assert.equal(copy.titleEn, 'Booking Confirmed');
  assert.equal(copy.showRetryPayment, false);
  assert.match(copy.messageEn, /BDT 500 online advance payment was successful/);
});

test('every non-confirmed status (not just pending_payment) is treated as pending — cancelled/expired/failed never say Confirmed', () => {
  for (const status of ['cancelled_by_owner', 'cancelled_by_clinic', 'expired', 'failed', 'checked_in', '']) {
    const copy = resolveBookingConfirmationCopy({ status });
    assert.equal(copy.variant, 'pending', `status=${status} must not render as confirmed`);
  }
});

test('Retry Payment is only offered for pending_payment — a cancelled/expired booking (slot already released) must never show Retry', () => {
  for (const status of ['cancelled_by_owner', 'cancelled_by_clinic', 'expired', 'failed', 'checked_in', 'refunded', '']) {
    const copy = resolveBookingConfirmationCopy({ status });
    assert.equal(copy.showRetryPayment, false, `status=${status} must never offer a Retry the server would refuse`);
  }
});

test('7. amount due at clinic: Spay (2200 total, 500 advance) => 1700; Neuter (1500 total, 500 advance) => 1000', () => {
  assert.equal(computeAmountDueAtClinic(2200, 500), 1700);
  assert.equal(computeAmountDueAtClinic(1500, 500), 1000);
});

test('computeAmountDueAtClinic never goes negative even with an inconsistent input', () => {
  assert.equal(computeAmountDueAtClinic(300, 500), 0);
});

test('resolveRetryPaymentErrorMessage maps every documented typed code to a specific, non-generic message', () => {
  const codes = ['PAYMENT_GATEWAY_UNAVAILABLE', 'PAYMENT_INITIATION_FAILED', 'SPAY_PAYMENT_WINDOW_EXPIRED', 'SPAY_BOOKING_NOT_PAYABLE'];
  for (const code of codes) {
    const msg = resolveRetryPaymentErrorMessage(code, 'unused fallback');
    assert.notEqual(msg, 'unused fallback');
    assert.ok(msg.length > 0);
  }
});

test('resolveRetryPaymentErrorMessage falls back to the provided message for an unmapped code, and to a safe default when both are empty', () => {
  assert.equal(resolveRetryPaymentErrorMessage('SOME_UNKNOWN_CODE', 'server-provided detail'), 'server-provided detail');
  assert.equal(resolveRetryPaymentErrorMessage(undefined, ''), 'Could not start the payment. Please try again.');
});
