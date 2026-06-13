import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';
import { getSeoData } from '@/lib/api/seo';
import PetCensusForm from './components/PetCensusForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData('/pet-census-2026').catch(() => null);
  return buildMetadata(
    {
      title: 'BPA Pet Census 2026 - Register Your Pets',
      description:
        'Share basic pet ownership information with BPA for the 2026 Pet Census. Help BPA plan awareness, vaccination campaigns, and community pet care services.',
      canonical: '/pet-census-2026',
      keywords: ['pet census', 'BPA', 'Dhaka', 'pet registration', '2026'],
    },
    seo,
  );
}

export default async function PetCensusPage() {
  return (
    <>
      <section className="bg-(--bpa-navy) text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-(--bpa-green) font-semibold text-sm uppercase tracking-widest mb-3">
              Bangladesh Pet Association
            </p>
            <h1 className="text-4xl font-bold mb-4">Pet Census 2026</h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Share basic information about pets in your household so BPA can plan community clinics,
              pet care awareness, vaccination campaigns, and future Pet Smart Solution integration.
            </p>
          </div>
        </div>
      </section>

      <div className="py-16">
        <div className="max-w-2xl mx-auto px-4">
          <div className="mb-6 rounded-xl border border-green-100 bg-green-50 p-5 text-sm text-gray-700 leading-relaxed">
            BPA uses this census only for planning and awareness. This form does not create a clinic
            appointment, medical record, treatment request, prescription, or service booking. We collect
            only the contact and pet ownership details needed to understand community needs.
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-(--bpa-navy) mb-6">Register Your Pets</h2>
            <PetCensusForm />
          </div>

          <div className="mt-6 text-center text-sm text-gray-400">
            <p>
              Want to support community pet care planning?{' '}
              <Link href="/community-pet-care/contribute" className="text-(--bpa-green) hover:underline">
                Contribute ৳3,000
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
