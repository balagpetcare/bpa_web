'use client';

import { useState, useMemo } from 'react';
import { Search, Users } from 'lucide-react';
import CommitteeMemberCard from './CommitteeMemberCard';
import CommitteeMemberModal from './CommitteeMemberModal';
import type { CommitteeMember } from '@/types/bpa.types';

interface CommitteeGridProps {
  members: CommitteeMember[];
}

function groupByDesignation(members: CommitteeMember[]): Map<string, CommitteeMember[]> {
  const groups = new Map<string, CommitteeMember[]>();

  // Leadership designations shown first
  const ORDER = [
    'President',
    'Vice President',
    'Secretary',
    'Joint Secretary',
    'Treasurer',
    'Assistant Treasurer',
    'Executive Member',
    'Advisory Member',
    'Advisor',
  ];

  const sorted = [...members].sort((a, b) => {
    const ai = ORDER.findIndex((t) => a.designation.toLowerCase().includes(t.toLowerCase()));
    const bi = ORDER.findIndex((t) => b.designation.toLowerCase().includes(t.toLowerCase()));
    const aRank = ai === -1 ? ORDER.length : ai;
    const bRank = bi === -1 ? ORDER.length : bi;
    if (aRank !== bRank) return aRank - bRank;
    return a.sortOrder - b.sortOrder;
  });

  for (const member of sorted) {
    const key = member.designation;
    const existing = groups.get(key) ?? [];
    groups.set(key, [...existing, member]);
  }

  return groups;
}

export default function CommitteeGrid({ members }: CommitteeGridProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<CommitteeMember | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return members;
    const q = query.toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.designation.toLowerCase().includes(q) ||
        (m.bio ?? '').toLowerCase().includes(q),
    );
  }, [members, query]);

  const groups = useMemo(() => groupByDesignation(filtered), [filtered]);

  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-10 max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="search"
          placeholder="Search by name or position…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-(--bpa-green) focus:border-transparent placeholder:text-gray-400 transition-colors"
        />
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-20">
          <Users size={40} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No members found</p>
          {query && (
            <p className="text-sm text-gray-400 mt-1">
              Try a different search term or{' '}
              <button
                className="text-(--bpa-green) hover:underline"
                onClick={() => setQuery('')}
              >
                clear the filter
              </button>
            </p>
          )}
        </div>
      )}

      {/* Grouped grid */}
      {Array.from(groups.entries()).map(([designation, group]) => (
        <section key={designation} className="mb-12 last:mb-0">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-lg font-bold text-(--bpa-green)">{designation}</h2>
            <span className="text-xs text-(--bpa-green) bg-(--bpa-green) px-2.5 py-0.5 rounded-full font-medium">
              {group.length}
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {group.map((member) => (
              <CommitteeMemberCard
                key={member.id}
                member={member}
                onClick={() => setSelected(member)}
              />
            ))}
          </div>
        </section>
      ))}

      <CommitteeMemberModal
        member={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
