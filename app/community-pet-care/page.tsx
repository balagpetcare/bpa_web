import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Info, MapPin } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import {
  getPublicZones,
  getCareFundOverview,
  getPublicCarePartnerBenefits,
  getPublicSocialImpactPrograms,
  getPublicRoadmapItems,
  getPublicDiagnosticServices,
  getRecentPublicContributors,
  getPublicImpactStats,
} from '@/lib/api/community-care';
import { getSeoData } from '@/lib/api/seo';
import { getMembershipOverview } from '@/lib/api/community-membership';
import type { CommunityZonePublic } from '@/types/bpa.types';

import DonationCTASection from '@/components/donations/DonationCTASection';
import HeroDashboardSection from './components/HeroDashboardSection';
import BenefitsSection from './components/BenefitsSection';
import SocialImpactSection from './components/SocialImpactSection';
import ImpactCountersSection from './components/ImpactCountersSection';
import ContributorWallSection from './components/ContributorWallSection';
import TransparencyStrip from './components/TransparencyStrip';
import DiagnosticCenterSection from './components/DiagnosticCenterSection';
import RoadmapSection from './components/RoadmapSection';
import AllocationSection from './components/AllocationSection';
import CardPreviewSection from './components/CardPreviewSection';
import MembershipPricingSection from './components/MembershipPricingSection';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData('/community-pet-care').catch(() => null);
  return buildMetadata(
    {
      title: 'BPA Community Care Partner Card — Community Pet Clinic Programme',
      description:
        'Get your BPA Community Care Partner Card and support 8 Community Pet Clinics in Dhaka. 5-year card membership with service discounts and priority access.',
      canonical: '/community-pet-care',
      keywords: [
        'community pet care',
        'care partner card',
        'BPA',
        'pet clinic Dhaka',
        'community contribution',
        'animal welfare Bangladesh',
        'diagnostic center',
      ],
    },
    seo,
  );
}

const LEGAL_DISCLAIMER =
  'Care Partner Card is a contribution recognition and service benefit card only. ' +
  'It is not ownership, share, profit-sharing, investment, or financial return. ' +
  'Product, medicine, food, accessories, and third-party cost discounts are not guaranteed.';

