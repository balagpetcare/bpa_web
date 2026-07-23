// Pure, alias-free query-string logic for the Find Clinics module — kept
// dependency-free (no `@/` imports) so it can be unit-tested with plain
// `node --test` against this file directly, the same convention already
// used by `media-config.test.mjs`.

export interface ClinicFilterState {
  page: number;
  search: string;
  district: string;
  area: string;
  cityCorporation: string;
  service: string;
  animalType: string;
  facilityType: string;
  openNow: boolean;
  open24Hours: boolean;
  emergency: boolean;
  appointmentRequired: boolean;
  verifiedOnly: boolean;
  sortBy: string;
  view: 'list' | 'map';
  lat?: number;
  lng?: number;
}

/** Raw string values as they arrive from Next.js's `searchParams`. */
export type RawClinicSearchParams = Partial<Record<
  | 'page'
  | 'search'
  | 'district'
  | 'area'
  | 'cityCorporation'
  | 'service'
  | 'animalType'
  | 'facilityType'
  | 'openNow'
  | 'open24Hours'
  | 'emergency'
  | 'appointmentRequired'
  | 'verifiedOnly'
  | 'sortBy'
  | 'view'
  | 'lat'
  | 'lng',
  string
>>;

/**
 * Parses the page's raw `searchParams` into a fully-typed filter state.
 * Never throws on malformed input — a bad `page`/`lat`/`lng` value falls
 * back to a safe default rather than crashing the page.
 */
export function parseClinicSearchParams(params: RawClinicSearchParams): ClinicFilterState {
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const lat = params.lat ? parseFloat(params.lat) : undefined;
  const lng = params.lng ? parseFloat(params.lng) : undefined;
  const hasLocation = lat !== undefined && lng !== undefined && !Number.isNaN(lat) && !Number.isNaN(lng);

  return {
    page,
    search: params.search?.trim() ?? '',
    district: params.district ?? '',
    area: params.area ?? '',
    cityCorporation: params.cityCorporation ?? '',
    service: params.service ?? '',
    animalType: params.animalType ?? '',
    facilityType: params.facilityType ?? '',
    openNow: params.openNow === 'true',
    open24Hours: params.open24Hours === 'true',
    emergency: params.emergency === 'true',
    appointmentRequired: params.appointmentRequired === 'true',
    verifiedOnly: params.verifiedOnly === 'true',
    sortBy: params.sortBy ?? '',
    view: params.view === 'map' ? 'map' : 'list',
    lat: hasLocation ? lat : undefined,
    lng: hasLocation ? lng : undefined,
  };
}

/** Builds the `/clinics?...` href for a given page number, preserving every other active filter. */
export function buildClinicPageHref(state: ClinicFilterState, targetPage: number): string {
  const sp = new URLSearchParams();
  if (targetPage > 1) sp.set('page', String(targetPage));
  if (state.search) sp.set('search', state.search);
  if (state.district) sp.set('district', state.district);
  if (state.area) sp.set('area', state.area);
  if (state.cityCorporation) sp.set('cityCorporation', state.cityCorporation);
  if (state.service) sp.set('service', state.service);
  if (state.animalType) sp.set('animalType', state.animalType);
  if (state.facilityType) sp.set('facilityType', state.facilityType);
  if (state.openNow) sp.set('openNow', 'true');
  if (state.open24Hours) sp.set('open24Hours', 'true');
  if (state.emergency) sp.set('emergency', 'true');
  if (state.appointmentRequired) sp.set('appointmentRequired', 'true');
  if (state.verifiedOnly) sp.set('verifiedOnly', 'true');
  if (state.sortBy) sp.set('sortBy', state.sortBy);
  if (state.view === 'map') sp.set('view', 'map');
  if (state.lat !== undefined && state.lng !== undefined) {
    sp.set('lat', String(state.lat));
    sp.set('lng', String(state.lng));
  }
  const qs = sp.toString();
  return `/clinics${qs ? `?${qs}` : ''}`;
}

export interface ActiveFilterChip {
  key: string;
  label: string;
}

/**
 * The list of currently-active filter chips shown above the results
 * (search and sort are excluded — they have their own dedicated controls,
 * matching the existing admin-panel convention of not double-counting
 * search/sort as "filter chips").
 */
export function getActiveFilterChips(state: ClinicFilterState): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];
  if (state.district) chips.push({ key: 'district', label: `District: ${state.district}` });
  if (state.area) chips.push({ key: 'area', label: `Area: ${state.area}` });
  if (state.cityCorporation) chips.push({ key: 'cityCorporation', label: state.cityCorporation });
  if (state.service) chips.push({ key: 'service', label: `Service: ${state.service}` });
  if (state.animalType) chips.push({ key: 'animalType', label: `Animal: ${state.animalType}` });
  if (state.facilityType) chips.push({ key: 'facilityType', label: `Facility: ${state.facilityType}` });
  if (state.openNow) chips.push({ key: 'openNow', label: 'Open Now' });
  if (state.open24Hours) chips.push({ key: 'open24Hours', label: '24/7' });
  if (state.emergency) chips.push({ key: 'emergency', label: 'Emergency' });
  if (state.appointmentRequired) chips.push({ key: 'appointmentRequired', label: 'Appointment Required' });
  if (state.verifiedOnly) chips.push({ key: 'verifiedOnly', label: 'Verified' });
  return chips;
}

export function hasActiveFilters(state: ClinicFilterState): boolean {
  return getActiveFilterChips(state).length > 0;
}
