import assert from 'node:assert/strict';
import test from 'node:test';
import { ApiError, ApiNetworkError } from '@/lib/api';
import {
  canSubmitPayment,
  classifyHoldError,
  computeHoldAttemptKey,
  getPaymentBlockReason,
  isHoldExpired,
  shouldStartNewHoldAttempt,
} from './hold-state';

const BASE_KEY_INPUT = {
  offerId: 'offer-1',
  clinicBranchId: 'clinic-1',
  procedure: 'neuter',
  selectedDate: '2026-08-09',
  slotId: 'slot-1',
  userId: 'user-1',
  idempotencyKey: 'idem-1',
};

test('3. 401 stops the spinner and triggers safe authentication handling: session error is a distinct, actionable category', () => {
  const info = classifyHoldError(new ApiError(401, 'No token provided', undefined, 'UNAUTHORIZED'));
  assert.equal(info.kind, 'session');
  assert.match(info.message, /sign in/i);

  const expired = classifyHoldError(new ApiError(401, 'Token expired', undefined, 'TOKEN_EXPIRED'));
  assert.equal(expired.kind, 'session');
});

test('4. 409-shaped SLOT_UNAVAILABLE/SPAY_SLOT_FULL/SLOT_SERVICE_MISMATCH all classify as slot_unavailable, regardless of literal HTTP status', () => {
  // The real backend actually returns SLOT_UNAVAILABLE as a 400 and
  // SPAY_SLOT_FULL as a 409 (see spay-neuter.hold.service.ts) — classification
  // here is deliberately keyed on the stable error CODE, never the raw
  // status, which is why both collapse into the same remedy.
  assert.equal(classifyHoldError(new ApiError(400, 'x', undefined, 'SLOT_UNAVAILABLE')).kind, 'slot_unavailable');
  assert.equal(classifyHoldError(new ApiError(409, 'x', undefined, 'SPAY_SLOT_FULL')).kind, 'slot_unavailable');
  assert.equal(classifyHoldError(new ApiError(400, 'x', undefined, 'SLOT_SERVICE_MISMATCH')).kind, 'slot_unavailable');
  const info = classifyHoldError(new ApiError(409, 'x', undefined, 'SPAY_SLOT_FULL'));
  assert.match(info.message, /no longer available/i);
});

test('5. 422 validation error surfaces the server-supplied safe message', () => {
  const info = classifyHoldError(new ApiError(422, 'startAt must be a valid ISO date', undefined, 'VALIDATION_ERROR'));
  assert.equal(info.kind, 'validation');
  assert.equal(info.message, 'startAt must be a valid ISO date');
});

test('6. network timeout (AbortError) exposes a network-classified, retry-eligible failure', () => {
  const abortErr = new DOMException('The operation was aborted', 'AbortError');
  const info = classifyHoldError(abortErr);
  assert.equal(info.kind, 'network');
  assert.match(info.message, /try again/i);
});

test('7. a 500 response never leaves the state unmapped — it classifies as network/retry, same as a connection failure', () => {
  const info500 = classifyHoldError(new ApiError(500, 'boom', undefined, 'INTERNAL_ERROR'));
  assert.equal(info500.kind, 'network');
  const infoNetwork = classifyHoldError(new ApiNetworkError());
  assert.equal(infoNetwork.kind, 'network');
  assert.equal(info500.message, infoNetwork.message);
});

test('an unrecognized error value never throws and always resolves to a concrete, actionable category', () => {
  assert.equal(classifyHoldError(undefined).kind, 'network');
  assert.equal(classifyHoldError('a plain string').kind, 'network');
  assert.equal(classifyHoldError(new Error('generic')).kind, 'network');
});

test('OFFER_NOT_BOOKABLE is a distinct category from a bad-slot pick, with the server message passed through', () => {
  const info = classifyHoldError(new ApiError(400, 'This offer is not open for booking', undefined, 'OFFER_NOT_BOOKABLE'));
  assert.equal(info.kind, 'offer_unavailable');
  assert.equal(info.message, 'This offer is not open for booking');
});

test('a hold is expired exactly when its server-issued expiresAt is at/before now — never a client-guessed duration', () => {
  const now = Date.parse('2026-08-09T09:20:00.000Z');
  assert.equal(isHoldExpired('2026-08-09T09:19:59.000Z', now), true);
  assert.equal(isHoldExpired('2026-08-09T09:20:00.000Z', now), true);
  assert.equal(isHoldExpired('2026-08-09T09:20:01.000Z', now), false);
  assert.equal(isHoldExpired(null, now), false);
  assert.equal(isHoldExpired(undefined, now), false);
});

