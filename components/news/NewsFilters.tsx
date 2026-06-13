'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { Search, X } from 'lucide-react';

interface NewsFiltersProps {
  categories: string[];
  currentCategory: string;
  currentSearch: string;
}

export default function NewsFilters({ categories, currentCategory, currentSearch }: NewsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="search"
          defaultValue={currentSearch}
          placeholder="Search news…"
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--bpa-green) focus:border-transparent"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              updateParam('search', (e.target as HTMLInputElement).value);
            }
          }}
          onChange={(e) => {
            if (!e.target.value) updateParam('search', '');
          }}
        />
      </div>

      {/* Category tabs */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateParam('category', '')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              !currentCategory
                ? 'bg-(--bpa-green) text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => updateParam('category', cat === currentCategory ? '' : cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                currentCategory === cat
                  ? 'bg-(--bpa-green) text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
              {currentCategory === cat && <X size={10} className="inline ml-1" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
