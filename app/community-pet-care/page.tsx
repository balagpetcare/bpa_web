import type { Metadata } from 'next';
import Link from 'next/link';
import { Heart, MapPin, ShieldCheck, Users, ChevronRight, Info } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import { getPublicZones, getCareFundOverview } from '@/lib/api/community-care';
import { getSeoData } from '@/lib/api/seo';
import type { CommunityZonePublic } from '@/types/bpa.types';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData('/community-pet-care').catch(() => null);
  return buildMetadata(
    {
      title: 'Community Pet Care — BPA Community Pet Clinic & Care Partner Programme',
      description:
        'Support 8 initial 24/7 Community Pet Clinics in Dhaka. Contribute ৳3,000 to become a BPA Care Partner and receive your digital Care Partner Card.',
      canonical: '/community-pet-care',
      keywords: ['community pet care', 'care partner', 'BPA', 'pet clinic Dhaka', 'community contribution'],
    },
    seo,
  );
}

const LEGAL_DISCLAIMER =
  'Care Partner Card is a contribution recognition and service benefit card only. ' +
  'It is not ownership, share, profit-sharing, investment, or financial return. ' +
  'Product, medicine, food, accessories, and third-party cost discounts are not guaranteed.';

export default async function CommunityPetCarePage() {
  const [zones, overview] = await Promise.allSettled([
    getPublicZones({ next: { revalidate: 300, tags: ['community-zones'] } } as RequestInit),
    getCareFundOverview({ next: { revalidate: 300, tags: ['care-fund-overview'] } } as RequestInit),
  ]);

  const zoneList: CommunityZonePublic[] = zones.status === 'fulfilled' ? zones.value : [];
  const stats = overview.status === 'fulfilled' ? overview.value : null;

  return (
    <>
      {/* Hero */}
      <section className="bg-(--bpa-navy) text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-(--bpa-green) font-semibold text-sm uppercase tracking-widest mb-4">
              Bangladesh Pet Association
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
              Community Pet Care Initiative
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              BPA is building 8 initial 24/7 Community Pet Clinics across Dhaka — funded entirely by community contributions.
              Join 10,000 pet owners in each zone to make it happen.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/community-pet-care/contribute"
                className="inline-flex items-center gap-2 bg-(--bpa-green) text-white px-7 py-3.5 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                <Heart size={18} /> Contribute ৳3,000
              </Link>
              <Link
                href="/community-pet-care/zones"
                className="inline-flex items-center gap-2 border-2 border-white text-white px-7 py-3.5 rounded-lg font-semibold hover:bg-white hover:text-(--bpa-navy) transition-colors"
              >
                <MapPin size={18} /> View Zones
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      {stats && (
        <section className="bg-(--bpa-green) text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold">{stats.totalContributors.toLocaleString()}</div>
                <div className="text-sm opacity-80 mt-1">Total Contributors</div>
              </div>
              <div>
                <div className="text-3xl font-bold">৳{Number(stats.totalAmountBdt).toLocaleString()}</div>
                <div className="text-sm opacity-80 mt-1">Total Collected</div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <div className="text-3xl font-bold">{stats.totalActiveCards.toLocaleString()}</div>
                <div className="text-sm opacity-80 mt-1">Active Care Cards</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Initiative overview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-3xl font-bold text-(--bpa-navy) mb-6">What is Community Pet Care?</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Bangladesh Pet Association is launching 8 Community Pet Clinics across Dhaka —
                  each staffed 24 hours a day, 7 days a week — to provide affordable veterinary care
                  to every pet owner in the community.
                </p>
                <p>
                  These clinics are funded entirely through community contributions. Each zone needs
                  <strong className="text-(--bpa-navy)"> 10,000 contributors at ৳3,000 each</strong> to reach its
                  operational target.
                </p>
                <p>
                  Contributors receive a <strong className="text-(--bpa-navy)">BPA Community Care Partner Card</strong> —
                  a digital recognition card with service access benefits, valid for 5 years.
                </p>
              </div>
              <Link
                href="/community-pet-care/contribute"
                className="inline-flex items-center gap-2 mt-8 bg-(--bpa-green) text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Become a Care Partner <ChevronRight size={16} />
              </Link>
            </div>
            <div className="space-y-4">
              {[
                { icon: Heart, title: '৳3,000 One-Time Contribution', desc: 'A single contribution supports your zone\'s community clinic for 5 years.' },
                { icon: ShieldCheck, title: 'Digital Care Partner Card', desc: 'Receive a QR-verified digital card — your proof of contribution and benefit access.' },
                { icon: MapPin, title: '8 Zones in Dhaka', desc: 'Each zone serves thousands of local pet owners with round-the-clock veterinary support.' },
                { icon: Users, title: '10,000 Contributors per Zone', desc: 'Community-funded means community-owned. Every contributor counts.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4 p-5 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-(--bpa-green) rounded-lg flex items-center justify-center shrink-0">
                    <Icon size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-(--bpa-navy) mb-1">{title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Zone progress summary */}
      {zoneList.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-(--bpa-navy) mb-3">8 Dhaka Zones</h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Each zone is raising funds independently. Choose your zone when you contribute.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {zoneList.slice(0, 8).map((zone: CommunityZonePublic) => {
                const pct = Math.min(Math.round((zone.currentContributors / zone.targetContributors) * 100), 100);
                return (
                  <div key={zone.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-(--bpa-navy) text-sm">{zone.name}</h3>
                        <p className="text-xs text-gray-400">{zone.city}, {zone.district}</p>
                      </div>
                      <span className="text-xs font-bold text-(--bpa-green)">{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                      <div
                        className="bg-(--bpa-green) h-2 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {zone.currentContributors.toLocaleString()} / {zone.targetContributors.toLocaleString()} contributors
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-8">
              <Link href="/community-pet-care/zones" className="inline-flex items-center gap-2 text-(--bpa-green) font-semibold hover:underline">
                View all zones with details <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Care Partner Card explanation */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ShieldCheck size={48} className="text-(--bpa-green) mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-(--bpa-navy) mb-4">BPA Community Care Partner Card</h2>
          <p className="text-gray-600 leading-relaxed mb-6 max-w-2xl mx-auto">
            After a successful contribution, you will receive a digital BPA Community Care Partner Card
            with a unique QR code. The card is valid for 5 years and serves as your proof of contribution
            and access to community clinic service benefits.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {['Digital card with QR verification', '5-year validity', 'Community clinic service access', 'Annual care camp invitation'].map((benefit) => (
              <span key={benefit} className="bg-(--bpa-green-light) text-(--bpa-green) text-sm px-4 py-2 rounded-full font-medium">
                ✓ {benefit}
              </span>
            ))}
          </div>
          <Link href="/care-partner-card" className="inline-flex items-center gap-2 text-(--bpa-green) font-semibold hover:underline">
            Look up your Care Partner Card <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      {/* Legal disclaimer */}
      <section className="py-8 bg-amber-50 border-t border-amber-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-3 items-start">
            <Info size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">
              <strong>Important Notice:</strong> {LEGAL_DISCLAIMER}
            </p>
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { href: '/transparency', label: 'Transparency Reports', desc: 'View fund collection and spending reports.' },
              { href: '/pet-census-2026', label: 'Pet Census 2026', desc: 'Register your pet and help us plan clinic capacity.' },
              { href: '/community-pet-care/faq', label: 'Frequently Asked Questions', desc: 'Answers to common questions about contribution and the Care Partner Card.' },
            ].map(({ href, label, desc }) => (
              <Link key={href} href={href} className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-(--bpa-green) hover:shadow-sm transition-all group">
                <h3 className="font-semibold text-(--bpa-navy) group-hover:text-(--bpa-green) transition-colors mb-2">{label}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
