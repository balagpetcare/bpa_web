import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { buildMetadata } from '@/lib/seo';
import { getSeoData } from '@/lib/api/seo';
import MembershipPurchaseFlow from './components/MembershipPurchaseFlow';

export const dynamic = 'force-dynamic';

const VALID_TIERS = ['primary', 'premium', 'enterprise'];
const DEFAULT_TIER = 'primary';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData('/community-pet-care/contribute').catch(() => null);
  return buildMetadata(
    {
      title: 'Get Your BPA Community Care Partner Card',
      description:
        'Select your BPA Community Care Partner Card tier and complete registration. Your zone vote counts toward BPA\'s clinic expansion priority.',
      canonical: '/community-pet-care/contribute',
      keywords: ['care partner card', 'community pet clinic', 'BPA', 'membership'],
    },
    seo,
  );
}

interface Props {
  searchParams: Promise<{ zone?: string; tier?: string }>;
}

export default async function ContributePage({ searchParams }: Props) {
  const { zone, tier } = await searchParams;
  const membershipTier = tier && VALID_TIERS.includes(tier) ? tier : DEFAULT_TIER;

  // Legacy contribution mode is hidden; redirect to membership by default.
  // Old /community-pet-care/contribute?tier=xxx route pattern continues to work.
  // Legacy ?tier-less mode now defaults to Primary tier purchase.

  const heading = 'Get Your BPA Community Care Partner Card';

  const subtext = 'Select your preferred clinic zone and complete registration. Your zone vote counts toward BPA\'s clinic expansion priority.';

  return (
    <>
      <section className="bg-gray-50 border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-400 mb-4 flex gap-2 items-center">
            <Link href="/" className="hover:text-(--bpa-green)">Home</Link>
            <span>/</span>
            <Link href="/community-pet-care" className="hover:text-(--bpa-green)">Community Pet Care</Link>
            <span>/</span>
            <span className="text-gray-600">Get Card</span>
          </nav>
          <h1 className="text-4xl font-bold text-(--bpa-navy)">{heading}</h1>
          <p className="mt-3 text-lg text-gray-500 max-w-xl">{subtext}</p>
        </div>
      </section>

      <div className="py-16">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <MembershipPurchaseFlow tierSlug={membershipTier} />
          </div>

          <div className="mt-6 text-center text-sm text-gray-400 space-y-2">
            <p>
              After activation, check your membership at{' '}
              <Link href="/community-pet-care/membership" className="text-(--bpa-green) hover:underline">membership page</Link>.
            </p>
            <p>
              <Link href="/community-pet-care" className="text-(--bpa-green) hover:underline">← Back to Community Pet Care</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
