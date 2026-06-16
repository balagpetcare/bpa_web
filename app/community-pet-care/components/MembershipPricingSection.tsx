'use client';

import Link from 'next/link';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import type { MembershipOverview } from '@/lib/api/community-membership';
import { normalizeMembershipOverview } from '@/lib/community-care-normalizer';
import LaunchOfferCountdown from '@/components/community-care/LaunchOfferCountdown';
import CommunityCareTierCards from '@/components/community-care/CommunityCareTierCards';

interface Props {
  overview: MembershipOverview | null;
}

export default function MembershipPricingSection({ overview: rawOverview }: Props) {
  const overview = normalizeMembershipOverview(rawOverview);
  if (!overview) return null;

  const { program, tiers, services, discounts } = overview;
  
  // Filter tiers based on offer state:
  const visibleTiers = tiers.filter((t) => {
    if (!t.isActive) return false;
    if (!program.isOfferActive && program.priceAfterOffer === 'HIDE_TIER') return false;
    return true;
  });

  if (visibleTiers.length === 0 && !program.isOfferActive) return null;

  return (
    <>
      {/* 1 — Large Launch Offer Countdown */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <LaunchOfferCountdown program={program} />
      </div>

      {/* 2 — Expired offer notification is handled by LaunchOfferCountdown component internally if needed */}

      {/* 3 — Tier Cards Section */}
      <section className="py-20 bg-gray-50 overflow-hidden scroll-mt-20" id="tiers">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-(--bpa-green) font-black text-sm uppercase tracking-[0.2em] mb-4">Choose Your Card Tier</p>
            <h2 className="text-3xl sm:text-5xl font-black text-(--bpa-navy) mb-6">
              BPA Community Care Partner Card
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Select a tier that fits your needs and unlock exclusive benefits while supporting community pet clinics.
            </p>
          </div>

          <CommunityCareTierCards 
            tiers={visibleTiers} 
          />

          {/* Service Discount Comparison Table */}
          {services.length > 0 && discounts.length > 0 && (
            <div className="mt-32">
              <div className="text-center mb-12">
                <h3 className="text-2xl sm:text-3xl font-black text-(--bpa-navy) mb-4">
                  Service Discount Comparison
                </h3>
                <p className="text-gray-500 font-medium">
                  Estimated savings per service across different card tiers
                </p>
              </div>

              <div className="overflow-x-auto rounded-3xl border-2 border-gray-100 shadow-sm bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50/50 border-b-2 border-gray-100">
                      <th className="text-left p-6 font-bold text-(--bpa-navy) uppercase tracking-wider">Service</th>
                      <th className="text-center p-6 font-bold text-(--bpa-navy) uppercase tracking-wider">Base Price</th>
                      {visibleTiers.map((t) => (
                        <th key={t.id} className="text-center p-6 font-bold text-(--bpa-green) uppercase tracking-wider">
                          {t.nameEn}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {services.slice(0, 15).map((svc) => (
                      <tr key={svc.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-6">
                           <div className="font-bold text-(--bpa-navy)">{svc.nameEn}</div>
                           <div className="text-xs text-gray-400 mt-0.5">{svc.nameBn}</div>
                        </td>
                        <td className="p-6 text-center font-bold text-gray-400">
                          ৳{svc.basePriceBdt.toLocaleString()}
                        </td>
                        {visibleTiers.map((t) => {
                          const d = discounts.find((disc) => disc.tierId === t.id && disc.serviceId === svc.id);
                          if (!d) return <td key={t.id} className="p-6 text-center text-gray-300">—</td>;
                          const saved = d.discountType === 'PERCENTAGE'
                            ? Math.round(svc.basePriceBdt * d.discountValue / 100)
                            : d.discountValue;
                          return (
                            <td key={t.id} className="p-6 text-center">
                              <div className="text-(--bpa-green) font-black text-base">
                                {d.discountType === 'PERCENTAGE' ? `${d.discountValue}% off` : `৳${d.discountValue.toLocaleString()} off`}
                              </div>
                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mt-1">
                                save ৳{saved.toLocaleString()}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4">
                 <div className="bg-blue-500 text-white p-1 rounded-full mt-0.5 shrink-0">
                    <ChevronRight size={14} />
                 </div>
                 <p className="text-sm text-blue-800 leading-relaxed font-medium">
                   Prices shown are estimated based on standard clinic rates. Actual savings may vary depending on specific treatment requirements and clinic location. Service discounts apply for 5 years from the date of card activation.
                 </p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {visibleTiers.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-bold text-lg">Membership tiers are currently being updated. Please check back later.</p>
            </div>
          )}

          <div className="text-center mt-20">
            <Link
              href="/community-pet-care/contribute"
              className="group inline-flex items-center gap-3 bg-(--bpa-green) text-white px-10 py-5 rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-green-200 hover:-translate-y-1 transition-all"
            >
              Get Your BPA Community Care Partner Card 
              <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
