import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildBookingHref,
  findServiceChoice,
  getLifecycleBadge,
  getNotBookableReason,
  isPubliclyVisibleClinic,
  normalizeServiceQueryParam,
  resolveServiceSearchParam,
} from './offer-detail';

test('getLifecycleBadge returns the matching badge for each known state', () => {
  assert.equal(getLifecycleBadge('active').label, 'Booking Open');
  assert.equal(getLifecycleBadge('scheduled').label, 'Starting Soon');
  assert.equal(getLifecycleBadge('expired').label, 'Campaign Ended');
  assert.equal(getLifecycleBadge('closed').label, 'Not Currently Bookable');
});

test('getLifecycleBadge falls back to the closed treatment for an unrecognized state, never implying bookability', () => {
  // @ts-expect-error — intentionally passing an unrecognized value to prove the fallback
  const badge = getLifecycleBadge('something-unexpected');
  assert.equal(badge.label, getLifecycleBadge('closed').label);
});

test('getNotBookableReason gives a state-specific reason, not a generic error', () => {
  assert.equal(getNotBookableReason('scheduled'), 'Booking opens soon');
  assert.equal(getNotBookableReason('expired'), 'This campaign has ended');
  assert.equal(getNotBookableReason('closed'), 'Not currently bookable');
});

test('normalizeServiceQueryParam accepts SPAY/NEUTER case-insensitively', () => {
  assert.equal(normalizeServiceQueryParam('SPAY'), 'spay');
  assert.equal(normalizeServiceQueryParam('spay'), 'spay');
  assert.equal(normalizeServiceQueryParam('Neuter'), 'neuter');
  assert.equal(normalizeServiceQueryParam('NEUTER'), 'neuter');
});

test('normalizeServiceQueryParam rejects anything unrecognized, missing, or combined', () => {
  assert.equal(normalizeServiceQueryParam(null), null);
  assert.equal(normalizeServiceQueryParam(undefined), null);
  assert.equal(normalizeServiceQueryParam(''), null);
  assert.equal(normalizeServiceQueryParam('both'), null);
  assert.equal(normalizeServiceQueryParam('SPAY,NEUTER'), null);
  assert.equal(normalizeServiceQueryParam('unknown'), null);
});

test('buildBookingHref points at the canonical booking route with no query when nothing is preselected', () => {
  assert.equal(buildBookingHref('offer-1'), '/spay-neuter/offer-1/book');
});

test('buildBookingHref carries the service code as a query param', () => {
  assert.equal(buildBookingHref('offer-1', { service: 'NEUTER' }), '/spay-neuter/offer-1/book?service=NEUTER');
});

test('buildBookingHref carries both service and clinic when both are preselected', () => {
  const href = buildBookingHref('offer-1', { service: 'SPAY', clinicBranchId: 'clinic-9' });
  assert.equal(href, '/spay-neuter/offer-1/book?service=SPAY&clinic=clinic-9');
});

test('findServiceChoice returns the matching code, and null when absent', () => {
  const offer = {
    serviceChoices: [
      { code: 'NEUTER' as const, displayName: 'Neuter', displayNameBn: 'নিউটার', totalAmount: 1500, advanceAmount: 500, remainingAmount: 1000, durationMinutes: 20, enabled: true },
    ],
  };
  assert.equal(findServiceChoice(offer, 'NEUTER')?.totalAmount, 1500);
  assert.equal(findServiceChoice(offer, 'SPAY'), null);
});

test('isPubliclyVisibleClinic mirrors the published flag exactly', () => {
  assert.equal(isPubliclyVisibleClinic({ published: true }), true);
  assert.equal(isPubliclyVisibleClinic({ published: false }), false);
});

test('findServiceChoice passes Bengali display names through unchanged (no encoding/stripping)', () => {
  const offer = {
    serviceChoices: [
      { code: 'NEUTER' as const, displayName: 'Neuter', displayNameBn: 'নিউটার', totalAmount: 1500, advanceAmount: 500, remainingAmount: 1000, durationMinutes: 20, enabled: true },
      { code: 'SPAY' as const, displayName: 'Spay', displayNameBn: 'স্পে', totalAmount: 2200, advanceAmount: 500, remainingAmount: 1700, durationMinutes: 40, enabled: true },
    ],
  };
  assert.equal(findServiceChoice(offer, 'NEUTER')?.displayNameBn, 'নিউটার');
  assert.equal(findServiceChoice(offer, 'SPAY')?.displayNameBn, 'স্পে');
});

