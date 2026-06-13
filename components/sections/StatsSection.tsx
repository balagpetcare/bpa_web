import type { HomepageSection } from '@/types/bpa.types';

const STATS = [
  { value: '2,500+', label: 'Active Members' },
  { value: '50+', label: 'Events Hosted' },
  { value: '8+', label: 'Years Active' },
  { value: '64', label: 'Districts Reached' },
];

export default function StatsSection({ section }: { section?: HomepageSection | null }) {
  const configured = section?.items?.length
    ? section.items.map((item) => ({ value: item.title ?? '', label: item.subtitle ?? item.body ?? '' })).filter((item) => item.value && item.label)
    : null;
  const stats = configured?.length ? configured : STATS;

  return (
    <section className="bg-white py-10 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="border border-gray-100 bg-(--bpa-green-light) px-5 py-6 text-center">
              <div className="text-4xl font-bold text-(--bpa-green) mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
