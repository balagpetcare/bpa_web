import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, CheckCircle, Star } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import { getSeoData } from '@/lib/api/seo';
import MembershipTierPurchase from './components/MembershipTierPurchase';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ zone?: string; tier?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { tier } = await searchParams;
  const seo = await getSeoData('/community-pet-care/contribute').catch(() => null);

  if (tier) {
    const tierLabel = tier === 'primary' ? 'Primary' : tier === 'premium' ? 'Premium' : tier === 'enterprise' ? 'Enterprise' : tier;
    return buildMetadata(
      {
        title: `${tierLabel} Care Partner Card — BPA`,
        description: 'Get your BPA Care Partner Card and unlock exclusive vet service discounts.',
        canonical: `/community-pet-care/contribute?tier=${tier}`,
        keywords: ['care partner card', 'bpa', 'pet care', tier],
      },
      seo,
    );
  }

  return buildMetadata(
    {
      title: 'Get Your BPA Care Partner Card — Choose a Tier',
      description:
        'Become a BPA Care Partner. Choose from Primary (৳3,000), Premium (৳5,000), or Enterprise (৳10,000) Care Partner Cards.',
      canonical: '/community-pet-care/contribute',
      keywords: ['care partner card', 'bpa', 'primary', 'premium', 'enterprise', 'contribute'],
    },
    seo,
  );
}

// ─── Tier data (launch prices) ─────────────────────────────────────────────

const TIERS = [
  {
    slug: 'primary',
    name: 'Primary Care Partner Card',
    nameBn: 'প্রাইমারি কেয়ার পার্টনার কার্ড',
    launchPrice: 3000,
    validity: '5 Years',
    badge: 'Most Popular',
    isFeatured: true,
    highlights: [
      'Digital Care Partner Card',
      'Vaccination campaign priority access',
      'Community clinic benefit',
      'BPA partner vet discounts',
    ],
  },
  {
    slug: 'premium',
    name: 'Premium Care Partner Card',
    nameBn: 'প্রিমিয়াম কেয়ার পার্টনার কার্ড',
    launchPrice: 5000,
    validity: '5 Years',
    badge: 'Best Value',
    isFeatured: false,
    highlights: [
      'Everything in Primary',
      'Extended pet limit',
      'Premium zone access',
      'Priority campaign slots',
      'Premium service discounts',
    ],
  },
  {
    slug: 'enterprise',
    name: 'Enterprise Care Partner Card',
    nameBn: 'এন্টারপ্রাইজ কেয়ার পার্টনার কার্ড',
    launchPrice: 10000,
    validity: '5 Years',
    badge: 'Maximum Benefits',
    isFeatured: false,
    highlights: [
      'Everything in Premium',
      'Unlimited pet registrations',
      'All-zone access',
      'Dedicated support',
      'Maximum service discounts',
      'Enterprise recognition badge',
    ],
  },
];

export default async function ContributePage({ searchParams }: Props) {
  const { tier } = await searchParams;

  // Per-tier purchase form (existing flow, unchanged)
  if (tier) {
    return <MembershipTierPurchase tierSlug={tier} />;
  }

  // Tier selection landing page
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-400 mb-4 flex gap-2 items-center flex-wrap">
            <Link href="/" className="hover:text-(--bpa-green)">Home</Link>
            <span>/</span>
            <Link href="/community-pet-care" className="hover:text-(--bpa-green)">Community Pet Care</Link>
            <span>/</span>
            <span className="text-gray-600">Care Partner Card</span>
          </nav>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-(--bpa-green) flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-(--bpa-navy)">BPA Care Partner Card</h1>
          </div>
          <p className="text-lg text-gray-500 max-w-2xl">
            Choose your Care Partner Card tier and join Bangladesh&apos;s largest pet welfare community.
            Your contribution directly funds 24/7 community pet clinics in your zone.
          </p>
          <p className="text-sm text-gray-400 mt-1">
            বিপিএ কেয়ার পার্টনার কার্ড — আপনার এলাকায় পোষা প্রাণীর সুরক্ষায় অবদান রাখুন
          </p>

          {/* Launch offer banner */}
          <div className="mt-4 inline-flex items-center gap-2 bg-(--bpa-green) text-white text-sm font-bold px-4 py-1.5 rounded-full">
            <Star className="w-3.5 h-3.5" />
            Launch Offer — Limited Time Pricing
          </div>
        </div>
      </section>

      {/* ── Tier Cards ────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {TIERS.map((t) => (
              <div
                key={t.slug}
                className={`relative rounded-2xl border-2 p-6 flex flex-col transition-all hover:shadow-lg ${
                  t.isFeatured
                    ? 'border-(--bpa-green) shadow-md'
                    : 'border-gray-200 hover:border-(--bpa-green)/50'
                }`}
              >
                {/* Badge */}
                <div className="absolute -top-3 left-6">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      t.isFeatured
                        ? 'bg-(--bpa-green) text-white'
                        : 'bg-(--bpa-navy) text-white'
                    }`}
                  >
                    {t.badge}
                  </span>
                </div>

                {/* Card icon */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 mt-2 ${
                    t.isFeatured ? 'bg-(--bpa-green-light)' : 'bg-gray-100'
                  }`}
                >
                  <ShieldCheck
                    className={`w-6 h-6 ${t.isFeatured ? 'text-(--bpa-green)' : 'text-(--bpa-navy)'}`}
                  />
                </div>

                {/* Name */}
                <h2 className="text-lg font-bold text-(--bpa-navy) leading-tight mb-0.5">{t.name}</h2>
                <p className="text-xs text-gray-400 mb-4">{t.nameBn}</p>

                {/* Price */}
                <div className="mb-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-(--bpa-navy)">
                      ৳{t.launchPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-sm text-gray-400">/ {t.validity}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">Launch price — one-time contribution</p>
                </div>

                {/* Highlights */}
                <ul className="space-y-2 flex-1 mb-6">
                  {t.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-(--bpa-green) mt-0.5 shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={`/community-pet-care/contribute?tier=${t.slug}`}
                  className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                    t.isFeatured
                      ? 'bg-(--bpa-green) text-white hover:opacity-90'
                      : 'bg-(--bpa-navy) text-white hover:opacity-90'
                  }`}
                >
                  Get {t.name.split(' ')[0]} Card <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>

          {/* Legal disclaimer */}
          <div className="mt-10 p-5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-500 leading-relaxed max-w-3xl mx-auto text-center">
            <strong className="text-gray-700">Important Notice / গুরুত্বপূর্ণ বিজ্ঞপ্তি:</strong>
            {' '}The BPA Care Partner Card is a contribution recognition and service benefit card only.
            It is not ownership, share, profit-sharing, investment, or financial return.
            {' '}<strong>বিপিএ কেয়ার পার্টনার কার্ড</strong> শুধুমাত্র একটি অবদান স্বীকৃতি ও সেবা সুবিধা কার্ড।
            এটি কোনো মালিকানা, শেয়ার, মুনাফাভাগ, বিনিয়োগ বা আর্থিক রিটার্ন নয়।
          </div>

          {/* Footer links */}
          <div className="mt-8 text-center text-sm text-gray-400 space-y-2">
            <p>
              Already have a card?{' '}
              <Link href="/care-partner-card" className="text-(--bpa-green) hover:underline">
                Look up your Care Partner Card →
              </Link>
            </p>
            <p>
              <Link href="/community-pet-care/faq" className="text-(--bpa-green) hover:underline">
                Have questions? Read the FAQ →
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
