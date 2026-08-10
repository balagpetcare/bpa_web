import assert from 'node:assert/strict';
import test from 'node:test';
import {
  parseSessionSearchParams,
  buildSessionsHref,
  getActiveSessionFilterChips,
  hasActiveSessionFilters,
  buildSessionRegisterHref,
  buildSessionWaitlistHref,
} from './sessions-query';

test('parseSessionSearchParams defaults to upcoming, page 1, no filters', () => {
  const state = parseSessionSearchParams({});
  assert.equal(state.tab, 'upcoming');
  assert.equal(state.page, 1);
  assert.equal(state.search, '');
  assert.equal(state.divisionId, '');
});

test('parseSessionSearchParams never throws on malformed page and falls back to 1', () => {
  const state = parseSessionSearchParams({ page: 'not-a-number' });
  assert.equal(state.page, 1);
});

test('parseSessionSearchParams round-trips explicit filters', () => {
  const state = parseSessionSearchParams({
    page: '3', search: ' Dhaka ', divisionId: 'div-1', districtId: 'dist-1', date: '2026-06-01', availability: 'few_left', tab: 'past',
  });
  assert.equal(state.page, 3);
  assert.equal(state.search, 'Dhaka');
  assert.equal(state.divisionId, 'div-1');
  assert.equal(state.districtId, 'dist-1');
  assert.equal(state.date, '2026-06-01');
  assert.equal(state.availability, 'few_left');
  assert.equal(state.tab, 'past');
});

test('buildSessionsHref omits default tab=upcoming and page=1 from the querystring', () => {
  const state = parseSessionSearchParams({});
  const href = buildSessionsHref('/campaigns/cat-vax', state);
  assert.equal(href, '/campaigns/cat-vax');
});

test('buildSessionsHref includes only the non-default filters', () => {
  const state = parseSessionSearchParams({ districtId: 'faridpur-id', availability: 'available' });
  const href = buildSessionsHref('/campaigns/cat-vax', state);
  assert.equal(href, '/campaigns/cat-vax?districtId=faridpur-id&availability=available');
});

test('buildSessionsHref applies overrides without mutating the base state', () => {
  const state = parseSessionSearchParams({ page: '2' });
  const href = buildSessionsHref('/campaigns/cat-vax', state, { page: 5 });
  assert.equal(href, '/campaigns/cat-vax?page=5');
  assert.equal(state.page, 2);
});

test('getActiveSessionFilterChips / hasActiveSessionFilters reflect only non-default fields', () => {
  const clean = parseSessionSearchParams({});
  assert.equal(hasActiveSessionFilters(clean), false);
  assert.deepEqual(getActiveSessionFilterChips(clean), []);

  const filtered = parseSessionSearchParams({ districtId: 'd1', search: 'clinic' });
  assert.equal(hasActiveSessionFilters(filtered), true);
  assert.equal(getActiveSessionFilterChips(filtered).length, 1);
});

test('buildSessionRegisterHref / buildSessionWaitlistHref use the session id, not a slug', () => {
  assert.equal(buildSessionRegisterHref('cat-vax', 'sess-123'), '/campaigns/cat-vax/register?session=sess-123');
  assert.equal(buildSessionWaitlistHref('cat-vax', 'sess-123'), '/campaigns/cat-vax/waitlist?session=sess-123');
});