test('8. an unrelated rerender (same booking context) never starts a new hold attempt', () => {
  const key = computeHoldAttemptKey(BASE_KEY_INPUT);
  // Simulates the effect re-running because e.g. a contact field changed —
  // the computed key is identical, so no new attempt is warranted.
  assert.equal(shouldStartNewHoldAttempt(key, key), false);
});

test('9. changing the selected slot changes the attempt key, so the old (now-stale) request is recognized as superseded', () => {
  const original = computeHoldAttemptKey(BASE_KEY_INPUT);
  const afterSlotChange = computeHoldAttemptKey({ ...BASE_KEY_INPUT, slotId: 'slot-2' });
  assert.notEqual(original, afterSlotChange);
  assert.equal(shouldStartNewHoldAttempt(original, afterSlotChange), true);
});

test('10. the idempotency key is one of the identity components — an unchanged key across an unrelated rerender keeps the same attempt identity', () => {
  const first = computeHoldAttemptKey(BASE_KEY_INPUT);
  const second = computeHoldAttemptKey({ ...BASE_KEY_INPUT }); // same fields, same idempotencyKey
  assert.equal(first, second);
});

test('changing procedure, clinic, or date each independently changes the attempt key (a fresh idempotency key is generated alongside each in the page, but the key components alone already differ)', () => {
  const base = computeHoldAttemptKey(BASE_KEY_INPUT);
  assert.notEqual(base, computeHoldAttemptKey({ ...BASE_KEY_INPUT, procedure: 'spay' }));
  assert.notEqual(base, computeHoldAttemptKey({ ...BASE_KEY_INPUT, clinicBranchId: 'clinic-2' }));
  assert.notEqual(base, computeHoldAttemptKey({ ...BASE_KEY_INPUT, selectedDate: '2026-08-10' }));
});

test('12. the payment button is blocked with an explicit reason while a hold is idle/securing', () => {
  assert.equal(getPaymentBlockReason({ holdState: 'idle', timeLeft: null, contactName: 'A', contactPhone: '01711111111', consentAccepted: true }), 'Securing your time slot…');
  assert.equal(getPaymentBlockReason({ holdState: 'securing', timeLeft: null, contactName: 'A', contactPhone: '01711111111', consentAccepted: true }), 'Securing your time slot…');
  assert.equal(canSubmitPayment({ holdState: 'securing', timeLeft: null, contactName: 'A', contactPhone: '01711111111', consentAccepted: true }), false);
});

test('13. the payment button enables only once the hold is active AND consent is checked AND contact fields are valid', () => {
  const active = { holdState: 'active' as const, timeLeft: 120, contactName: 'Jane', contactPhone: '01711111111', consentAccepted: true };
  assert.equal(canSubmitPayment(active), true);
  assert.equal(getPaymentBlockReason(active), '');

  assert.equal(canSubmitPayment({ ...active, consentAccepted: false }), false);
  assert.equal(getPaymentBlockReason({ ...active, consentAccepted: false }), 'Please accept the policies.');

  assert.equal(canSubmitPayment({ ...active, contactPhone: '123' }), false);
  assert.equal(getPaymentBlockReason({ ...active, contactPhone: '123' }), 'Please enter a valid mobile number.');

  assert.equal(canSubmitPayment({ ...active, contactName: '' }), false);
  assert.equal(getPaymentBlockReason({ ...active, contactName: '  ' }), 'Please enter your name.');
});

test('16. an expired hold always blocks payment, even if every other field is valid', () => {
  const input = { holdState: 'expired' as const, timeLeft: 0, contactName: 'Jane', contactPhone: '01711111111', consentAccepted: true };
  assert.equal(canSubmitPayment(input), false);
  assert.equal(getPaymentBlockReason(input), 'This hold has expired.');

  // Also true if holdState hasn't caught up to 'expired' yet but timeLeft already hit zero.
  const raceInput = { holdState: 'active' as const, timeLeft: 0, contactName: 'Jane', contactPhone: '01711111111', consentAccepted: true };
  assert.equal(canSubmitPayment(raceInput), false);
});

test('a failed hold blocks payment with its own distinct reason, not the generic securing message', () => {
  const input = { holdState: 'failed' as const, timeLeft: null, contactName: 'Jane', contactPhone: '01711111111', consentAccepted: true };
  assert.equal(canSubmitPayment(input), false);
  assert.equal(getPaymentBlockReason(input), 'This time slot could not be secured.');
});
