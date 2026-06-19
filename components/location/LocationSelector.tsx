'use client';

/**
 * Cascading location selector for the BPA public website.
 *
 * Behaviour:
 *   Division → District → (Upazila | City Corporation) → (Union | Zone) → Ward
 *
 * Props:
 *   value / onChange  — controlled, React Hook Form compatible
 *   show*             — toggle which levels are rendered
 *   requiredLevels    — mark specific levels as required (for HTML validation)
 *   locale            — 'en' (default) | 'bn'
 *   showAddressLine   — show free-text address field below the selects
 */

import React, { useCallback, useEffect, useState } from 'react';
import { getPublicApiUrl } from '@/lib/utils/api-url';

// ── Types ──────────────────────────────────────────────────────────────────────

export type LocationType =
  | 'DIVISION' | 'DISTRICT' | 'UPAZILA' | 'THANA'
  | 'UNION' | 'POURASHAVA' | 'CITY_CORPORATION'
  | 'CITY_ZONE' | 'WARD' | 'AREA';

export interface LocationOption {
  id: string;
  nameEn: string;
  nameBn: string | null;
  slug: string;
  type: LocationType;
}

export interface LocationValue {
  divisionId?: string;
  districtId?: string;
  upazilaId?: string;
  unionId?: string;
  cityCorporationId?: string;
  cityZoneId?: string;
  wardId?: string;
  addressLine?: string;
}

export interface LocationSelectorProps {
  value?: LocationValue;
  onChange?: (value: LocationValue) => void;
  showDivision?: boolean;
  showDistrict?: boolean;
  showUpazila?: boolean;
  showUnion?: boolean;
  showCityCorporation?: boolean;
  showZone?: boolean;
  showWard?: boolean;
  showAddressLine?: boolean;
  locale?: 'en' | 'bn';
  requiredLevels?: LocationType[];
  disabled?: boolean;
  className?: string;
}

// ── Fetch helper ───────────────────────────────────────────────────────────────

async function fetchLocations(
  type?: LocationType,
  parentId?: string | null,
): Promise<LocationOption[]> {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (parentId) params.set('parentId', parentId);
  const url = getPublicApiUrl(`/public/locations?${params.toString()}`);
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`[LocationSelector] fetch failed: ${url} → HTTP ${res.status}`);
    return [];
  }
  const json: unknown = await res.json();
  // Support { data: [...] }, { success: true, data: [...] }, or direct array
  if (Array.isArray(json)) return json as LocationOption[];
  if (json && typeof json === 'object' && Array.isArray((json as Record<string, unknown>).data)) {
    return (json as Record<string, unknown>).data as LocationOption[];
  }
  return [];
}

// ── Label helper ───────────────────────────────────────────────────────────────

const LABELS: Record<string, { en: string; bn: string }> = {
  division:        { en: 'Division',         bn: 'বিভাগ' },
  district:        { en: 'District',         bn: 'জেলা' },
  upazila:         { en: 'Upazila / Thana',  bn: 'উপজেলা / থানা' },
  cityCorporation: { en: 'City Corporation', bn: 'সিটি কর্পোরেশন' },
  zone:            { en: 'Zone',             bn: 'জোন' },
  ward:            { en: 'Ward',             bn: 'ওয়ার্ড' },
  union:           { en: 'Union',            bn: 'ইউনিয়ন' },
  addressLine:     { en: 'Address Line',     bn: 'ঠিকানা' },
};

function label(key: string, locale: 'en' | 'bn'): string {
  return LABELS[key]?.[locale] ?? key;
}

function optionLabel(opt: LocationOption, locale: 'en' | 'bn'): string {
  return locale === 'bn' && opt.nameBn ? opt.nameBn : opt.nameEn;
}

// ── Select wrapper ─────────────────────────────────────────────────────────────

