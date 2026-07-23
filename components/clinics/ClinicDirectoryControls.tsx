'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, List, Map as MapIcon, Loader2, X, SlidersHorizontal } from 'lucide-react';
import type { PublicClinicFilterOptions } from '@/types/bpa.types';
import { getActiveFilterChips, hasActiveFilters, type ClinicFilterState } from '@/lib/clinics/query';
import { trackEvent } from '@/lib/analytics';

const SORT_OPTIONS = [
  { value: '', label: 'Recommended' },
  { value: 'distance', label: 'Distance' },
  { value: 'name', label: 'Name' },
  { value: 'recentlyVerified', label: 'Recently Verified' },
];

const FACILITY_LABELS: Record<string, string> = {
  LABORATORY: 'Laboratory',
  SURGERY: 'Surgery',
  IMAGING: 'Imaging',
  PHARMACY: 'Pharmacy',
  HOSPITALIZATION: 'Hospitalization',
  HOME_SERVICE: 'Home Service',
};

const FILTER_KEYS = [
  'district',
  'area',
  'cityCorporation',
  'service',
  'animalType',
  'facilityType',
  'openNow',
  'open24Hours',
  'emergency',
  'appointmentRequired',
  'verifiedOnly',
] as const;

interface Props {
  filterOptions: PublicClinicFilterOptions;
  current: ClinicFilterState;
}

