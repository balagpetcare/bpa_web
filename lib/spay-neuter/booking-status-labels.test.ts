import assert from 'node:assert/strict';
import test from 'node:test';
import {
  resolveBookingStatusLabel,
  isBookingConfirmed,
  isRetryPaymentEligible,
  isOwnerCancellable,
  isSlotReleasedUnpaid,
} from './booking-status-labels';

// Regression coverage for the My Bookings list/detail pages' status
// labeling — the one non-negotiable rule: pending_payment is NEVER shown
// as Confirmed.

test('4. pending_payment renders as "Payment Pending", never "Confirmed"', () => {
  const label = resolveBookingStatusLabel('pending_payment');
  assert.equal(label.labelEn, 'Payment Pending');
  assert.notEqual(label.labelEn, 'Confirmed');
  assert.equal(isBookingConfirmed('pending_payment'), false);
});

test('10. Bengali and English labels both render for every canonical status', () => {
  const statuses = [
    'pending_payment', 'confirmed', 'checked_in', 'pre_op_assessment', 'ready_for_operation',
    'in_operation', 'completed', 'medically_unfit', 'no_show', 'cancelled_by_owner',
    'cancelled_by_clinic', 'refund_pending', 'refunded',
  ] as const;
  for (const status of statuses) {
    const label = resolveBookingStatusLabel(status);
    assert.ok(label.labelEn.length > 0, `missing English label for ${status}`);
    assert.ok(label.labelBn.length > 0, `missing Bengali label for ${status}`);
    assert.notEqual(label.labelEn, label.labelBn); // sanity: not accidentally the same string
  }
});

test('only "confirmed" is ever treated as a confirmed booking', () => {
  assert.equal(isBookingConfirmed('confirmed'), true);
  for (const status of ['pending_payment', 'cancelled_by_owner', 'cancelled_by_clinic', 'completed', 'checked_in', 'no_show', 'refunded'] as const) {
    assert.equal(isBookingConfirmed(status), false, `${status} must not be treated as confirmed`);
  }
});

test('a pending_payment booking past its payment deadline is labeled Expired, not Payment Pending', () => {
  const now = Date.parse('2026-08-06T12:00:00.000Z');
  const pastDue = '2026-08-06T11:00:00.000Z'; // 1h in the past relative to `now`
  const label = resolveBookingStatusLabel('pending_payment', pastDue, now);
  assert.equal(label.labelEn, 'Expired');
});

test('a pending_payment booking still within its window is labeled Payment Pending', () => {
  const now = Date.parse('2026-08-06T12:00:00.000Z');
  const stillOpen = '2026-08-06T12:30:00.000Z'; // 30min in the future
  const label = resolveBookingStatusLabel('pending_payment', stillOpen, now);
  assert.equal(label.labelEn, 'Payment Pending');
});

test('confirmed/cancelled/completed statuses are never reinterpreted as Expired even with a stale paymentDueAt', () => {
  const now = Date.parse('2026-08-06T12:00:00.000Z');
  const longPastDue = '2020-01-01T00:00:00.000Z';
  assert.equal(resolveBookingStatusLabel('confirmed', longPastDue, now).labelEn, 'Confirmed');
  assert.equal(resolveBookingStatusLabel('cancelled_by_owner', longPastDue, now).labelEn, 'Cancelled');
  assert.equal(resolveBookingStatusLabel('completed', longPastDue, now).labelEn, 'Completed');
});

test('5. Retry Payment is only eligible for pending_payment within the window — never for confirmed/cancelled/completed', () => {
  const now = Date.parse('2026-08-06T12:00:00.000Z');
  assert.equal(isRetryPaymentEligible('pending_payment', '2026-08-06T12:30:00.000Z', now), true);
  assert.equal(isRetryPaymentEligible('pending_payment', '2026-08-06T11:00:00.000Z', now), false); // expired
  assert.equal(isRetryPaymentEligible('confirmed', undefined, now), false);
  assert.equal(isRetryPaymentEligible('cancelled_by_owner', undefined, now), false);
  assert.equal(isRetryPaymentEligible('completed', undefined, now), false);
});

test('owner-cancel is only offered for pending_payment and confirmed bookings', () => {
  assert.equal(isOwnerCancellable('pending_payment'), true);
  assert.equal(isOwnerCancellable('confirmed'), true);
  for (const status of ['completed', 'cancelled_by_owner', 'cancelled_by_clinic', 'no_show', 'refunded'] as const) {
    assert.equal(isOwnerCancellable(status), false, `${status} must not offer Cancel`);
  }
});

test('isSlotReleasedUnpaid: true only for a cancelled_by_owner/cancelled_by_clinic booking whose advance was never paid (payment_failed reason)', () => {
  assert.equal(isSlotReleasedUnpaid('cancelled_by_owner', 'payment_failed'), true);
  assert.equal(isSlotReleasedUnpaid('cancelled_by_clinic', 'payment_failed'), true);
});

test('isSlotReleasedUnpaid: false for an explicit owner/clinic cancellation unrelated to payment — never confused with a released, unpaid slot', () => {
  assert.equal(isSlotReleasedUnpaid('cancelled_by_owner', 'owner_before_cutoff'), false);
  assert.equal(isSlotReleasedUnpaid('cancelled_by_owner', 'owner_late'), false);
  assert.equal(isSlotReleasedUnpaid('cancelled_by_clinic', 'clinic_cancelled'), false);
  assert.equal(isSlotReleasedUnpaid('cancelled_by_owner', null), false);
});

test('isSlotReleasedUnpaid: false while still pending_payment — a live attempt failing/cancelling never releases the slot (see isRetryPaymentEligible instead)', () => {
  assert.equal(isSlotReleasedUnpaid('pending_payment', 'payment_failed'), false);
  assert.equal(isSlotReleasedUnpaid('confirmed', null), false);
  assert.equal(isSlotReleasedUnpaid('completed', null), false);
});
