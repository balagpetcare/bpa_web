import Link from 'next/link';
import { ChevronLeft, AlertTriangle } from 'lucide-react';
import { getTierBySlug, getMembershipOverview } from '@/lib/api/community-membership';
import { normalizeTier, normalizeProgram } from '@/lib/community-care-normalizer';
import MembershipPurchaseForm from './MembershipPurchaseForm';

interface Props {
  tierSlug: string;
}

export default async function MembershipTierPurchase({ tierSlug }: Props) {
  let overview;
  try {
    overview = await getMembershipOverview({ cache: 'no-store' });
  } catch {
    return <TierError message="Unable to load membership information. Please try again later." tierSlug={tierSlug} />;
  }

  const rawTier = overview.tiers.find((t) => t.slug === tierSlug);
  if (!rawTier || !rawTier.isActive) {
    return <TierError message="This membership tier is not available. Please select a different tier." tierSlug={tierSlug} />;
  }

  const program = normalizeProgram(overview.program);
  const tier = normalizeTier(rawTier, program.isOfferActive);

  const breadcrumbLabel = `${tier.nameEn} Card`;

  return (
    <>
      <section className="bg-gray-50 border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-400 mb-4 flex gap-2 items-center flex-wrap">
            <Link href="/" className="hover:text-(--bpa-green)">Home</Link>
            <span>/</span>
            <Link href="/community-pet-care" className="hover:text-(--bpa-green)">Community Pet Care</Link>
            <span>/</span>
            <Link href="/community-pet-care#tiers" className="hover:text-(--bpa-green)">Tiers</Link>
            <span>/</span>
            <span className="text-gray-600">{breadcrumbLabel}</span>
          </nav>

          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/community-pet-care#tiers"
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-(--bpa-navy) transition-colors"
              aria-label="Back to tiers"
            >
              <ChevronLeft size={20} />
            </Link>
            <h1 className="text-4xl font-bold text-(--bpa-navy)">Get Your {tier.nameEn}</h1>
          </div>

          <p className="mt-2 text-lg text-gray-500 max-w-xl ml-10">
            {tier.shortDescEn ?? `${tier.validityLabel} validity card with exclusive veterinary service discounts.`}
          </p>

          {program.isOfferActive && (
            <div className="mt-4 ml-10 inline-block bg-(--bpa-green) text-white text-sm font-bold px-4 py-1.5 rounded-full">
              {program.offerBannerEn}
            </div>
          )}
        </div>
      </section>

      <div className="py-16">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <MembershipPurchaseForm
              tier={rawTier}
              displayPrice={tier.displayPrice}
              strikePrice={tier.strikePrice}
              isOfferActive={tier.isOfferActiveForTier}
              legalDisclaimer={overview.program?.legalDisclaimer}
              paymentMode={program.paymentMode}
            />
          </div>

          <div className="mt-6 text-center text-sm text-gray-400 space-y-2">
            <p>
              After payment verification, your digital card will be issued automatically.
              Check status at{' '}
              <Link href="/membership/lookup" className="text-(--bpa-green) hover:underline">membership lookup</Link>.
            </p>
            <p>
              <Link href="/community-pet-care#tiers" className="text-(--bpa-green) hover:underline">
                ← View all membership tiers
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function TierError({ message, tierSlug }: { message: string; tierSlug: string }) {
  return (
    <>
      <section className="bg-gray-50 border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-400 mb-4 flex gap-2 items-center">
            <Link href="/" className="hover:text-(--bpa-green)">Home</Link>
            <span>/</span>
            <Link href="/community-pet-care" className="hover:text-(--bpa-green)">Community Pet Care</Link>
            <span>/</span>
            <span className="text-gray-600">Care Partner Card</span>
          </nav>
          <h1 className="text-4xl font-bold text-(--bpa-navy)">Care Partner Card Not Available</h1>
        </div>
      </section>
      <div className="py-16">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} className="text-amber-500" />
          </div>
          <p className="text-gray-600 mb-6">{message}</p>
          <Link
            href="/community-pet-care#tiers"
            className="inline-flex items-center gap-2 bg-(--bpa-green) text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            <ChevronLeft size={16} /> View Available Tiers
          </Link>
        </div>
      </div>
    </>
  );
}
