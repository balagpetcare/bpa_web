import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';
import MembershipUpgradeFlow from './components/MembershipUpgradeFlow';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: 'Upgrade Membership — BPA Community Care',
    description: 'Upgrade your BPA Community Care membership to a higher tier. Primary → Premium → Enterprise.',
    canonical: '/community-pet-care/membership/upgrade',
  });
}

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function MembershipUpgradePage({ searchParams }: Props) {
  const { token } = await searchParams;

  return (
    <>
      <section className="bg-gray-50 border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-400 mb-4 flex gap-2 items-center">
            <Link href="/" className="hover:text-(--bpa-green)">Home</Link>
            <span>/</span>
            <Link href="/community-pet-care" className="hover:text-(--bpa-green)">Community Pet Care</Link>
            <span>/</span>
            <Link href="/community-pet-care/membership" className="hover:text-(--bpa-green)">Membership</Link>
            <span>/</span>
            <span className="text-gray-600">Upgrade</span>
          </nav>
          <h1 className="text-4xl font-bold text-(--bpa-navy)">Upgrade Your Membership</h1>
          <p className="mt-3 text-lg text-gray-500 max-w-xl">
            Move to a higher tier to unlock more pet slots, extended benefits, and exclusive services.
            You only pay the difference.
          </p>
        </div>
      </section>

      <div className="py-16">
        <div className="max-w-2xl mx-auto px-4">
          {/* Upgrade path overview */}
          <div className="mb-8 flex items-center justify-center gap-3 text-sm">
            <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full font-medium">Primary</span>
            <span className="text-gray-300">→</span>
            <span className="px-3 py-1.5 bg-green-50 text-(--bpa-green) border border-green-200 rounded-full font-medium">Premium</span>
            <span className="text-gray-300">→</span>
            <span className="px-3 py-1.5 bg-(--bpa-navy) text-white rounded-full font-medium">Enterprise</span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <MembershipUpgradeFlow initialToken={token} />
          </div>

          <div className="mt-6 text-center text-sm text-gray-400 space-y-2">
            <p>
              Don&apos;t have a membership yet?{' '}
              <Link href="/community-pet-care/contribute?tier=primary" className="text-(--bpa-green) hover:underline">
                Join now →
              </Link>
            </p>
            <p>
              <Link href="/community-pet-care" className="hover:underline">← Back to Community Pet Care</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
