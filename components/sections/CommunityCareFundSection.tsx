import Link from 'next/link';
import { Heart, ChevronRight } from 'lucide-react';
import type { CareFundOverview, CommunityZonePublic } from '@/types/bpa.types';

interface Props {
  overview: CareFundOverview | null;
  zones: CommunityZonePublic[];
}

export default function CommunityCareFundSection({ overview, zones }: Props) {
  const displayZones = zones.slice(0, 8);

  return (
    <section className="py-20 bg-(--bpa-navy) text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-(--bpa-green) font-semibold text-sm uppercase tracking-widest mb-3">Community Initiative</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Community Pet Care Fund</h2>
          <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Help build 8 Community Pet Clinics across Dhaka — open 24/7 for every pet owner.
            Contribute <strong className="text-white">৳3,000</strong> to become a Care Partner.
          </p>
        </div>

        {/* Stats */}
        {overview && (
          <div className="grid grid-cols-3 gap-6 text-center mb-12 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-(--bpa-green)">{overview.totalContributors.toLocaleString()}</div>
              <div className="text-xs text-gray-400 mt-1">Contributors</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-(--bpa-green)">৳{Number(overview.totalAmountBdt).toLocaleString()}</div>
              <div className="text-xs text-gray-400 mt-1">Collected</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-(--bpa-green)">{overview.totalActiveCards.toLocaleString()}</div>
              <div className="text-xs text-gray-400 mt-1">Care Cards</div>
            </div>
          </div>
        )}

        {/* Zone progress grid */}
        {displayZones.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {displayZones.map((zone) => {
              const pct = Math.min(Math.round((zone.currentContributors / zone.targetContributors) * 100), 100);
              return (
                <div key={zone.id} className="bg-white/10 rounded-xl p-4 hover:bg-white/15 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-semibold text-white truncate">{zone.name}</p>
                    <span className="text-xs text-(--bpa-green) font-bold shrink-0 ml-2">{pct}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1.5 mb-2">
                    <div className="bg-(--bpa-green) h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-gray-400">
                    {zone.currentContributors.toLocaleString()} / {zone.targetContributors.toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/community-pet-care/contribute"
            className="inline-flex items-center gap-2 bg-(--bpa-green) text-white px-7 py-3.5 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            <Heart size={18} /> Contribute ৳3,000
          </Link>
          <Link
            href="/community-pet-care"
            className="inline-flex items-center gap-2 border-2 border-white text-white px-7 py-3.5 rounded-lg font-semibold hover:bg-white hover:text-(--bpa-navy) transition-colors"
          >
            Learn More <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