// ─── /spay-neuter/[offerId]/book route contract ──────────────────────────
// The canonical booking route (app/spay-neuter/[offerId]/book/page.tsx)
// awaits Next.js's Promise-shaped `params`/`searchParams`, then resolves
// the optional ?service= query via resolveServiceSearchParam before
// rendering the wizard — these tests pin that exact contract: the base
// route, SPAY/NEUTER preselection, and invalid/malformed query handling.

test('base booking route: buildBookingHref round-trips to no preselection via resolveServiceSearchParam', () => {
  const href = buildBookingHref('offer-1');
  assert.equal(href, '/spay-neuter/offer-1/book');
  const query = new URLSearchParams(href.split('?')[1] ?? '');
  assert.equal(resolveServiceSearchParam(query.get('service') ?? undefined), null);
});

test('SPAY preselection: buildBookingHref -> resolveServiceSearchParam round-trips to spay', () => {
  const href = buildBookingHref('offer-1', { service: 'SPAY' });
  const query = new URLSearchParams(href.split('?')[1]);
  assert.equal(resolveServiceSearchParam(query.get('service') ?? undefined), 'spay');
});

test('NEUTER preselection: buildBookingHref -> resolveServiceSearchParam round-trips to neuter', () => {
  const href = buildBookingHref('offer-1', { service: 'NEUTER' });
  const query = new URLSearchParams(href.split('?')[1]);
  assert.equal(resolveServiceSearchParam(query.get('service') ?? undefined), 'neuter');
});

test('resolveServiceSearchParam handles a plain string exactly like normalizeServiceQueryParam', () => {
  assert.equal(resolveServiceSearchParam('SPAY'), 'spay');
  assert.equal(resolveServiceSearchParam('neuter'), 'neuter');
  assert.equal(resolveServiceSearchParam(undefined), null);
});

test('resolveServiceSearchParam handles Next.js repeated-query-key arrays, using only the first value', () => {
  assert.equal(resolveServiceSearchParam(['SPAY', 'NEUTER']), 'spay');
  assert.equal(resolveServiceSearchParam(['neuter']), 'neuter');
});

test('invalid query: an unrecognized/garbage ?service= value is safely ignored, never throws', () => {
  assert.equal(resolveServiceSearchParam('DOG'), null);
  assert.equal(resolveServiceSearchParam(['garbage', 'SPAY']), null);
  assert.equal(resolveServiceSearchParam(['']), null);
});

test('canonical BDT amounts match the documented business rule for both services', () => {
  const offer = {
    serviceChoices: [
      { code: 'NEUTER' as const, displayName: 'Neuter', displayNameBn: 'নিউটার', totalAmount: 1500, advanceAmount: 500, remainingAmount: 1000, durationMinutes: 20, enabled: true },
      { code: 'SPAY' as const, displayName: 'Spay', displayNameBn: 'স্পে', totalAmount: 2200, advanceAmount: 500, remainingAmount: 1700, durationMinutes: 40, enabled: true },
    ],
  };
  const neuter = findServiceChoice(offer, 'NEUTER')!;
  const spay = findServiceChoice(offer, 'SPAY')!;

  assert.deepEqual(neuter, { code: 'NEUTER', displayName: 'Neuter', displayNameBn: 'নিউটার', totalAmount: 1500, advanceAmount: 500, remainingAmount: 1000, durationMinutes: 20, enabled: true });
  assert.deepEqual(spay, { code: 'SPAY', displayName: 'Spay', displayNameBn: 'স্পে', totalAmount: 2200, advanceAmount: 500, remainingAmount: 1700, durationMinutes: 40, enabled: true });
  // Advance is part of the total, never additive, for both services.
  assert.equal(neuter.advanceAmount + neuter.remainingAmount, neuter.totalAmount);
  assert.equal(spay.advanceAmount + spay.remainingAmount, spay.totalAmount);
});
