import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';
import { getSeoData } from '@/lib/api/seo';
import { getPetCensusSettings } from '@/lib/api/pet-census';
import type { PetCensusCampaign } from '@/types/bpa.types';
import PetCensusForm from './components/PetCensusForm';
import PetCensusHero from './components/PetCensusHero';
import PetCensusImpact from './components/PetCensusImpact';
import PetCensusBenefits from './components/PetCensusBenefits';
import PetCensusTrust from './components/PetCensusTrust';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData('/pet-census-2026').catch(() => null);
  return buildMetadata(
    {
      title: 'BPA Pet Census 2026 — Register Your Pets',
      description:
        'Help BPA build a better veterinary map of Dhaka. Share basic pet ownership information to plan 24/7 community clinics and vaccination drives.',
      canonical: '/pet-census-2026',
      keywords: ['pet census', 'BPA', 'Dhaka', 'pet registration', '2026', 'community pet care'],
    },
    seo,
  );
}

export default async function PetCensusPage() {
  const settings: PetCensusCampaign = await getPetCensusSettings().catch(() => ({
    active: true,
    title: 'BPA Pet Census 2026',
    status: 'registration_open' as const,
    targetSubmissions: 10000,
    currentSubmissions: 2400,
  }));

  const isClosed = settings.status === 'registration_closed' || settings.status === 'completed';

  return (
    <main className="min-h-screen bg-white">
      {/* 1 — Premium Hero Section */}
      <PetCensusHero settings={settings} />

      {/* 2 — Social Proof / Impact Counters */}
      <PetCensusImpact settings={settings} />

      {/* 3 — Main Registration Form (Multi-step) */}
      <section id="register" className="py-24 bg-gray-50/50 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-100 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-(--bpa-navy) mb-4">
              {isClosed ? 'Registration Closed' : 'Register Household Pets'}
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg leading-relaxed">
              {isClosed 
                ? 'The 2026 Pet Census registration period has ended. Thank you for your participation.'
                : 'Complete the 4-step census form below. Your data is protected and used only for community healthcare planning.'
              }
            </p>
          </div>

          {!isClosed && <PetCensusForm />}
          
          {isClosed && (
            <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h3 className="text-xl font-bold text-(--bpa-navy) mb-2">Campaign Concluded</h3>
              <p className="text-gray-500 mb-8">
                We are currently processing the collected data to better serve Dhaka&apos;s pet community. Stay tuned for the impact report.
              </p>
              <Link 
                href="/"
                className="inline-block bg-(--bpa-navy) text-white px-8 py-3 rounded-xl font-bold hover:bg-(--bpa-navy-light) transition-all"
              >
                Back to Homepage
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 4 — Benefits / Why it matters */}
      <PetCensusBenefits />

      {/* 5 — Trust / Data Privacy */}
      <PetCensusTrust />

      {/* 6 — Final CTA Strip */}
      <section className="py-16 bg-(--bpa-navy) text-white text-center border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-(--bpa-green) font-bold text-xs uppercase tracking-[0.2em] mb-4">
            Bangladesh Pet Association
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            Supporting community-owned pet healthcare.
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-400">
            <span>24/7 Emergency Support</span>
            <span className="hidden sm:inline">•</span>
            <span>8 Active Dhaka Zones</span>
            <span className="hidden sm:inline">•</span>
            <span>Data-Driven Care</span>
          </div>
        </div>
      </section>
    </main>
  );
}
