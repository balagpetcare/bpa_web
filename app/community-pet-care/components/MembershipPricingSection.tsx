import Link from 'next/link';
import { CheckCircle, Clock, ChevronRight, AlertTriangle } from 'lucide-react';
import type { MembershipOverview } from '@/lib/api/community-membership';

interface Props {
  overview: MembershipOverview | null;
}

function CountdownTimer({ seconds }: { seconds: number }) {
  if (seconds <= 0) return null;
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return (
    <div className="flex items-center justify-center gap-2 text-amber-700 font-semibold">
      <Clock size={18} />
      <span>{d}d {h}h {m}m remaining</span>
    </div>
  );
}

function toSafeNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function MembershipPricingSection({ overview }: Props) {
  const tiers = overview?.tiers ?? [];
  const services = overview?.services ?? [];
  const discounts = overview?.discounts ?? [];
  const benefits = overview?.benefits ?? [];
  const program = overview?.program;
  const isOfferActive = program?.isOfferActive ?? false;
  const offerSeconds = program?.offerRemainingSeconds ?? 0;
  const priceAfterOffer = program?.priceAfterOffer ?? 'USE_REGULAR_PRICE';

  // Filter tiers based on offer state:
  // Offer active → show all active tiers
  // Offer expired + HIDE_TIER → only show tiers that are NOT hidden
  // Offer expired + USE_REGULAR_PRICE/SHOW_EXPIRED_MESSAGE → show all with regular price
  const visibleTiers = tiers.filter((t) => {
    if (!t.isActive) return false;
    if (!isOfferActive && priceAfterOffer === 'HIDE_TIER') return false;
    return true;
  });

  // If no visible tiers and no active program, show nothing
  if (visibleTiers.length === 0 && !isOfferActive) return null;

  const getTierDiscountRange = (tierId: string) => {
    const tierDiscs = discounts.filter((d) => d.tierId === tierId);
    if (tierDiscs.length === 0) return null;
    const values = tierDiscs.map((d) => d.discountValue);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return min === max ? `${min}%` : `${min}% - ${max}%`;
  };

  return (
    <>
      {/* Countdown banner */}
      {isOfferActive && program?.offerBannerEn && (
        <section className="py-5 bg-(--bpa-green) text-white text-center">
          <div className="max-w-7xl mx-auto px-4">
            <p className="font-bold text-xl">{program.offerBannerEn}</p>
            {program.offerBannerBn && <p className="text-green-200 text-sm mt-1">{program.offerBannerBn}</p>}
            <div className="mt-2">
              <CountdownTimer seconds={offerSeconds} />
            </div>
          </div>
        </section>
      )}

      {/* Expired offer notification */}
      {!isOfferActive && program?.offerEndAt && new Date(program.offerEndAt) < new Date() && priceAfterOffer === 'SHOW_EXPIRED_MESSAGE' && (
        <section className="py-4 bg-amber-50 border-b border-amber-200 text-center">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-center gap-2 text-amber-700">
              <AlertTriangle size={18} />
              <p className="font-semibold">Founding Member Offer has ended. Regular pricing is now active.</p>
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-(--bpa-green) font-semibold text-sm uppercase tracking-widest mb-3">Membership</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-(--bpa-navy) mb-2">
              Community Care Partnership
            </h2>
            <p className="text-gray-500 text-lg">
              Choose a membership tier and unlock exclusive benefits for you and your pets.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {visibleTiers.map((tier) => {
              const currentPrice = toSafeNumber(tier.currentPriceBdt);
              const regularPrice = toSafeNumber(tier.regularPriceBdt);
              const isOffer = isOfferActive && currentPrice !== null && regularPrice !== null && currentPrice < regularPrice;
              return (
                <div
                  key={tier.id}
                  className={`bg-white rounded-2xl border-2 p-6 flex flex-col transition-all hover:shadow-lg ${
                    tier.slug === 'premium' ? 'border-(--bpa-green) shadow-md scale-[1.02]' : 'border-gray-200'
                  }`}
                >
                  {tier.badgeTextEn && (
                    <span className={`self-start text-xs font-bold px-3 py-1 rounded-full mb-3 ${
                      tier.slug === 'primary' ? 'bg-blue-100 text-blue-700' :
                      tier.slug === 'premium' ? 'bg-(--bpa-green-light) text-(--bpa-green)' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {tier.badgeTextEn}
                    </span>
                  )}

                  <h3 className="text-xl font-bold text-(--bpa-navy) mb-1">{tier.nameEn}</h3>
                  <p className="text-xs text-gray-400 mb-3">{tier.nameBn}</p>

                  <div className="mb-4">
                    {isOffer ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-(--bpa-green)">
                          {currentPrice !== null
                            ? new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(currentPrice)
                            : 'Price unavailable'}
                        </span>
                        {regularPrice !== null && (
                          <span className="text-lg text-gray-400 line-through">
                            {new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(regularPrice)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-3xl font-bold text-(--bpa-navy)">
                        {currentPrice !== null
                          ? new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(currentPrice)
                          : 'Price unavailable'}
                      </span>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {tier.validityMonths === 12 ? 'per year' : `per ${tier.validityMonths} months`}
                    </p>
                  </div>

                  {tier.shortDescEn && (
                    <p className="text-sm text-gray-500 mb-3">{tier.shortDescEn}</p>
                  )}

                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                    <span className="font-semibold text-(--bpa-navy)">{tier.petLimitMin}-{tier.petLimitMax} pets</span>
                  </div>

                  {getTierDiscountRange(tier.id) && (
                    <div className="text-sm text-(--bpa-green) font-semibold mb-2">
                      Up to {getTierDiscountRange(tier.id)} service discount
                    </div>
                  )}

                  {tier.benefits.length > 0 && (
                    <div className="border-t border-gray-100 pt-4 mt-auto">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Benefits</p>
                      <ul className="space-y-1.5 mb-4">
                        {tier.benefits.slice(0, 6).map((b, index) => (
                          <li key={b.id ?? `${index}-${b.titleEn ?? b.title ?? ''}`} className="flex items-start gap-1.5 text-sm text-gray-600">
                            <CheckCircle size={14} className="text-(--bpa-green) shrink-0 mt-0.5" />
                            <span>{b.titleEn || b.title || b.nameEn || b.name || 'Benefit'}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Link
                    href={`/community-pet-care/contribute?tier=${tier.slug}`}
                    className={`mt-4 w-full text-center py-2.5 rounded-xl font-semibold text-sm transition-all ${
                      tier.slug === 'premium'
                        ? 'bg-(--bpa-green) text-white hover:opacity-90'
                        : 'bg-gray-100 text-(--bpa-navy) hover:bg-gray-200'
                    }`}
                  >
                    {isOffer ? 'Get Started at Launch Price' : 'Get Started'} <ChevronRight size={14} className="inline" />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Service Discount Comparison Table */}
          {services.length > 0 && discounts.length > 0 && (
            <div className="mt-16">
              <h3 className="text-xl font-bold text-(--bpa-navy) text-center mb-6">
                Service Discount Comparison
              </h3>
              <p className="text-center text-gray-500 text-sm mb-6">
                Estimated savings per service across tiers
              </p>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm bg-white">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left p-3 font-semibold text-(--bpa-navy)">Service</th>
                      <th className="text-center p-3 font-semibold text-(--bpa-navy)">Base Price</th>
                      {visibleTiers.map((t) => (
                        <th key={t.id} className="text-center p-3 font-semibold text-(--bpa-green)">
                          {t.nameEn}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {services.slice(0, 10).map((svc) => (
                      <tr key={svc.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="p-3 font-medium">{svc.nameEn}</td>
                        <td className="p-3 text-center">
                          {new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(svc.basePriceBdt)}
                        </td>
                        {visibleTiers.map((t) => {
                          const d = discounts.find((disc) => disc.tierId === t.id && disc.serviceId === svc.id);
                          if (!d) return <td key={t.id} className="p-3 text-center text-gray-400">—</td>;
                          const saved = d.discountType === 'PERCENTAGE'
                            ? Math.round(svc.basePriceBdt * d.discountValue / 100)
                            : d.discountValue;
                          return (
                            <td key={t.id} className="p-3 text-center">
                              <span className="text-(--bpa-green) font-semibold">
                                {d.discountType === 'PERCENTAGE' ? `${d.discountValue}% off` : `${new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(d.discountValue)} off`}
                              </span>
                              <span className="block text-xs text-gray-400">
                                save {new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(saved)}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty state */}
          {visibleTiers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Membership tiers are being configured. Please check back soon.</p>
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              href="/community-pet-care/contribute"
              className="inline-flex items-center gap-1 bg-(--bpa-green) text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Become a Member <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
