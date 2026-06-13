'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { Search } from 'lucide-react';

interface EventsSearchProps {
  currentSearch: string;
}

export default function EventsSearch({ currentSearch }: EventsSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set('search', value);
      } else {
        params.delete('search');
      }
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  return (
    <div className="relative max-w-sm">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        type="search"
        defaultValue={currentSearch}
        placeholder="Search events…"
        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--bpa-green) focus:border-transparent"
        onKeyDown={(e) => {
          if (e.key === 'Enter') updateSearch((e.target as HTMLInputElement).value);
        }}
        onChange={(e) => {
          if (!e.target.value) updateSearch('');
        }}
      />
    </div>
  );
}