export default async function CommunityPetCarePage() {
  const [
    zonesResult,
    overviewResult,
    benefitsResult,
    socialResult,
    roadmapResult,
    diagnosticResult,
    contributorsResult,
    impactResult,
    membershipOverviewResult,
  ] = await Promise.allSettled([
    getPublicZones({ next: { revalidate: 300, tags: ['community-zones'] } } as RequestInit),
    getCareFundOverview({ next: { revalidate: 300, tags: ['care-fund-overview'] } } as RequestInit),
    getPublicCarePartnerBenefits({ next: { revalidate: 3600, tags: ['care-partner-benefits'] } } as RequestInit),
    getPublicSocialImpactPrograms({ next: { revalidate: 3600, tags: ['social-impact-programs'] } } as RequestInit),
    getPublicRoadmapItems({ next: { revalidate: 3600, tags: ['roadmap-items'] } } as RequestInit),
    getPublicDiagnosticServices({ next: { revalidate: 3600, tags: ['diagnostic-services'] } } as RequestInit),
    getRecentPublicContributors(12, { next: { revalidate: 60, tags: ['recent-contributors'] } } as RequestInit),
    getPublicImpactStats({ next: { revalidate: 300, tags: ['impact-stats'] } } as RequestInit),
    getMembershipOverview({ next: { revalidate: 300, tags: ['membership-overview'] } } as RequestInit),
  ]);

  const zoneList: CommunityZonePublic[] = zonesResult.status === 'fulfilled' ? zonesResult.value : [];
  const overview = overviewResult.status === 'fulfilled' ? overviewResult.value : null;
  const benefits = benefitsResult.status === 'fulfilled' ? benefitsResult.value : [];
  const socialPrograms = socialResult.status === 'fulfilled' ? socialResult.value : [];
  const roadmapItems = roadmapResult.status === 'fulfilled' ? roadmapResult.value : [];
  const diagnosticServices = diagnosticResult.status === 'fulfilled' ? diagnosticResult.value : [];
  const recentContributors = contributorsResult.status === 'fulfilled' ? (contributorsResult.value ?? []) : [];
  const impactStats = impactResult.status === 'fulfilled' ? impactResult.value : null;
  const membershipOverview = membershipOverviewResult.status === 'fulfilled' ? membershipOverviewResult.value : null;

  const heroStats = {
    totalContributors: overview?.totalContributors ?? 0,
    totalRaised: Number(overview?.totalRaised ?? overview?.totalAmountBdt ?? 0),
    totalActiveCards: overview?.totalActiveCards ?? 0,
    zonesCount: zoneList.filter((z) => z.status === 'active').length || zoneList.length,
  };

  return (
    <>
      {/* 1 — Premium hero impact dashboard */}
      <HeroDashboardSection stats={heroStats} />

      {/* 2 — Membership Pricing */}
      <MembershipPricingSection overview={membershipOverview} />

      {/* 3 — Initiative overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-(--bpa-green) font-semibold text-sm uppercase tracking-widest mb-4">
                What is Community Pet Care?
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-(--bpa-navy) mb-2">
                Community-Funded. Community-Owned.
              </h2>
              <p className="text-gray-500 text-lg mb-6">
                সম্প্রদায়-অর্থায়িত। সম্প্রদায়-মালিকানাধীন।
              </p>
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
              <div className="flex flex-wrap gap-3 mt-8">
                <Link
                  href="/community-pet-care/contribute"
                  className="inline-flex items-center gap-2 bg-(--bpa-green) text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
                >
                  Become a Card Member <ChevronRight size={16} />
                </Link>
                <Link
                  href="/community-pet-care/membership/upgrade"
                  className="inline-flex items-center gap-2 border border-(--bpa-green) text-(--bpa-green) px-6 py-3 rounded-xl font-semibold hover:bg-green-50 transition-colors"
                >
                  Upgrade Care Partner Card <ChevronRight size={16} />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '৳3,000', label: 'One-Time Contribution', labelBn: 'একবারের অবদান', desc: 'A single contribution supports your zone\'s community clinic for 5 years.' },
                { value: '5 Yrs', label: 'Card Validity', labelBn: 'কার্ডের মেয়াদ', desc: 'Your digital Care Partner Card is valid for a full 5-year cycle.' },
                { value: '8', label: 'Zones in Dhaka', labelBn: 'ঢাকায় জোন', desc: 'Each zone serves thousands of local pet owners with round-the-clock veterinary support.' },
                { value: '10K', label: 'Contributors / Zone', labelBn: 'প্রতি জোনে অবদানকারী', desc: 'Community-funded means community-owned. Every contributor counts.' },
              ].map(({ value, label, labelBn, desc }) => (
                <div key={label} className="bg-(--bpa-green-light) rounded-2xl p-5">
                  <div className="text-3xl font-bold text-(--bpa-green) mb-1">{value}</div>
                  <div className="font-semibold text-(--bpa-navy) text-sm">{label}</div>
                  <div className="text-xs text-gray-400 mb-2">{labelBn}</div>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3 — Care Partner Benefits */}
      <BenefitsSection benefits={benefits} />

      {/* 4 — Beyond Your Own Pet */}
      <SocialImpactSection programs={socialPrograms} />

      {/* 5 — Impact counters */}
      <ImpactCountersSection stats={impactStats} />

      {/* 6 — Zone progress summary */}
      {zoneList.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-(--bpa-green) font-semibold text-sm uppercase tracking-widest mb-3">
                Zones Progress
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-(--bpa-navy) mb-2">
                8 Dhaka Zones
              </h2>
              <p className="text-gray-500">
                ৮টি ঢাকা জোন — প্রতিটি জোন স্বাধীনভাবে তহবিল সংগ্রহ করছে।
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {zoneList.slice(0, 8).map((zone: CommunityZonePublic) => {
                const current = zone.currentContributors ?? 0;
                const target = zone.targetContributors ?? 0;
                const pct = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
                return (
                  <div key={zone.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-(--bpa-navy) text-sm">{zone.name}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{zone.city}, {zone.district}</p>
                      </div>
                      <span className="text-sm font-bold text-(--bpa-green)">{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                      <div
                        className="bg-(--bpa-green) h-2 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {current.toLocaleString()} / {target.toLocaleString()} contributors
                    </p>
                    <span className={`inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      zone.status === 'active' ? 'bg-green-100 text-green-700' :
                      zone.status === 'coming_soon' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {zone.status === 'active' ? 'Active' : zone.status === 'coming_soon' ? 'Coming Soon' : 'Inactive'}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/community-pet-care/zones"
                className="inline-flex items-center gap-2 text-(--bpa-green) font-semibold hover:underline"
              >
                <MapPin size={16} /> View all zones with details <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 7 — Contributor wall */}
      <ContributorWallSection contributors={recentContributors} />

      {/* 8 — Central Diagnostic Center Vision */}
      <DiagnosticCenterSection services={diagnosticServices} />

      {/* 9 — Future Roadmap */}
      <RoadmapSection items={roadmapItems} />

      {/* 10 — Where contribution goes */}
      <AllocationSection />

      {/* 11 — Care Partner Card preview */}
      <CardPreviewSection />

      {/* 12 — Transparency strip */}
      <TransparencyStrip />

      {/* 13 — Legal disclaimer */}
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

      {/* 11 — Quick links */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                href: '/transparency',
                label: 'Transparency Reports',
                labelBn: 'স্বচ্ছতা প্রতিবেদন',
                desc: 'View fund collection and spending reports.',
              },
              {
                href: '/pet-census-2026',
                label: 'Pet Census 2026',
                labelBn: 'পেট সেন্সাস ২০২৬',
                desc: 'Register your pet and help us plan clinic capacity.',
              },
              {
                href: '/community-pet-care/faq',
                label: 'Frequently Asked Questions',
                labelBn: 'সাধারণ জিজ্ঞাসা',
                desc: 'Answers to common questions about contribution and the Care Partner Card.',
              },
            ].map(({ href, label, labelBn, desc }: { href: string; label: string; labelBn: string; desc: string }) => (
              <Link
                key={href}
                href={href}
                className="block p-6 bg-white rounded-2xl border border-gray-200 hover:border-(--bpa-green) hover:shadow-sm transition-all group"
              >
                <h3 className="font-bold text-(--bpa-navy) group-hover:text-(--bpa-green) transition-colors mb-0.5">
                  {label}
                </h3>
                <p className="text-xs text-gray-400 mb-2">{labelBn}</p>
                <p className="text-sm text-gray-500">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <DonationCTASection
        title="Can't Get the Card? You Can Still Help"
        subtitle="A direct donation supports the same community clinics, vaccination drives, and rescue programs — no card required. Every Taka makes a difference."
        theme="navy"
      />
    </>
  );
}
