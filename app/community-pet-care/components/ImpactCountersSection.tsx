import { Dog, Syringe, HeartHandshake, Utensils, HandCoins } from 'lucide-react';
import type { PublicImpactStats } from '@/types/bpa.types';

const FALLBACK: PublicImpactStats = {
  strayAnimalsSupported: 0,
  animalsVaccinated: 0,
  rescueCasesSupported: 0,
  feedingProgramsRun: 0,
  lowIncomeFamiliesAssisted: 0,
  totalContributors: 0,
  totalZones: 0,
};

const METRICS = [
  {
    key: 'strayAnimalsSupported' as keyof PublicImpactStats,
    icon: Dog,
    labelEn: 'Stray Animals Supported',
    labelBn: 'পথ প্রাণী সহায়তা',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    numColor: 'text-amber-500',
  },
  {
    key: 'animalsVaccinated' as keyof PublicImpactStats,
    icon: Syringe,
    labelEn: 'Animals Vaccinated',
    labelBn: 'টিকাদান করা প্রাণী',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    numColor: 'text-blue-500',
  },
  {
    key: 'rescueCasesSupported' as keyof PublicImpactStats,
    icon: HeartHandshake,
    labelEn: 'Rescue Cases',
    labelBn: 'উদ্ধার কার্যক্রম',
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-500',
    numColor: 'text-rose-500',
  },
  {
    key: 'feedingProgramsRun' as keyof PublicImpactStats,
    icon: Utensils,
    labelEn: 'Feeding Programs',
    labelBn: 'খাদ্য সরবরাহ',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    numColor: 'text-emerald-600',
  },
  {
    key: 'lowIncomeFamiliesAssisted' as keyof PublicImpactStats,
    icon: HandCoins,
    labelEn: 'Families Assisted',
    labelBn: 'পরিবার সহায়তা',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    numColor: 'text-purple-600',
  },
];

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

interface Props {
  stats: PublicImpactStats | null;
}

export default function ImpactCountersSection({ stats }: Props) {
  const data = stats ?? FALLBACK;
  const hasData = (data.totalContributors ?? 0) > 0;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-bold text-(--bpa-green) uppercase tracking-[0.18em] mb-5">
            Programme Impact
          </p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-(--bpa-navy) leading-tight mb-4">
            Impact in numbers.
          </h2>
          <p className="text-xl sm:text-2xl text-gray-400 font-light">
            সংখ্যায় আপনার অবদানের প্রভাব
          </p>
        </div>

        {/* KPI strip — unified bordered panel with 1px dividers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          {METRICS.map(({ key, icon: Icon, labelEn, labelBn, iconBg, iconColor, numColor }) => {
            const n = Number(data[key] ?? 0);
            const display = hasData && n > 0 ? fmt(n) : '—';
            return (
              <div
                key={key}
                className="group bg-white p-7 lg:p-8 flex flex-col items-center text-center hover:bg-gray-50/80 transition-colors duration-200"
              >
                {/* Icon circle */}
                <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-200`}>
                  <Icon size={22} className={iconColor} />
                </div>

                {/* Big number */}
                <div className={`text-5xl lg:text-6xl font-black tracking-tight leading-none mb-3 ${numColor}`}>
                  {display}
                </div>

                {/* Labels */}
                <div className="text-sm font-semibold text-(--bpa-navy) leading-tight">
                  {labelEn}
                </div>
                <div className="text-sm text-gray-400 mt-1 leading-snug">
                  {labelBn}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footnote */}
        <p className="text-center text-sm text-gray-400 mt-8 max-w-2xl mx-auto leading-relaxed">
          {hasData
            ? 'Cumulative programme estimates based on contribution and zone activity data.'
            : 'Impact figures will update as the programme grows and contributors join.'}
          <br />
          <span className="text-gray-300">
            পরিসংখ্যান অবদান ও জোন কার্যক্রম ডেটার উপর ভিত্তি করে আনুমানিক।
          </span>
        </p>
      </div>
    </section>
  );
}
