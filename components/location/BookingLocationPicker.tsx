'use client';

/**
 * Location-first entry point for the public booking flow.
 *
 * Dhaka City:    City Corporation -> Zone -> Ward
 * Outside Dhaka: Division -> District -> Upazila -> Union
 *
 * Emits the single deepest-selected location id once the user has picked
 * as far down the chain as they want to go (any level can be "final" —
 * e.g. picking just a District is enough to search).
 */

import React, { useEffect, useState } from 'react';
import { fetchLocations, type LocationOption } from './LocationSelector';

export type BookingMode = 'dhaka' | 'outside';

interface Props {
  onSelect: (locationId: string, mode: BookingMode) => void;
}

function LSelect({
  labelText, options, value, onChange, loading, disabled, placeholder,
}: {
  labelText: string;
  options: LocationOption[];
  value: string;
  onChange: (val: string) => void;
  loading?: boolean;
  disabled?: boolean;
  placeholder: string;
}) {
  const isDisabled = Boolean(disabled) || Boolean(loading) || options.length === 0;
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{labelText}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isDisabled}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800
                   focus:border-(--bpa-green) focus:outline-none focus:ring-2 focus:ring-(--bpa-green)/20
                   disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        <option value="">{loading ? 'Loading…' : options.length === 0 ? '—' : placeholder}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>{opt.nameEn}{opt.nameBn ? ` (${opt.nameBn})` : ''}</option>
        ))}
      </select>
    </div>
  );
}

export default function BookingLocationPicker({ onSelect }: Props) {
  const [mode, setMode] = useState<BookingMode>('outside');

  // Outside Dhaka chain
  const [divisions, setDivisions] = useState<LocationOption[]>([]);
  const [districts, setDistricts] = useState<LocationOption[]>([]);
  const [upazilas, setUpazilas] = useState<LocationOption[]>([]);
  const [unions, setUnions] = useState<LocationOption[]>([]);
  const [divisionId, setDivisionId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [upazilaId, setUpazilaId] = useState('');
  const [unionId, setUnionId] = useState('');
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // Dhaka City chain
  const [cityCorps, setCityCorps] = useState<LocationOption[]>([]);
  const [zones, setZones] = useState<LocationOption[]>([]);
  const [wards, setWards] = useState<LocationOption[]>([]);
  const [cityCorpId, setCityCorpId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [wardId, setWardId] = useState('');

  function setLoad(key: string, val: boolean) {
    setLoading((prev) => ({ ...prev, [key]: val }));
  }

  useEffect(() => {
    if (mode !== 'outside') return;
    setLoad('division', true);
    fetchLocations('DIVISION').then(setDivisions).finally(() => setLoad('division', false));
  }, [mode]);

  useEffect(() => {
    setDistricts([]); setDistrictId(''); setUpazilas([]); setUpazilaId(''); setUnions([]); setUnionId('');
    if (!divisionId) return;
    setLoad('district', true);
    fetchLocations('DISTRICT', divisionId).then(setDistricts).finally(() => setLoad('district', false));
  }, [divisionId]);

  useEffect(() => {
    setUpazilas([]); setUpazilaId(''); setUnions([]); setUnionId('');
    if (!districtId) return;
    setLoad('upazila', true);
    fetchLocations('UPAZILA', districtId).then(setUpazilas).finally(() => setLoad('upazila', false));
  }, [districtId]);

  useEffect(() => {
    setUnions([]); setUnionId('');
    if (!upazilaId) return;
    setLoad('union', true);
    fetchLocations('UNION', upazilaId).then(setUnions).finally(() => setLoad('union', false));
  }, [upazilaId]);

  useEffect(() => {
    if (mode !== 'dhaka') return;
    setLoad('cityCorp', true);
    fetchLocations('CITY_CORPORATION').then(setCityCorps).finally(() => setLoad('cityCorp', false));
  }, [mode]);

  useEffect(() => {
    setZones([]); setZoneId(''); setWards([]); setWardId('');
    if (!cityCorpId) return;
    setLoad('zone', true);
    fetchLocations('CITY_ZONE', cityCorpId).then(setZones).finally(() => setLoad('zone', false));
  }, [cityCorpId]);

  useEffect(() => {
    setWards([]); setWardId('');
    if (!zoneId) return;
    setLoad('ward', true);
    fetchLocations('WARD', zoneId).then(setWards).finally(() => setLoad('ward', false));
  }, [zoneId]);

  function switchMode(next: BookingMode) {
    setMode(next);
    setDivisionId(''); setDistrictId(''); setUpazilaId(''); setUnionId('');
    setCityCorpId(''); setZoneId(''); setWardId('');
  }

  // "Find campaigns" is enabled once the user has picked at least one level
  // in the active chain — deepest non-empty selection is what we search by.
  const deepestOutside = unionId || upazilaId || districtId || divisionId;
  const deepestDhaka = wardId || zoneId || cityCorpId;
  const canSearch = mode === 'outside' ? Boolean(deepestOutside) : Boolean(deepestDhaka);

  function handleSearch() {
    if (mode === 'outside' && deepestOutside) onSelect(deepestOutside, 'outside');
    if (mode === 'dhaka' && deepestDhaka) onSelect(deepestDhaka, 'dhaka');
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-(--bpa-navy) mb-1">Where are you located?</h2>
      <p className="text-sm text-gray-500 mb-4">We&apos;ll show campaigns available in your area first.</p>

      <div className="inline-flex rounded-xl border border-gray-200 p-1 mb-5 bg-gray-50">
        <button
          type="button"
          onClick={() => switchMode('outside')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${mode === 'outside' ? 'bg-(--bpa-green) text-white' : 'text-gray-600'}`}
        >
          Outside Dhaka
        </button>
        <button
          type="button"
          onClick={() => switchMode('dhaka')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${mode === 'dhaka' ? 'bg-(--bpa-green) text-white' : 'text-gray-600'}`}
        >
          Dhaka City
        </button>
      </div>

      {mode === 'outside' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LSelect labelText="Division" options={divisions} value={divisionId} onChange={setDivisionId} loading={loading.division} placeholder="Select Division" />
          <LSelect labelText="District" options={districts} value={districtId} onChange={setDistrictId} loading={loading.district} disabled={!divisionId} placeholder="Select District" />
          <LSelect labelText="Upazila" options={upazilas} value={upazilaId} onChange={setUpazilaId} loading={loading.upazila} disabled={!districtId} placeholder="Select Upazila" />
          <LSelect labelText="Union" options={unions} value={unionId} onChange={setUnionId} loading={loading.union} disabled={!upazilaId} placeholder="Select Union" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LSelect labelText="City Corporation" options={cityCorps} value={cityCorpId} onChange={setCityCorpId} loading={loading.cityCorp} placeholder="Select City Corporation" />
          <LSelect labelText="Zone" options={zones} value={zoneId} onChange={setZoneId} loading={loading.zone} disabled={!cityCorpId} placeholder="Select Zone" />
          <LSelect labelText="Ward" options={wards} value={wardId} onChange={setWardId} loading={loading.ward} disabled={!zoneId} placeholder="Select Ward" />
        </div>
      )}

      <button
        type="button"
        onClick={handleSearch}
        disabled={!canSearch}
        className="mt-5 w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-(--bpa-green) text-white font-semibold text-sm px-6 py-3 hover:bg-(--color-bpa-green-dark) transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Find Campaigns
      </button>
    </div>
  );
}
