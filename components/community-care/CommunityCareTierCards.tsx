'use client';

import type { ComponentType } from 'react';
import Link from 'next/link';
import { CheckCircle, ChevronRight, Crown, Star, Shield } from 'lucide-react';
import type { NormalizedTier } from '@/lib/community-care-normalizer';

interface Props {
  tiers: NormalizedTier[];
  compact?: boolean;
}

const TIER_ICONS: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  primary: Shield,
  premium: Star,
  enterprise: Crown,
};

const TIER_COLORS: Record<string, string> = {
  primary: 'text-blue-600 bg-blue-50 border-blue-100',
  premium: 'text-(--bpa-green) bg-(--bpa-green-light) border-green-100',
  enterprise: 'text-purple-600 bg-purple-50 border-purple-100',
};

export default function CommunityCareTierCards({ tiers, compact = false }: Props) {
  // Sort tiers by sortOrder if available
  const sortedTiers = [...tiers].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  return (
    <div className={`grid gap-8 ${compact ? 'lg:grid-cols-3' : 'lg:grid-cols-3'} items-stretch`}>
      {sortedTiers.map((tier) => {
        const Icon = TIER_ICONS[tier.slug] || Star;
        const colorClass = TIER_COLORS[tier.slug] || TIER_COLORS.premium;
        const isPremium = tier.slug === 'premium';

        return (
          <div
            key={tier.id}
            className={`relative flex flex-col bg-white rounded-3xl border-2 p-6 sm:p-8 transition-all hover:shadow-2xl group ${
              isPremium 
                ? 'border-(--bpa-green) shadow-xl lg:scale-[1.05] z-10' 
                : 'border-gray-100 hover:border-gray-200'
            }`}
          >
            {isPremium && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-(--bpa-green) text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg whitespace-nowrap">
                Most Popular
              </div>
            )}

            <div className={`self-start p-3 rounded-2xl mb-6 ${colorClass}`}>
              <Icon size={24} />
            </div>

            <h3 className="text-2xl font-black text-(--bpa-navy) mb-1">{tier.nameEn}</h3>
            <p className="text-sm text-gray-400 font-medium mb-6">{tier.nameBn}</p>

            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-black ${tier.isOfferActiveForTier ? 'text-(--bpa-green)' : 'text-(--bpa-navy)'}`}>
                  ৳{tier.displayPrice.toLocaleString()}
                </span>
                {tier.isOfferActiveForTier && tier.strikePrice && (
                  <span className="text-lg text-gray-400 line-through font-semibold">
                    ৳{tier.strikePrice.toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 font-bold mt-1 uppercase tracking-wider">
                {tier.validityLabel} Validity
              </p>
            </div>

            <div className="space-y-4 mb-8">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-(--bpa-navy) font-bold text-sm shrink-0 border border-gray-100">
                   {tier.petLimitMax}
                 </div>
                 <div className="text-sm text-gray-600">
                    <span className="font-bold text-(--bpa-navy)">{tier.petLimitLabel}</span> Covered
                 </div>
               </div>

               {tier.serviceDiscounts && tier.serviceDiscounts.length > 0 && (
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-(--bpa-green) font-bold text-sm shrink-0 border border-green-100">
                      {Math.max(...tier.serviceDiscounts.map(d => d.discountValue))}%
                    </div>
                    <div className="text-sm text-gray-600">
                       Up to <span className="font-bold text-(--bpa-green)">{Math.max(...tier.serviceDiscounts.map(d => d.discountValue))}% Discount</span> on services
                    </div>
                 </div>
               )}
            </div>

            <div className="border-t border-gray-100 pt-6 mt-auto">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Key Benefits</p>
              <ul className="space-y-3 mb-8">
                {tier.benefits.slice(0, 6).map((b) => (
                  <li key={b.id} className="flex items-start gap-3 text-sm text-gray-600">
                    <CheckCircle size={18} className="text-(--bpa-green) shrink-0 mt-0.5" />
                    <span className="font-medium">{b.titleEn}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href={`/community-pet-care/contribute?tier=${tier.slug}`}
              className={`w-full text-center py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
                isPremium
                  ? 'bg-(--bpa-green) text-white shadow-lg shadow-green-100 hover:shadow-green-200 hover:-translate-y-1'
                  : 'bg-gray-100 text-(--bpa-navy) hover:bg-gray-200'
              }`}
            >
              {tier.isOfferActiveForTier ? 'Get Launch Offer' : 'Get Started'}
              <ChevronRight size={18} />
            </Link>
          </div>
        );
      })}
    </div>
  );
}
