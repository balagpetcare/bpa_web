import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';
import { getSeoData } from '@/lib/api/seo';
import ContributionForm from './components/ContributionForm';
import MembershipPurchaseFlow from './components/MembershipPurchaseFlow';

export const dynamic = 'force-dynamic';

const VALID_TIERS = ['primary', 'premium', 'enterprise'];

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData('/community-pet-care/contribute').catch(() => null);
  return buildMetadata(
    {
      title: 'Contribute — Become a BPA Community Care Partner',
      description:
        'Support a 24/7 Community Pet Clinic in your zone and receive your digital BPA Care Partner Card.',
      canonical: '/community-pet-care/contribute',
      keywords: ['contribute', 'care partner', 'community pet clinic', 'BPA', 'membership'],
    },
    seo,
  );
}

interface Props {
  searchParams: Promise<{ zone?: string; tier?: string }>;
}

export default async function ContributePage({ searchParams }: Props) {
  const { zone, tier } = await searchParams;
  const membershipTier = tier && VALID_TIERS.includes(tier) ? tier : null;

  const heading = membershipTier
    ? 'Join Community Care Membership'
    : 'Become a Care Partner';

  const subtext = membershipTier
    ? 'Complete your membership registration below.'
    : 'Make your ৳3,000 contribution to support a 24/7 Community Pet Clinic in your zone and receive your digital BPA Care Partner Card.';

  return (
    <>
      <section className="bg-gray-50 border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-400 mb-4 flex gap-2 items-center">
            <Link href="/" className="hover:text-(--bpa-green)">Home</Link>
            <span>/</span>
            <Link href="/community-pet-care" className="hover:text-(--bpa-green)">Community Pet Care</Link>
            <span>/</span>
            <span className="text-gray-600">Contribute</span>
          </nav>
          <h1 className="text-4xl font-bold text-(--bpa-navy)">{heading}</h1>
          <p className="mt-3 text-lg text-gray-500 max-w-xl">{subtext}</p>
        </div>
      </section>

      <div className="py-16">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            {membershipTier ? (
              <MembershipPurchaseFlow tierSlug={membershipTier} />
            ) : (
              <ContributionForm defaultZoneId={zone} />
            )}
          </div>

          <div className="mt-6 text-center text-sm text-gray-400 space-y-2">
            {membershipTier ? (
              <>
                <p>
                  After activation, check your membership at{' '}
                  <Link href="/community-pet-care/membership" className="text-(--bpa-green) hover:underline">membership page</Link>.
                </p>
                <p>
                  <Link href="/community-pet-care" className="text-(--bpa-green) hover:underline">← Back to Community Pet Care</Link>
                </p>
              </>
            ) : (
              <>
                <p>
                  After payment, your Care Partner Card will be issued automatically.
                  You can look it up at{' '}
                  <Link href="/care-partner-card" className="text-(--bpa-green) hover:underline">care-partner-card</Link>.
                </p>
                <p>
                  <Link href="/community-pet-care/faq" className="text-(--bpa-green) hover:underline">Have questions? Read the FAQ →</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
