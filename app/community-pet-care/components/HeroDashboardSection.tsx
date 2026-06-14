import Link from 'next/link';
import { Heart, MapPin, Users, TrendingUp, CreditCard, Building2 } from 'lucide-react';

interface HeroStats {
  totalContributors: number;
  totalRaised: number;
  totalActiveCards: number;
  zonesCount: number;
}

export default function HeroDashboardSection({ stats }: { stats: HeroStats }) {
  const kpis = [
    {
      icon: Users,
      value: stats.totalContributors > 0 ? stats.totalContributors.toLocaleString() : '—',
      label: 'Contributors',
      labelBn: 'অবদানকারী',
    },
    {
      icon: TrendingUp,
      value: stats.totalRaised > 0 ? `৳${stats.totalRaised.toLocaleString()}` : '৳0',
      label: 'Collected',
      labelBn: 'সংগৃহীত',
    },
    {
      icon: CreditCard,
      value: stats.totalActiveCards > 0 ? stats.totalActiveCards.toLocaleString() : '—',
      label: 'Active Cards',
      labelBn: 'সক্রিয় কার্ড',
    },
    {
      icon: Building2,
      value: `${stats.zonesCount}/8`,
      label: 'Zones Active',
      labelBn: 'সক্রিয় জোন',
    },
  ];

  return (
    <section className="relative bg-(--bpa-navy) text-white overflow-hidden">
      {/* Ambient green glow — top right */}
      <div
        className="absolute -top-48 -right-48 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(26,107,60,0.18) 0%, transparent 70%)' }}
      />
      {/* Fine grid texture */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-24 pb-20">
        {/* Live eyebrow pill */}
        <div className="inline-flex items-center gap-2.5 bg-white/[0.06] border border-white/[0.10] rounded-full px-4 py-1.5 mb-10">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="ping-dot absolute inset-0 rounded-full text-(--bpa-green)" />
            <span className="relative w-2 h-2 rounded-full bg-(--bpa-green)" />
          </span>
          <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-[0.18em]">
            Bangladesh Pet Association — Live Programme
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-[0.92] mb-5">
          <span className="block text-white">Community</span>
          <span className="block text-(--bpa-green)">Pet Care.</span>
        </h1>

        {/* Bengali sub-headline */}
        <p className="text-xl sm:text-2xl text-gray-500 font-light tracking-wide mb-6">
          কমিউনিটি পেট কেয়ার উদ্যোগ
        </p>

        {/* Supporting statement */}
        <p className="text-lg text-gray-400 max-w-lg leading-relaxed mb-14">
          Bangladesh&apos;s first community-funded national pet healthcare network — building
          8 round-the-clock community clinics across Dhaka, zone by zone.
        </p>

        {/* Instrument panel — KPI stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.08] rounded-2xl overflow-hidden mb-12 border border-white/[0.08]">
          {kpis.map(({ icon: Icon, value, label, labelBn }) => (
            <div
              key={label}
              className="bg-(--bpa-navy) hover:bg-[#1f2d50] transition-colors duration-200 p-6 lg:p-7 flex flex-col"
            >
              <Icon size={15} className="text-(--bpa-green) mb-4 opacity-60" />
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">
                {value}
              </div>
              <div className="text-sm font-medium text-gray-400 mt-2 leading-tight">{label}</div>
              <div className="text-xs text-gray-600 mt-0.5">{labelBn}</div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/community-pet-care/contribute"
            className="inline-flex items-center gap-2.5 bg-(--bpa-green) hover:bg-[#145530] text-white px-7 py-3.5 rounded-xl font-bold text-base tracking-tight transition-colors shadow-lg shadow-black/20"
          >
            <Heart size={17} fill="currentColor" strokeWidth={0} />
            Contribute ৳3,000
          </Link>
          <Link
            href="/community-pet-care/zones"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white px-5 py-3.5 rounded-xl font-semibold hover:bg-white/[0.06] border border-transparent hover:border-white/[0.12] transition-all"
          >
            Explore Zones
            <MapPin size={15} className="opacity-60" />
          </Link>
        </div>
      </div>

      {/* Bottom separator line */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
    </section>
  );
}
