'use client';

import { useEffect, useState } from 'react';
import { Building2, MapPin, Users, CalendarDays, X, ChevronDown } from 'lucide-react';
import type { CampaignCoverageSummary } from '@/types/bpa.types';

interface Props {
  campaignTitle: string;
  summary: CampaignCoverageSummary | null;
}

function Tile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-(--bpa-green-light) p-4 text-center">
      <div className="flex items-center justify-center gap-1.5 text-(--bpa-green)">
        {icon}
        <p className="text-2xl font-extrabold">{value}</p>
      </div>
      <p className="text-xs font-semibold mt-1 text-(--bpa-green)/80 uppercase tracking-wide">{label}</p>
    </div>
  );
}

export default function CoverageSummary({ campaignTitle, summary }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen]);

  // Missing/partial coverage data must never crash the page — render nothing
  // rather than a broken widget when the coverage endpoint has no data yet.
  if (!summary || summary.venues === 0) return null;

  const subtitle = summary.divisionsCovered >= 6
    ? 'Nationwide vaccination coverage across Bangladesh'
    : `Coverage across ${summary.venues} venue${summary.venues !== 1 ? 's' : ''} in ${summary.districtsCovered} district${summary.districtsCovered !== 1 ? 's' : ''}`;

  return (
    <section id="locations" aria-labelledby="coverage-heading">
      <h2 id="coverage-heading" className="text-2xl font-bold text-(--bpa-navy) mb-6 flex items-center gap-2">
        <Building2 size={20} className="text-(--bpa-green)" />Campaign Coverage
      </h2>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Tile icon={<MapPin size={16} />} label="Divisions" value={String(summary.divisionsCovered)} />
          <Tile icon={<MapPin size={16} />} label="Districts" value={String(summary.districtsCovered)} />
          <Tile icon={<Building2 size={16} />} label="Venues" value={String(summary.venues)} />
          <Tile icon={<CalendarDays size={16} />} label="Sessions" value={String(summary.sessions)} />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="rounded-xl bg-blue-50 p-4 text-center">
            <p className="text-2xl font-extrabold text-(--bpa-navy)">{summary.totalCapacity.toLocaleString()}</p>
            <p className="text-xs font-semibold mt-1 text-(--bpa-navy)/70 uppercase tracking-wide">Total Capacity</p>
          </div>
          <div className="rounded-xl bg-amber-50 p-4 text-center">
            <p className="text-2xl font-extrabold text-amber-700">{summary.availableSlots.toLocaleString()}</p>
            <p className="text-xs font-semibold mt-1 text-amber-700/70 uppercase tracking-wide">Slots Available</p>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-5">{subtitle}</p>

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="mt-4 inline-flex items-center gap-2 bg-(--bpa-green) text-white text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-(--color-bpa-green-dark) transition-colors"
        >
          <Users size={15} /> Explore Coverage
        </button>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-labelledby="coverage-drawer-heading">
          <button
            type="button"
            aria-label="Close coverage details"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-slate-950/50"
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
              <div>
                <h3 id="coverage-drawer-heading" className="font-bold text-(--bpa-navy) text-base">Coverage Areas</h3>
                <p className="text-xs text-gray-500">{campaignTitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close"
                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {summary.breakdown.map((division) => (
                <details key={division.id ?? division.name} className="group border border-gray-200 rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer list-none font-semibold text-sm text-(--bpa-navy) bg-gray-50 hover:bg-gray-100 transition-colors">
                    <span>{division.name}</span>
                    <span className="flex items-center gap-2 text-xs text-gray-400 font-normal">
                      {division.districts.length} district{division.districts.length !== 1 ? 's' : ''}
                      <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
                    </span>
                  </summary>
                  <div className="px-4 py-3 space-y-2 border-t border-gray-100">
                    {division.districts.map((district) => (
                      <details key={district.id ?? district.name} className="group/d border border-gray-100 rounded-lg overflow-hidden">
                        <summary className="flex items-center justify-between gap-2 px-3 py-2 cursor-pointer list-none text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                          <span>{district.name}</span>
                          <span className="flex items-center gap-1.5 text-gray-400 font-normal">
                            {district.venues.length} venue{district.venues.length !== 1 ? 's' : ''}
                            <ChevronDown size={12} className="group-open/d:rotate-180 transition-transform" />
                          </span>
                        </summary>
                        <ul className="px-3 py-2 space-y-2 border-t border-gray-50">
                          {district.venues.map((venue) => (
                            <li key={venue.id} className="pl-3 border-l-2 border-(--bpa-green-light)">
                              <p className="text-sm font-medium text-(--bpa-navy)">{venue.name}</p>
                              <p className="text-xs text-gray-400">{venue.address}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {venue.sessionCount} session{venue.sessionCount !== 1 ? 's' : ''} · {venue.capacity.toLocaleString()} capacity
                              </p>
                            </li>
                          ))}
                        </ul>
                      </details>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
