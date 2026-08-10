'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CalendarDays, Clock, MapPin, Search, SlidersHorizontal, X, Loader2, CircleAlert,
} from 'lucide-react';
import { getCampaignSessions } from '@/lib/api/campaigns';
import { getLocationChildren, type LocationNode } from '@/lib/api/locations';
import {
  parseSessionSearchParams, buildSessionsHref, hasActiveSessionFilters,
  buildSessionRegisterHref, buildSessionWaitlistHref, type SessionFilterState,
} from '@/lib/campaigns/sessions-query';
import { getSessionStatusPresentation } from '@/lib/campaigns/session-status';
import type { CampaignSessionListItem } from '@/types/bpa.types';

const PAGE_SIZE = 8;

const AVAILABILITY_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Any status' },
  { value: 'available', label: 'Available' },
  { value: 'few_left', label: 'Few Slots Left' },
  { value: 'full', label: 'Full' },
];

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

interface Props {
  campaignSlug: string;
}

function toRaw(params: URLSearchParams) {
  const raw: RawSessionSearchParamsShim = {};
  for (const key of ['page', 'search', 'divisionId', 'districtId', 'date', 'availability', 'tab'] as const) {
    const v = params.get(key);
    if (v !== null) raw[key] = v;
  }
  return raw;
}
type RawSessionSearchParamsShim = Partial<Record<'page' | 'search' | 'divisionId' | 'districtId' | 'date' | 'availability' | 'tab', string>>;

