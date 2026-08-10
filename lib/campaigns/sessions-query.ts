// Pure, alias-free query-string logic for the campaign "Sessions & Venues"
// explorer — kept dependency-free (no `@/` imports) so it can be unit-tested
// with plain `node --test` directly, mirroring `lib/clinics/query.ts`.

export interface SessionFilterState {
  page: number;
  search: string;
  divisionId: string;
  districtId: string;
  date: string;
  availability: string;
  tab: 'upcoming' | 'past';
}

/** Raw string values as they arrive from Next.js's `searchParams`. */
export type RawSessionSearchParams = Partial<Record<
  'page' | 'search' | 'divisionId' | 'districtId' | 'date' | 'availability' | 'tab',
  string
>>;

const DEFAULT_TAB = 'upcoming';

/**
 * Parses the page's raw `searchParams` into a fully-typed filter state.
 * Never throws on malformed input — a bad `page` value falls back to a
 * safe default rather than crashing the page.
 */
export function parseSessionSearchParams(params: RawSessionSearchParams): SessionFilterState {
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  return {
    page,
    search: params.search?.trim() ?? '',
    divisionId: params.divisionId ?? '',
    districtId: params.districtId ?? '',
    date: params.date ?? '',
    availability: params.availability ?? '',
    tab: params.tab === 'past' ? 'past' : DEFAULT_TAB,
  };
}

/** Builds the campaign sessions href for a given filter state, omitting default/empty values. */
export function buildSessionsHref(basePath: string, state: SessionFilterState, overrides: Partial<SessionFilterState> = {}): string {
  const merged: SessionFilterState = { ...state, ...overrides };
  const sp = new URLSearchParams();
  if (merged.page > 1) sp.set('page', String(merged.page));
  if (merged.search) sp.set('search', merged.search);
  if (merged.divisionId) sp.set('divisionId', merged.divisionId);
  if (merged.districtId) sp.set('districtId', merged.districtId);
  if (merged.date) sp.set('date', merged.date);
  if (merged.availability) sp.set('availability', merged.availability);
  if (merged.tab !== DEFAULT_TAB) sp.set('tab', merged.tab);
  const qs = sp.toString();
  return `${basePath}${qs ? `?${qs}` : ''}`;
}

export interface ActiveSessionFilterChip {
  key: keyof SessionFilterState;
  label: string;
}

export function getActiveSessionFilterChips(state: SessionFilterState): ActiveSessionFilterChip[] {
  const chips: ActiveSessionFilterChip[] = [];
  if (state.divisionId) chips.push({ key: 'divisionId', label: 'Division' });
  if (state.districtId) chips.push({ key: 'districtId', label: 'District' });
  if (state.date) chips.push({ key: 'date', label: `Date: ${state.date}` });
  if (state.availability) chips.push({ key: 'availability', label: `Status: ${state.availability.replace('_', ' ')}` });
  return chips;
}

export function hasActiveSessionFilters(state: SessionFilterState): boolean {
  return Boolean(state.search) || getActiveSessionFilterChips(state).length > 0;
}

/** The registration/waitlist link for a session — must always use the session id, never a slug. */
export function buildSessionRegisterHref(campaignSlug: string, sessionId: string): string {
  return `/campaigns/${campaignSlug}/register?session=${sessionId}`;
}

export function buildSessionWaitlistHref(campaignSlug: string, sessionId: string): string {
  return `/campaigns/${campaignSlug}/waitlist?session=${sessionId}`;
}
