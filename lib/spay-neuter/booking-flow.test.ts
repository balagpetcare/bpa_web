import assert from 'node:assert/strict';
import test from 'node:test';
import { BOOKING_STEP_LABELS, CONSENT_TEXT_BN, CONSENT_TEXT_EN, TOTAL_BOOKING_STEPS, buildBookingPayload, buildBookingReturnQuery } from './booking-flow';

test('1. the booking wizard has exactly four user-facing steps', () => {
  assert.equal(TOTAL_BOOKING_STEPS, 4);
  assert.equal(BOOKING_STEP_LABELS.length, 4);
});

test('2. there is no Select Pet step anywhere in the step labels', () => {
  const labels = BOOKING_STEP_LABELS.map((l) => l.toLowerCase());
  assert.ok(!labels.some((l) => l.includes('pet')));
  assert.deepEqual(BOOKING_STEP_LABELS, ['Procedure', 'Clinic', 'Date & Time', 'Review & Payment']);
});

test('3. a signed-in user with zero registered pets can still build a complete, valid booking payload', () => {
  const payload = buildBookingPayload({
    holdId: 'hold-1',
    contactName: 'Jane Doe',
    contactPhone: '01711111111',
    contactEmail: '',
  });
  assert.equal(payload.holdId, 'hold-1');
  assert.equal(payload.contactName, 'Jane Doe');
  assert.equal(payload.consentAccepted, true);
  assert.equal(payload.platform, 'web');
});

test('12. no placeholder UUID or empty pet id is ever submitted — externalPetId is entirely absent from the payload, not set to undefined/empty string', () => {
  const payload = buildBookingPayload({
    holdId: 'hold-1',
    contactName: 'Jane Doe',
    contactPhone: '01711111111',
    contactEmail: '',
  });
  assert.equal('externalPetId' in payload, false);
  assert.equal(Object.keys(payload).includes('externalPetId'), false);
});

test('contact fields are trimmed, and a blank email becomes undefined rather than an empty string', () => {
  const payload = buildBookingPayload({
    holdId: 'hold-1',
    contactName: '  Jane Doe  ',
    contactPhone: '  01711111111  ',
    contactEmail: '   ',
  });
  assert.equal(payload.contactName, 'Jane Doe');
  assert.equal(payload.contactPhone, '01711111111');
  assert.equal(payload.contactEmail, undefined);
});

test('7. the login-return query carries service/clinic/date/slot but has no pet-related parameter, however it is constructed', () => {
  const q = buildBookingReturnQuery({
    procedure: 'neuter',
    clinicBranchId: 'clinic-1',
    selectedDate: '2026-08-09',
    slotId: 'slot-1',
  });
  assert.equal(q.get('service'), 'neuter');
  assert.equal(q.get('clinic'), 'clinic-1');
  assert.equal(q.get('date'), '2026-08-09');
  assert.equal(q.get('slot'), 'slot-1');
  // There is no petId/externalPetId concept anywhere in this function's
  // input type at all — asserting the constructed string never contains
  // the word "pet" is a direct, honest check that nothing was smuggled in.
  assert.ok(!q.toString().toLowerCase().includes('pet'));
});

test('buildBookingReturnQuery omits keys entirely for missing/empty selections, never emitting an empty-string param', () => {
  const q = buildBookingReturnQuery({});
  assert.equal(q.toString(), '');
  assert.equal(q.has('service'), false);
  assert.equal(q.has('slot'), false);
});

test('17. the updated consent wording is exactly the required English/Bengali text', () => {
  assert.equal(CONSENT_TEXT_EN, 'I confirm that I have reviewed and accept the fasting, cancellation and medical-assessment requirements for this booking.');
  assert.equal(CONSENT_TEXT_BN, 'আমি এই বুকিংয়ের উপবাস, বাতিলকরণ এবং ক্লিনিকের চিকিৎসা মূল্যায়নের শর্তগুলো পড়েছি ও সম্মতি দিচ্ছি।');
});

test('18. no "pet is fit for surgery" assertion remains anywhere in the consent text — medical fitness is never the owner\'s certification to make', () => {
  assert.doesNotMatch(CONSENT_TEXT_EN.toLowerCase(), /fit for surgery/);
  assert.doesNotMatch(CONSENT_TEXT_EN.toLowerCase(), /pet is fit/);
  // Bengali "উপযুক্ত" (fit/suitable) applied to the animal would be the
  // equivalent certification-of-fitness phrasing — confirm it's absent too.
  assert.doesNotMatch(CONSENT_TEXT_BN, /বিড়াল.*উপযুক্ত|প্রাণী.*উপযুক্ত/);
});
