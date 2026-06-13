import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';
import { getSeoData } from '@/lib/api/seo';
import ContributionForm from './components/ContributionForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData('/community-pet-care/contribute').catch(() => null);
  return buildMetadata(
    {
      title: 'Contribute ৳3,000 — Become a BPA Community Care Partner',
      description:
        'Make your ৳3,000 community contribution to support a 24/7 Community Pet Clinic in your zone and receive your digital BPA Care Partner Card.',
      canonical: '/community-pet-care/contribute',
      keywords: ['contribute', 'care partner', '৳3000', 'community pet clinic', 'BPA'],
    },
    seo,
  );
}

interface Props {
  searchParams: Promise<{ zone?: string }>;
}

export default async function ContributePage({ searchParams }: Props) {
  const { zone } = await searchParams;

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
          <h1 className="text-4xl font-bold text-(--bpa-navy)">Become a Care Partner</h1>
          <p className="mt-3 text-lg text-gray-500 max-w-xl">
            Make your ৳3,000 contribution to support a 24/7 Community Pet Clinic in your zone and receive your digital BPA Care Partner Card.
          </p>
        </div>
      </section>

      <div className="py-16">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <ContributionForm defaultZoneId={zone} />
          </div>

          <div className="mt-6 text-center text-sm text-gray-400 space-y-2">
            <p>
              After payment, your Care Partner Card will be issued automatically.
              You can look it up at{' '}
              <Link href="/care-partner-card" className="text-(--bpa-green) hover:underline">care-partner-card</Link>.
            </p>
            <p>
              <Link href="/community-pet-care/faq" className="text-(--bpa-green) hover:underline">Have questions? Read the FAQ →</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
