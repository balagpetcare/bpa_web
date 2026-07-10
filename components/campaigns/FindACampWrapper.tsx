'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { MapPin, Building2, CalendarDays, ChevronRight, Search } from 'lucide-react';
import NotifyMeForm from '@/components/campaigns/NotifyMeForm';
import { getLocationChildren, type LocationNode } from '@/lib/api/locations';
import { getPublicCampaignVenues, type PublicCampaignVenue, type PublicCampaignVenueFilters } from '@/lib/api/campaigns';

type AreaMode = 'dhaka' | 'outside' | null;

// Dhaka's two city corporations under the Dhaka district — used to route
// "Dhaka City" straight to City Corporation -> Zone -> Ward instead of the
// rural Upazila -> Union chain.
const DHAKA_DIVISION_NAME = 'Dhaka';
const DHAKA_DISTRICT_NAME = 'Dhaka';

export default function FindACampWrapper() {
  const [mode, setMode] = useState<AreaMode>(null);

  const [divisions, setDivisions] = useState<LocationNode[]>([]);
  const [division, setDivision] = useState<LocationNode | null>(null);

  const [districts, setDistricts] = useState<LocationNode[]>([]);
  const [district, setDistrict] = useState<LocationNode | null>(null);

  // Rural chain: Upazila -> Union. Urban (Dhaka) chain: City Corporation -> Zone.
  const [subAreas, setSubAreas] = useState<LocationNode[]>([]);
  const [subArea, setSubArea] = useState<LocationNode | null>(null);

  const [venues, setVenues] = useState<PublicCampaignVenue[] | null>(null);
  const [loadingVenues, setLoadingVenues] = useState(false);

  // Load divisions once
  useEffect(() => {
    getLocationChildren(null).then(setDivisions).catch(() => setDivisions([]));
  }, []);

  // Load districts when a division is picked
  useEffect(() => {
    setDistrict(null); setDistricts([]); setSubArea(null); setSubAreas([]); setVenues(null);
    if (!division) return;
    getLocationChildren(division.id).then(setDistricts).catch(() => setDistricts([]));
  }, [division]);

  const isDhaka = division?.nameEn === DHAKA_DIVISION_NAME && district?.nameEn === DHAKA_DISTRICT_NAME;

  // Load sub-areas (Upazila or, for Dhaka district, City Corporation) when a district is picked
  useEffect(() => {
    setSubArea(null); setSubAreas([]); setVenues(null);
    if (!district) return;
    const type = isDhaka ? 'CITY_CORPORATION' : 'UPAZILA';
    getLocationChildren(district.id, type).then(setSubAreas).catch(() => setSubAreas([]));
  }, [district, isDhaka]);

  const filters: PublicCampaignVenueFilters = useMemo(() => {
    if (!subArea) {
      return district ? { districtId: district.id } : division ? { divisionId: division.id } : {};
    }
    return isDhaka ? { cityCorporationId: subArea.id } : { upazilaId: subArea.id };
  }, [division, district, subArea, isDhaka]);

  const areaLabel = subArea?.nameEn ?? district?.nameEn ?? division?.nameEn ?? 'your area';

  useEffect(() => {
    if (!division) { setVenues(null); return; }
    setLoadingVenues(true);
    getPublicCampaignVenues(filters)
      .then(setVenues)
      .catch(() => setVenues([]))
      .finally(() => setLoadingVenues(false));
  }, [division, filters]);

  function resetAll() {
    setMode(null); setDivision(null); setDistrict(null); setSubArea(null); setVenues(null);
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step 0: Dhaka City vs Outside Dhaka */}
      {!mode && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setMode('dhaka')}
            className="text-left p-6 rounded-2xl border-2 border-gray-200 hover:border-(--bpa-green) hover:shadow-sm transition-all"
          >
            <Building2 className="text-(--bpa-green) mb-2" size={24} />
            <p className="font-bold text-(--bpa-navy)">Dhaka City</p>
            <p className="text-xs text-gray-500 mt-1">Browse by City Corporation, Zone &amp; Ward</p>
          </button>
          <button
            type="button"
            onClick={() => setMode('outside')}
            className="text-left p-6 rounded-2xl border-2 border-gray-200 hover:border-(--bpa-green) hover:shadow-sm transition-all"
          >
            <MapPin className="text-(--bpa-green) mb-2" size={24} />
            <p className="font-bold text-(--bpa-navy)">Outside Dhaka</p>
            <p className="text-xs text-gray-500 mt-1">Browse by Division, District &amp; Upazila</p>
          </button>
        </div>
      )}

      {mode && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7">
          <div className="flex items-center justify-between mb-5">
            <button type="button" onClick={resetAll} className="text-xs text-gray-500 hover:text-(--bpa-navy)">
              ← Start over
            </button>
            <span className="text-xs font-semibold text-(--bpa-green) uppercase tracking-wide">
              {mode === 'dhaka' ? 'Dhaka City' : 'Outside Dhaka'}
            </span>
          </div>

          {/* Division select */}
          <LocationDropdown
            label="Division"
            value={division}
            options={mode === 'dhaka' ? divisions.filter(d => d.nameEn === DHAKA_DIVISION_NAME) : divisions}
            onSelect={setDivision}
          />

          {division && (
            <LocationDropdown
              label="District"
              value={district}
              options={mode === 'dhaka' ? districts.filter(d => d.nameEn === DHAKA_DISTRICT_NAME) : districts}
              onSelect={setDistrict}
            />
          )}

          {district && subAreas.length > 0 && (
            <LocationDropdown
              label={isDhaka ? 'City Corporation' : 'Upazila'}
              value={subArea}
              options={subAreas}
              onSelect={setSubArea}
            />
          )}

          {/* Results */}
          {division && (
            <div className="mt-6 pt-5 border-t border-gray-100">
              {loadingVenues ? (
                <p className="text-sm text-gray-400 text-center py-8">Searching venues in {areaLabel}…</p>
              ) : !venues || venues.length === 0 ? (
                <div className="text-center py-8 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <Search size={26} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm font-semibold text-(--bpa-navy) mb-1">No venue created for this area yet</p>
                  <p className="text-xs text-gray-500 mb-4">
                    We don&apos;t have an upcoming vaccination camp in {areaLabel} right now.
                  </p>
                  <div className="flex justify-center">
                    <NotifyMeForm areaLabel={areaLabel} />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 mb-2">
                    {venues.length} venue{venues.length !== 1 ? 's' : ''} with an upcoming campaign in {areaLabel}
                  </p>
                  {venues.map(v => (
                    <div key={v.id} className="p-4 rounded-xl border border-gray-200">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-bold text-(--bpa-navy) text-sm">{v.name}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{v.locationPath.map(l => l.nameEn).join(' › ')}</p>
                          {v.address && <p className="text-[11px] text-gray-400 mt-0.5">{v.address}</p>}
                        </div>
                      </div>
                      <div className="mt-3 space-y-1.5">
                        {v.campaignSessions.slice(0, 3).map(s => (
                          <Link
                            key={s.id}
                            href={`/campaigns/${s.campaign.slug}/register?sessionId=${s.id}`}
                            className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-(--bpa-green-light) hover:bg-(--bpa-green)/20 transition-colors"
                          >
                            <span className="flex items-center gap-1.5 font-medium text-(--bpa-navy)">
                              <CalendarDays size={12} />
                              {s.campaign.title} · {new Date(s.sessionDate).toLocaleDateString()}
                            </span>
                            <ChevronRight size={14} className="text-(--bpa-green)" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LocationDropdown({
  label, value, options, onSelect,
}: {
  label: string;
  value: LocationNode | null;
  options: LocationNode[];
  onSelect: (node: LocationNode | null) => void;
}) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      <select
        value={value?.id ?? ''}
        onChange={(e) => onSelect(options.find(o => o.id === e.target.value) ?? null)}
        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-(--bpa-green) bg-white"
      >
        <option value="">Select {label}</option>
        {options.map(o => <option key={o.id} value={o.id}>{o.nameEn}</option>)}
      </select>
    </div>
  );
}