function LSelect({
  id,
  labelText,
  options,
  value,
  onChange,
  loading,
  required,
  disabled,
  placeholder,
  mounted,
}: {
  id: string;
  labelText: string;
  options: LocationOption[];
  value: string;
  onChange: (val: string) => void;
  loading?: boolean;
  required?: boolean;
  disabled?: boolean;
  placeholder: string;
  mounted?: boolean;
}) {
  // During SSR and initial client render (before hydration), ignore loading
  // so the disabled prop is deterministic between server and client.
  const isDisabled = Boolean(disabled) || (mounted && !!loading) || options.length === 0;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {labelText}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={isDisabled}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800
                   focus:border-(--bpa-green) focus:outline-none focus:ring-2 focus:ring-(--bpa-green)/20
                   disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        <option value="">
          {loading ? 'Loading…' : options.length === 0 ? '—' : placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.nameEn}{opt.nameBn ? ` (${opt.nameBn})` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function LocationSelector({
  value = {},
  onChange,
  showDivision = true,
  showDistrict = true,
  showUpazila = true,
  showUnion = true,
  showCityCorporation = true,
  showZone = true,
  showWard = true,
  showAddressLine = false,
  locale = 'en',
  requiredLevels = [],
  disabled = false,
  className = '',
}: LocationSelectorProps) {
  const required = (t: LocationType) => requiredLevels.includes(t);

  // Option lists
  const [divisions, setDivisions]       = useState<LocationOption[]>([]);
  const [districts, setDistricts]       = useState<LocationOption[]>([]);
  const [upazilas, setUpazilas]         = useState<LocationOption[]>([]);
  const [corps, setCorps]               = useState<LocationOption[]>([]);
  const [zones, setZones]               = useState<LocationOption[]>([]);
  const [wards, setWards]               = useState<LocationOption[]>([]);
  const [unions, setUnions]             = useState<LocationOption[]>([]);

  // Loading states
  const [loadingDiv, setLoadingDiv]     = useState(false);
  const [loadingDist, setLoadingDist]   = useState(false);
  const [loadingUp, setLoadingUp]       = useState(false);
  const [loadingCorp, setLoadingCorp]   = useState(false);
  const [loadingZone, setLoadingZone]   = useState(false);
  const [loadingWard, setLoadingWard]   = useState(false);
  const [loadingUnion, setLoadingUnion] = useState(false);

  const [fetchError, setFetchError] = useState<string | null>(null);

  // ── Hydration guard ────────────────────────────────────────────────────────
  // Prevents hydration mismatch: on server + first client render,
  // loading states are ignored in the disabled prop so the server-rendered
  // HTML matches the initial client render. Once mounted, loading is included.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const emit = useCallback(
    (patch: Partial<LocationValue>) => onChange?.({ ...value, ...patch }),
    [onChange, value],
  );

  // Load divisions on mount
  useEffect(() => {
    if (!showDivision) return;
    setLoadingDiv(true);
    setFetchError(null);
    fetchLocations('DIVISION')
      .then((d) => setDivisions(d))
      .catch((e: unknown) => {
        console.error('[LocationSelector] divisions load failed:', e);
        setFetchError('Location loading failed. Please refresh and try again.');
      })
      .finally(() => setLoadingDiv(false));
  }, [showDivision]);

  // Load districts when division changes
  useEffect(() => {
    if (!value.divisionId || !showDistrict) { setDistricts([]); return; }
    setLoadingDist(true);
    fetchLocations('DISTRICT', value.divisionId)
      .then((d) => setDistricts(d))
      .catch((e: unknown) => {
        console.error('[LocationSelector] districts load failed:', e);
        setFetchError('Location loading failed. Please refresh and try again.');
      })
      .finally(() => setLoadingDist(false));
  }, [value.divisionId, showDistrict]);

  // Load upazilas AND city corporations when district changes
  useEffect(() => {
    setUpazilas([]); setCorps([]);
    if (!value.districtId) return;
    if (showUpazila) {
      setLoadingUp(true);
      fetchLocations('UPAZILA', value.districtId)
        .then((d) => setUpazilas(d))
        .catch((e: unknown) => {
          console.error('[LocationSelector] upazilas load failed:', e);
          setFetchError('Location loading failed. Please refresh and try again.');
        })
        .finally(() => setLoadingUp(false));
    }
    if (showCityCorporation) {
      setLoadingCorp(true);
      fetchLocations('CITY_CORPORATION', value.districtId)
        .then((d) => setCorps(d))
        .catch((e: unknown) => {
          console.error('[LocationSelector] city corps load failed:', e);
        })
        .finally(() => setLoadingCorp(false));
    }
  }, [value.districtId, showUpazila, showCityCorporation]);

  // Load zones when city corporation changes
  useEffect(() => {
    setZones([]); setWards([]);
    if (!value.cityCorporationId || !showZone) return;
    setLoadingZone(true);
    fetchLocations('CITY_ZONE', value.cityCorporationId)
      .then((d) => setZones(d))
      .catch((e: unknown) => {
        console.error('[LocationSelector] zones load failed:', e);
      })
      .finally(() => setLoadingZone(false));
  }, [value.cityCorporationId, showZone]);

  // Load wards when zone changes
  useEffect(() => {
    setWards([]);
    if (!value.cityZoneId || !showWard) return;
    setLoadingWard(true);
    fetchLocations('WARD', value.cityZoneId)
      .then((d) => setWards(d))
      .catch((e: unknown) => {
        console.error('[LocationSelector] wards load failed:', e);
      })
      .finally(() => setLoadingWard(false));
  }, [value.cityZoneId, showWard]);

  // Load unions when upazila changes
  useEffect(() => {
    setUnions([]);
    if (!value.upazilaId || !showUnion) return;
    setLoadingUnion(true);
    fetchLocations('UNION', value.upazilaId)
      .then((d) => setUnions(d))
      .catch((e: unknown) => {
        console.error('[LocationSelector] unions load failed:', e);
      })
      .finally(() => setLoadingUnion(false));
  }, [value.upazilaId, showUnion]);

  return (
    <div className={className}>
      {fetchError && (
        <p className="mb-2 text-xs text-red-600 bg-red-50 rounded px-3 py-2">{fetchError}</p>
      )}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {showDivision && (
        <LSelect
          id="loc-division"
          labelText={label('division', locale)}
          options={divisions}
          value={value.divisionId ?? ''}
          onChange={(id) => emit({
            divisionId: id || undefined,
            districtId: undefined,
            upazilaId: undefined,
            unionId: undefined,
            cityCorporationId: undefined,
            cityZoneId: undefined,
            wardId: undefined,
          })}
          loading={loadingDiv}
          required={required('DIVISION')}
          disabled={disabled}
          placeholder={`Select ${label('division', locale)}`}
          mounted={mounted}
        />
      )}

      {showDistrict && (
        <LSelect
          id="loc-district"
          labelText={label('district', locale)}
          options={districts}
          value={value.districtId ?? ''}
          onChange={(id) => emit({
            districtId: id || undefined,
            upazilaId: undefined,
            unionId: undefined,
            cityCorporationId: undefined,
            cityZoneId: undefined,
            wardId: undefined,
          })}
          loading={loadingDist}
          required={required('DISTRICT')}
          disabled={disabled || !value.divisionId}
          placeholder={`Select ${label('district', locale)}`}
          mounted={mounted}
        />
      )}

      {showUpazila && (
        <LSelect
          id="loc-upazila"
          labelText={label('upazila', locale)}
          options={upazilas}
          value={value.upazilaId ?? ''}
          onChange={(id) => emit({
            upazilaId: id || undefined,
            unionId: undefined,
          })}
          loading={loadingUp}
          required={required('UPAZILA')}
          disabled={disabled || !value.districtId}
          placeholder={`Select ${label('upazila', locale)}`}
          mounted={mounted}
        />
      )}

      {showCityCorporation && corps.length > 0 && (
        <LSelect
          id="loc-corp"
          labelText={label('cityCorporation', locale)}
          options={corps}
          value={value.cityCorporationId ?? ''}
          onChange={(id) => emit({
            cityCorporationId: id || undefined,
            cityZoneId: undefined,
            wardId: undefined,
          })}
          loading={loadingCorp}
          required={required('CITY_CORPORATION')}
          disabled={disabled}
          placeholder={`Select ${label('cityCorporation', locale)}`}
          mounted={mounted}
        />
      )}

      {showZone && zones.length > 0 && (
        <LSelect
          id="loc-zone"
          labelText={label('zone', locale)}
          options={zones}
          value={value.cityZoneId ?? ''}
          onChange={(id) => emit({
            cityZoneId: id || undefined,
            wardId: undefined,
          })}
          loading={loadingZone}
          required={required('CITY_ZONE')}
          disabled={disabled || !value.cityCorporationId}
          placeholder={`Select ${label('zone', locale)}`}
          mounted={mounted}
        />
      )}

      {showWard && wards.length > 0 && (
        <LSelect
          id="loc-ward"
          labelText={label('ward', locale)}
          options={wards}
          value={value.wardId ?? ''}
          onChange={(id) => emit({ wardId: id || undefined })}
          loading={loadingWard}
          required={required('WARD')}
          disabled={disabled || !value.cityZoneId}
          placeholder={`Select ${label('ward', locale)}`}
          mounted={mounted}
        />
      )}

      {showUnion && unions.length > 0 && (
        <LSelect
          id="loc-union"
          labelText={label('union', locale)}
          options={unions}
          value={value.unionId ?? ''}
          onChange={(id) => emit({ unionId: id || undefined })}
          loading={loadingUnion}
          required={required('UNION')}
          disabled={disabled || !value.upazilaId}
          placeholder={`Select ${label('union', locale)}`}
          mounted={mounted}
        />
      )}

      {showAddressLine && (
        <div className="sm:col-span-2 flex flex-col gap-1">
          <label htmlFor="loc-address" className="text-sm font-medium text-gray-700">
            {label('addressLine', locale)}
          </label>
          <input
            id="loc-address"
            type="text"
            value={value.addressLine ?? ''}
            onChange={(e) => emit({ addressLine: e.target.value || undefined })}
            disabled={disabled}
            placeholder={locale === 'bn' ? 'বাড়ি নং, রোড, এলাকা…' : 'House no., Road, Area…'}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800
                       focus:border-(--bpa-green) focus:outline-none focus:ring-2 focus:ring-(--bpa-green)/20
                       disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          />
        </div>
      )}
    </div>
    </div>
  );
}
