'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const STATUSES = [
  { value: '', label: 'All' },
  { value: 'registration_open', label: 'Open' },
  { value: 'published', label: 'Upcoming' },
  { value: 'registration_closed', label: 'Closed' },
  { value: 'completed', label: 'Completed' },
];

const TYPES = [
  { value: '', label: 'All Types' },
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'deworming', label: 'Deworming' },
  { value: 'health_checkup', label: 'Health Check-up' },
  { value: 'sterilization', label: 'Sterilization' },
  { value: 'mixed', label: 'Mixed' },
];

interface Props {
  currentSearch: string;
  currentStatus: string;
  currentType: string;
}

export default function CampaignFilters({ currentSearch, currentStatus, currentType }: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  const push = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.delete('page');
    router.push(`/campaigns?${params.toString()}`);
  }, [router, sp]);

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Search */}
      <input
        type="search"
        placeholder="Search campaigns…"
        defaultValue={currentSearch}
        onChange={(e) => {
          const v = e.target.value.trim();
          if (v.length === 0 || v.length >= 2) push('search', v);
        }}
        className="flex-1 min-w-[180px] rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green) focus:border-transparent"
      />

      {/* Status tabs */}
      <div className="flex gap-1 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => push('status', s.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              currentStatus === s.value
                ? 'bg-(--bpa-green) text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Type select */}
      <select
        value={currentType}
        onChange={(e) => push('campaignType', e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green)"
      >
        {TYPES.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>
    </div>
  );
}