export default function SessionsExplorer({ campaignSlug }: Props) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const [filters, setFilters] = useState<SessionFilterState>(() => parseSessionSearchParams(toRaw(urlSearchParams)));
  const [searchInput, setSearchInput] = useState(filters.search);

  const [sessions, setSessions] = useState<CampaignSessionListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'loading-more' | 'error'>('loading');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [divisions, setDivisions] = useState<LocationNode[]>([]);
  const [districts, setDistricts] = useState<LocationNode[]>([]);

  const requestSeq = useRef(0);

  // Filters (everything except pagination) drive the URL and a fresh fetch.
  const filterKey = JSON.stringify({ search: filters.search, divisionId: filters.divisionId, districtId: filters.districtId, date: filters.date, availability: filters.availability, tab: filters.tab });

  useEffect(() => {
    getLocationChildren(null, 'DIVISION').then(setDivisions).catch(() => setDivisions([]));
  }, []);

  useEffect(() => {
    if (!filters.divisionId) { setDistricts([]); return; }
    getLocationChildren(filters.divisionId, 'DISTRICT').then(setDistricts).catch(() => setDistricts([]));
  }, [filters.divisionId]);

  const fetchPage = useCallback(async (targetPage: number, mode: 'replace' | 'append') => {
    const seq = ++requestSeq.current;
    setStatus(mode === 'append' ? 'loading-more' : 'loading');
    try {
      const { items, meta } = await getCampaignSessions(campaignSlug, {
        search: filters.search || undefined,
        divisionId: filters.divisionId || undefined,
        districtId: filters.districtId || undefined,
        date: filters.date || undefined,
        availability: filters.availability || undefined,
        tab: filters.tab,
        page: targetPage,
        limit: PAGE_SIZE,
      });
      if (seq !== requestSeq.current) return; // a newer request superseded this one
      setSessions((prev) => (mode === 'append' ? [...prev, ...items] : items));
      setTotal(meta.total);
      setHasNext(Boolean(meta.hasNext ?? (meta.page < meta.totalPages)));
      setPage(targetPage);
      setStatus('idle');
    } catch {
      if (seq !== requestSeq.current) return;
      setStatus('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignSlug, filterKey]);

  // Refetch from page 1 whenever a filter (not page) changes.
  useEffect(() => {
    fetchPage(1, 'replace');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  // Keep the URL in sync with filters (shareable, back/forward-safe, refresh-safe).
  useEffect(() => {
    const href = buildSessionsHref(`/campaigns/${campaignSlug}`, filters);
    router.replace(`${href}#sessions`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  const updateFilters = useCallback((patch: Partial<SessionFilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }));
  }, []);

  const onSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput.trim() });
  }, [searchInput, updateFilters]);

  const clearFilters = useCallback(() => {
    setSearchInput('');
    setFilters((prev) => ({ ...prev, search: '', divisionId: '', districtId: '', date: '', availability: '' }));
  }, []);

  const activeFiltersCount = hasActiveSessionFilters(filters) ? 1 : 0;

  return (
    <section id="sessions" aria-labelledby="sessions-heading">
      <h2 id="sessions-heading" className="text-2xl font-bold text-(--bpa-navy) mb-6 flex items-center gap-2">
        <CalendarDays size={20} className="text-(--bpa-green)" />Sessions & Venues
      </h2>

      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-4">
        {(['upcoming', 'past'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => updateFilters({ tab })}
            aria-pressed={filters.tab === tab}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors ${
              filters.tab === tab ? 'bg-(--bpa-navy) text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {tab === 'upcoming' ? 'Upcoming Sessions' : 'Past Sessions'}
          </button>
        ))}
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={onSearchSubmit} className="flex-1">
            <label htmlFor="session-search" className="sr-only">Search venue, district or area</label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="session-search"
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search venue, district or area…"
                className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 py-2.5 text-sm text-gray-800 focus:border-(--bpa-green) focus:outline-none focus:ring-2 focus:ring-(--bpa-green)/20"
              />
            </div>
          </form>

          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="sm:hidden inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-600"
          >
            <SlidersHorizontal size={15} /> Filters {activeFiltersCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-(--bpa-green)" />}
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <FilterControls
              filters={filters}
              divisions={divisions}
              districts={districts}
              onChange={updateFilters}
            />
          </div>
        </div>

        {hasActiveSessionFilters(filters) && (
          <div className="flex items-center gap-2 mt-3">
            <button type="button" onClick={clearFilters} className="text-xs font-semibold text-(--bpa-green) hover:underline">
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* ── Mobile filter sheet ──────────────────────────────────── */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[100] sm:hidden" role="dialog" aria-modal="true" aria-label="Filter sessions">
          <button type="button" aria-label="Close filters" onClick={() => setMobileFiltersOpen(false)} className="absolute inset-0 bg-slate-950/50" />
          <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-(--bpa-navy)">Filters</h3>
              <button type="button" onClick={() => setMobileFiltersOpen(false)} aria-label="Close" className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <FilterControls filters={filters} divisions={divisions} districts={districts} onChange={updateFilters} stacked />
            </div>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-5 w-full bg-(--bpa-green) text-white font-bold text-sm py-3 rounded-xl"
            >
              Show Results
            </button>
          </div>
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────── */}
      {status === 'error' ? (
        <ErrorState onRetry={() => fetchPage(1, 'replace')} />
      ) : status === 'loading' ? (
        <LoadingSkeleton />
      ) : sessions.length === 0 ? (
        hasActiveSessionFilters(filters) ? (
          <FilteredEmptyState onClear={clearFilters} />
        ) : (
          <EmptyState tab={filters.tab} />
        )
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            Showing 1–{sessions.length} of {total} session{total !== 1 ? 's' : ''}
          </p>
          <div className="space-y-4">
            {sessions.map((session) => (
              <SessionListCard key={session.id} session={session} campaignSlug={campaignSlug} />
            ))}
          </div>
          {hasNext && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => fetchPage(page + 1, 'append')}
                disabled={status === 'loading-more'}
                className="inline-flex items-center gap-2 border-2 border-(--bpa-green) text-(--bpa-green) font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-(--bpa-green-light) transition-colors disabled:opacity-60"
              >
                {status === 'loading-more' && <Loader2 size={14} className="animate-spin" />}
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

// ─── Filter controls (shared between desktop toolbar and mobile sheet) ──────

function FilterControls({
  filters, divisions, districts, onChange, stacked,
}: {
  filters: SessionFilterState;
  divisions: LocationNode[];
  districts: LocationNode[];
  onChange: (patch: Partial<SessionFilterState>) => void;
  stacked?: boolean;
}) {
  const selectClass = `rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-(--bpa-green) focus:outline-none focus:ring-2 focus:ring-(--bpa-green)/20 ${stacked ? 'w-full' : ''}`;
  return (
    <>
      <div className={stacked ? '' : 'contents'}>
        <label htmlFor="filter-division" className={stacked ? 'text-xs font-semibold text-gray-500 mb-1 block' : 'sr-only'}>Division</label>
        <select
          id="filter-division"
          value={filters.divisionId}
          onChange={(e) => onChange({ divisionId: e.target.value, districtId: '' })}
          className={selectClass}
        >
          <option value="">All Divisions</option>
          {divisions.map((d) => <option key={d.id} value={d.id}>{d.nameEn}</option>)}
        </select>
      </div>

      <div className={stacked ? 'mt-3' : 'contents'}>
        <label htmlFor="filter-district" className={stacked ? 'text-xs font-semibold text-gray-500 mb-1 block' : 'sr-only'}>District</label>
        <select
          id="filter-district"
          value={filters.districtId}
          onChange={(e) => onChange({ districtId: e.target.value })}
          disabled={!filters.divisionId}
          className={`${selectClass} disabled:bg-gray-50 disabled:text-gray-400`}
        >
          <option value="">All Districts</option>
          {districts.map((d) => <option key={d.id} value={d.id}>{d.nameEn}</option>)}
        </select>
      </div>

      <div className={stacked ? 'mt-3' : 'contents'}>
        <label htmlFor="filter-date" className={stacked ? 'text-xs font-semibold text-gray-500 mb-1 block' : 'sr-only'}>Date</label>
        <input
          id="filter-date"
          type="date"
          value={filters.date}
          onChange={(e) => onChange({ date: e.target.value })}
          className={selectClass}
        />
      </div>

      <div className={stacked ? 'mt-3' : 'contents'}>
        <label htmlFor="filter-availability" className={stacked ? 'text-xs font-semibold text-gray-500 mb-1 block' : 'sr-only'}>Availability</label>
        <select
          id="filter-availability"
          value={filters.availability}
          onChange={(e) => onChange({ availability: e.target.value })}
          className={selectClass}
        >
          {AVAILABILITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </>
  );
}

// ─── Session card ────────────────────────────────────────────────────────

function SessionListCard({ session, campaignSlug }: { session: CampaignSessionListItem; campaignSlug: string }) {
  const presentation = getSessionStatusPresentation(session.status);
  const available = Math.max(0, session.capacity - session.bookedCount);

  return (
    <div className={`rounded-2xl border p-5 transition-shadow hover:shadow-md ${session.status === 'full' || session.status === 'completed' ? 'border-gray-200 bg-gray-50/60' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="font-bold text-(--bpa-navy) text-sm">{session.venue?.name ?? 'Venue to be announced'}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${presentation.badgeClassName}`}>{presentation.label}</span>
          </div>
          {session.venue && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin size={10} className="text-gray-400 shrink-0" /> {session.venue.locationLabel}
            </p>
          )}
          {session.venue?.googleMapsUrl && (
            <a href={session.venue.googleMapsUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-(--bpa-green) hover:underline mt-1">
              <MapPin size={10} /> View on Maps
            </a>
          )}
        </div>
        <div className="shrink-0">
          {presentation.isBookable ? (
            <Link href={buildSessionRegisterHref(campaignSlug, session.id)}
              className="inline-flex items-center justify-center bg-(--bpa-green) text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-(--color-bpa-green-dark) transition-colors">
              Register
            </Link>
          ) : presentation.isWaitlistable ? (
            <Link href={buildSessionWaitlistHref(campaignSlug, session.id)}
              className="inline-flex items-center justify-center border border-(--bpa-green) text-(--bpa-green) text-xs font-semibold px-4 py-2 rounded-lg hover:bg-(--bpa-green-light) transition-colors">
              Waitlist
            </Link>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
        <span className="flex items-center gap-1.5"><CalendarDays size={12} className="text-(--bpa-green)" />{fmtDate(session.sessionDate)}</span>
        <span className="flex items-center gap-1.5"><Clock size={12} className="text-(--bpa-green)" />{session.startTime} – {session.endTime}</span>
        {session.capacity > 0 && (
          <span className="ml-auto text-gray-400">
            {session.status === 'full' ? 'No slots left' : `${available} of ${session.capacity} available`}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── States ──────────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading sessions">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 animate-pulse">
          <div className="h-4 w-1/3 bg-gray-200 rounded mb-3" />
          <div className="h-3 w-1/2 bg-gray-100 rounded mb-4" />
          <div className="h-8 w-full bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ tab }: { tab: 'upcoming' | 'past' }) {
  return (
    <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
      <CalendarDays size={28} className="mx-auto text-gray-300 mb-3" />
      <p className="text-sm font-semibold text-gray-500">
        {tab === 'upcoming' ? 'No upcoming sessions right now.' : 'No past sessions to show.'}
      </p>
      {tab === 'upcoming' && <p className="text-xs text-gray-400 mt-1">Check back soon or explore past sessions.</p>}
    </div>
  );
}

function FilteredEmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
      <Search size={28} className="mx-auto text-gray-300 mb-3" />
      <p className="text-sm font-semibold text-gray-500">No sessions match these filters.</p>
      <button type="button" onClick={onClear} className="mt-3 text-sm font-semibold text-(--bpa-green) hover:underline">
        Clear filters
      </button>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="text-center py-12 bg-white rounded-2xl border border-red-100">
      <CircleAlert size={28} className="mx-auto text-red-300 mb-3" />
      <p className="text-sm font-semibold text-red-600">Couldn&apos;t load sessions. Please check your connection.</p>
      <button type="button" onClick={onRetry} className="mt-3 text-sm font-semibold text-(--bpa-green) hover:underline">
        Try again
      </button>
    </div>
  );
}