export default function ClinicDirectoryControls({ filterOptions, current }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(current.search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const activeChips = getActiveFilterChips(current);
  const activeFilterCount = activeChips.length;

  const update = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(sp.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      // Any filter/search/sort change resets pagination — a stale page
      // number against a different result set would silently show the
      // wrong slice (or an out-of-range empty page).
      params.delete('page');
      router.push(`/clinics?${params.toString()}`);
    },
    [router, sp],
  );

  function onSearchChange(value: string) {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const trimmed = value.trim();
      update({ search: trimmed || null });
      if (trimmed) trackEvent('clinic_search', { query_length: trimmed.length });
    }, 400);
  }

  function updateFilter(key: string, value: string | null) {
    update({ [key]: value });
    trackEvent('clinic_filter_change', { filter: key, active: value !== null });
  }

  function clearAllFilters() {
    const params = new URLSearchParams(sp.toString());
    for (const key of FILTER_KEYS) params.delete(key);
    params.delete('page');
    router.push(`/clinics?${params.toString()}`);
    trackEvent('clinic_filter_clear_all', {});
  }

  function removeChip(key: string) {
    updateFilter(key, null);
  }

  function useMyLocation() {
    setLocationError(null);
    if (!('geolocation' in navigator)) {
      setLocationError('Your browser does not support location.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        update({
          lat: String(pos.coords.latitude),
          lng: String(pos.coords.longitude),
          sortBy: 'distance',
        });
        trackEvent('clinic_use_my_location', { granted: true });
      },
      (err) => {
        setLocating(false);
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission was denied. You can still search by district or area.'
            : 'Could not determine your location. Please try again, or search by district or area.',
        );
        trackEvent('clinic_use_my_location', { granted: false, reason: err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable' });
      },
      { enableHighAccuracy: false, timeout: 10000 },
    );
  }

  const filterFields = (
    <div className="flex flex-wrap gap-2 items-center">
      <select
        aria-label="Filter by district"
        value={current.district}
        onChange={(e) => updateFilter('district', e.target.value || null)}
        className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-(--bpa-green)"
      >
        <option value="">District: Any</option>
        {filterOptions.districts.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <select
        aria-label="Filter by area"
        value={current.area}
        onChange={(e) => updateFilter('area', e.target.value || null)}
        className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-(--bpa-green)"
      >
        <option value="">Area: Any</option>
        {filterOptions.areas.map((a) => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>

      <select
        aria-label="Filter by city corporation"
        value={current.cityCorporation}
        onChange={(e) => updateFilter('cityCorporation', e.target.value || null)}
        className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-(--bpa-green)"
      >
        <option value="">DNCC / DSCC: Any</option>
        {filterOptions.cityCorporations.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        aria-label="Filter by service"
        value={current.service}
        onChange={(e) => updateFilter('service', e.target.value || null)}
        className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-(--bpa-green)"
      >
        <option value="">Service: Any</option>
        {filterOptions.services.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select
        aria-label="Filter by animal type"
        value={current.animalType}
        onChange={(e) => updateFilter('animalType', e.target.value || null)}
        className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-(--bpa-green)"
      >
        <option value="">Animal: Any</option>
        {filterOptions.animalTypes.map((a) => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>

      <select
        aria-label="Filter by facility"
        value={current.facilityType}
        onChange={(e) => updateFilter('facilityType', e.target.value || null)}
        className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-(--bpa-green)"
      >
        <option value="">Facility: Any</option>
        {filterOptions.facilityTypes.map((f) => (
          <option key={f} value={f}>{FACILITY_LABELS[f] ?? f}</option>
        ))}
      </select>

      {(
        [
          ['openNow', 'Open Now'],
          ['open24Hours', '24/7'],
          ['emergency', 'Emergency'],
          ['appointmentRequired', 'Appointment Required'],
          ['verifiedOnly', 'Verified'],
        ] as const
      ).map(([key, label]) => (
        <button
          key={key}
          type="button"
          aria-pressed={current[key]}
          onClick={() => updateFilter(key, current[key] ? null : 'true')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            current[key] ? 'bg-(--bpa-green) text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            aria-label="Search clinics, area, or address"
            placeholder="Search clinics, area, or address"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green) focus:border-transparent"
          />
        </div>

        <select
          aria-label="Sort clinics"
          value={current.sortBy}
          onChange={(e) => updateFilter('sortBy', e.target.value || null)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green)"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              Sort: {o.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-lg border border-gray-300 hover:border-(--bpa-green) hover:text-(--bpa-green) transition-colors disabled:opacity-60"
        >
          {locating ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <MapPin size={14} aria-hidden="true" />}
          {current.lat !== undefined ? 'Location set' : 'Use my location'}
        </button>

        <button
          type="button"
          onClick={() => setDrawerOpen((v) => !v)}
          aria-expanded={drawerOpen}
          aria-controls="clinic-filter-panel"
          className="sm:hidden inline-flex items-center justify-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-lg border border-gray-300"
        >
          <SlidersHorizontal size={14} aria-hidden="true" />
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </button>

        <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden" role="group" aria-label="View mode">
          <button
            type="button"
            onClick={() => updateFilter('view', null)}
            className={`px-3 py-2 text-sm inline-flex items-center gap-1 ${
              current.view !== 'map' ? 'bg-(--bpa-green) text-white' : 'bg-white text-gray-600'
            }`}
            aria-pressed={current.view !== 'map'}
          >
            <List size={14} aria-hidden="true" /> List
          </button>
          <button
            type="button"
            onClick={() => updateFilter('view', 'map')}
            className={`px-3 py-2 text-sm inline-flex items-center gap-1 ${
              current.view === 'map' ? 'bg-(--bpa-green) text-white' : 'bg-white text-gray-600'
            }`}
            aria-pressed={current.view === 'map'}
          >
            <MapIcon size={14} aria-hidden="true" /> Map
          </button>
        </div>
      </div>

      {locationError && (
        <p className="text-xs text-orange-600" role="status">
          {locationError}
        </p>
      )}

      <div id="clinic-filter-panel" className={`${drawerOpen ? 'block' : 'hidden'} sm:block`}>
        {filterFields}
      </div>

      {hasActiveFilters(current) && (
        <div className="flex flex-wrap gap-2 items-center pt-1 border-t border-gray-100">
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-(--bpa-green)/10 text-(--bpa-navy)"
            >
              {chip.label}
              <button
                type="button"
                onClick={() => removeChip(chip.key)}
                aria-label={`Remove filter: ${chip.label}`}
                className="hover:text-red-600"
              >
                <X size={12} />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-(--bpa-green) transition-colors"
          >
            <X size={12} /> Clear all ({activeFilterCount})
          </button>
        </div>
      )}
    </div>
  );
}
