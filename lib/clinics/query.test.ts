import assert from 'node:assert/strict';
import test from 'node:test';
import {
  parseClinicSearchParams,
  buildClinicPageHref,
  getActiveFilterChips,
  hasActiveFilters,
  type ClinicFilterState,
} from './query.ts';

test('parseClinicSearchParams defaults to page 1, list view, no filters on an empty query', () => {
  const state = parseClinicSearchParams({});
  assert.equal(state.page, 1);
  assert.equal(state.view, 'list');
  assert.equal(state.search, '');
  assert.equal(state.lat, undefined);
  assert.equal(state.lng, undefined);
});

test('parseClinicSearchParams never throws on a malformed page number, falling back to 1', () => {
  assert.equal(parseClinicSearchParams({ page: 'not-a-number' }).page, 1);
  assert.equal(parseClinicSearchParams({ page: '-5' }).page, 1);
  assert.equal(parseClinicSearchParams({ page: '0' }).page, 1);
});

test('parseClinicSearchParams only accepts a location when both lat and lng parse as numbers', () => {
  const withBoth = parseClinicSearchParams({ lat: '23.7', lng: '90.4' });
  assert.equal(withBoth.lat, 23.7);
  assert.equal(withBoth.lng, 90.4);

  const missingLng = parseClinicSearchParams({ lat: '23.7' });
  assert.equal(missingLng.lat, undefined);

  const malformed = parseClinicSearchParams({ lat: 'abc', lng: '90.4' });
  assert.equal(malformed.lat, undefined);
  assert.equal(malformed.lng, undefined);
});

test('parseClinicSearchParams trims free-text search', () => {
  assert.equal(parseClinicSearchParams({ search: '  gulshan  ' }).search, 'gulshan');
});

test('parseClinicSearchParams only recognizes "true" for boolean flags, never any other truthy string', () => {
  assert.equal(parseClinicSearchParams({ openNow: 'true' }).openNow, true);
  assert.equal(parseClinicSearchParams({ openNow: 'yes' }).openNow, false);
  assert.equal(parseClinicSearchParams({ openNow: '1' }).openNow, false);
});

test('parseClinicSearchParams treats an unrecognized view value as list, not map', () => {
  assert.equal(parseClinicSearchParams({ view: 'satellite' }).view, 'list');
  assert.equal(parseClinicSearchParams({ view: 'map' }).view, 'map');
});

function baseState(overrides: Partial<ClinicFilterState> = {}): ClinicFilterState {
  return {
    page: 1,
    search: '',
    district: '',
    area: '',
    cityCorporation: '',
    service: '',
    animalType: '',
    facilityType: '',
    openNow: false,
    open24Hours: false,
    emergency: false,
    appointmentRequired: false,
    verifiedOnly: false,
    sortBy: '',
    view: 'list',
    ...overrides,
  };
}

test('buildClinicPageHref omits page=1 (the default) but includes every other page number', () => {
  assert.equal(buildClinicPageHref(baseState(), 1), '/clinics');
  assert.equal(buildClinicPageHref(baseState(), 2), '/clinics?page=2');
});

test('buildClinicPageHref preserves every active filter across a page change', () => {
  const state = baseState({ district: 'Dhaka', verifiedOnly: true, sortBy: 'distance' });
  const href = buildClinicPageHref(state, 3);

  assert.match(href, /page=3/);
  assert.match(href, /district=Dhaka/);
  assert.match(href, /verifiedOnly=true/);
  assert.match(href, /sortBy=distance/);
});

test('buildClinicPageHref includes lat/lng only when both are present', () => {
  const withLocation = buildClinicPageHref(baseState({ lat: 23.7, lng: 90.4 }), 1);
  assert.match(withLocation, /lat=23\.7/);
  assert.match(withLocation, /lng=90\.4/);

  const without = buildClinicPageHref(baseState(), 1);
  assert.doesNotMatch(without, /lat=/);
});

test('getActiveFilterChips excludes search and sort — only filter chips count', () => {
  const state = baseState({ search: 'vet', sortBy: 'distance', verifiedOnly: true });
  const chips = getActiveFilterChips(state);

  assert.equal(chips.length, 1);
  assert.equal(chips[0].key, 'verifiedOnly');
});

test('getActiveFilterChips returns one chip per active filter, in a stable order', () => {
  const state = baseState({ district: 'Dhaka', openNow: true, emergency: true });
  const chips = getActiveFilterChips(state);

  assert.deepEqual(
    chips.map((c) => c.key),
    ['district', 'openNow', 'emergency'],
  );
});

test('hasActiveFilters is false for an all-default state and true once any filter is set', () => {
  assert.equal(hasActiveFilters(baseState()), false);
  assert.equal(hasActiveFilters(baseState({ facilityType: 'SURGERY' })), true);
});
