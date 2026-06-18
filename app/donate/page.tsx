import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import {
  Heart, ShieldCheck, FileText, QrCode, BarChart2,
  ArrowRight, ChevronDown, Syringe, Utensils,
  Ambulance, Building2, Leaf,
  Users, ClipboardList, Clock, Stethoscope, BadgeCheck,
} from 'lucide-react';
import { getDonationPageData } from '@/lib/api/donations';
import DonationForm from '@/components/donations/DonationForm';
import DonationCampaignCard from '@/components/donations/DonationCampaignCard';
import DonorWall from '@/components/donations/DonorWall';
import PurposeCards from '@/components/donations/PurposeCards';

export const revalidate = 120;

export const metadata: Metadata = {
  title: 'Donate | Bangladesh Pet Association — Every Taka Saves a Life',
  description:
    'Your secure donation directly funds vaccines, emergency care, rescue operations, and food for animals across Bangladesh. Official BPA receipt provided. Powered by EPS.',
  openGraph: {
    title: 'Donate to Bangladesh Pet Association',
    description: 'Help animals across Bangladesh with a secure, transparent donation.',
    type: 'website',
  },
};

// ─── Static FAQ ──────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: 'How is my donation used?',
    a: 'Every Taka is allocated across veterinary care (45%), food & nutrition (25%), rescue operations (20%), and operational costs (10%). We publish monthly transparency reports with full breakdowns.',
  },
  {
    q: 'Will I receive an official receipt?',
    a: 'Yes. Every successful donation generates a unique reference number (BPA-DON-*). You will receive a downloadable PDF receipt via email and can access it any time at /donation/receipt/[your-reference].',
  },
  {
    q: 'Is the EPS payment gateway secure?',
    a: 'Absolutely. EPS (Electronic Payment Solutions) is a licensed payment service provider in Bangladesh. All transactions use 256-bit SSL encryption. BPA never stores your card details.',
  },
  {
    q: 'Can I donate anonymously?',
    a: 'Yes. During checkout, check the "Keep my name anonymous" option. You will still receive a private receipt, but your name will appear as "Anonymous" on the public donor wall.',
  },
  {
    q: 'Can I donate for a specific cause or campaign?',
    a: 'Yes. Select a donation purpose (e.g., Vaccination, Rescue & Treatment) or a specific active campaign during the donation form. Your funds will be directed to that cause.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'All major Bangladeshi bank cards, bKash, Nagad, Rocket, and international Visa/Mastercard are accepted through the EPS gateway.',
  },
];

// ─── Fund Allocation Data ─────────────────────────────────────────────────────

const FUND_ALLOCATION = [
  { label: 'Veterinary Care & Treatment', percent: 45, color: 'bg-(--bpa-green)', icon: Syringe },
  { label: 'Food & Nutrition Programs', percent: 25, color: 'bg-blue-500', icon: Utensils },
  { label: 'Rescue Operations', percent: 20, color: 'bg-amber-500', icon: Ambulance },
  { label: 'Administration & Platform', percent: 10, color: 'bg-gray-400', icon: Building2 },
];

// ─── Trust Badges ─────────────────────────────────────────────────────────────

const TRUST_BADGES = [
  { icon: ShieldCheck, label: 'Secure EPS Payment', sub: 'Bank-grade encryption' },
  { icon: FileText, label: 'Official BPA Receipt', sub: 'PDF + email delivery' },
  { icon: QrCode, label: 'QR-Verifiable', sub: 'Scan to confirm' },
  { icon: BarChart2, label: '100% Tracked', sub: 'Monthly transparency' },
];

// ─── Impact Quick Cards ───────────────────────────────────────────────────────

const IMPACT_CARDS = [
  {
    amount: '৳600',
    icon: Syringe,
    label: 'Vaccination Support',
    desc: 'Covers 5 street-animal rabies & distemper vaccines',
    href: '/donate?purpose=street-animal-vaccination#donate-form',
    color: 'bg-green-50 border-green-200',
    iconColor: 'text-(--bpa-green) bg-green-100',
  },
  {
    amount: '৳3,000',
    icon: BadgeCheck,
    label: 'Community Care Partner',
    desc: 'Supports one Community Pet Care zone for a week',
    href: '/community-pet-care/contribute',
    color: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600 bg-blue-100',
  },
  {
    amount: 'Any',
    icon: Ambulance,
    label: 'Emergency Rescue',
    desc: 'Fund urgent rescues, surgery & food for street animals',
    href: '/donate?purpose=rescue-emergency-treatment#donate-form',
    color: 'bg-amber-50 border-amber-200',
    iconColor: 'text-amber-600 bg-amber-100',
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function DonatePage() {
  const data = await getDonationPageData({ next: { revalidate: 120 } } as RequestInit).catch(() => null);

  const settings = data?.settings ?? {
    heroTitleEn: 'Every Taka You Give Saves a Life',
    heroSubtitleEn: 'Support Bangladesh\'s first dedicated pet welfare network. Your secure donation funds vaccines, emergency surgery, rescue missions and daily meals for animals in need.',
    showPurposeCards: true,
    showCampaigns: true,
    showImpactStories: true,
    showDonorWall: true,
    showTransparency: true,
    showQrSection: false,
    showImpactCounters: true,
    faqJson: null,
  };

  const purposes = data?.purposes ?? [];
  const campaigns = data?.campaigns ?? [];
  const donors = data?.donors ?? [];
  const stories = data?.stories ?? [];
  const transparencySummary = data?.transparencySummary ?? null;

  const totalRaisedBdt = transparencySummary
    ? Number(transparencySummary.totalReceived).toLocaleString('en-IN')
    : '১২,০০,০০০+';

  return (
    <div className="min-h-screen">

      {/* ── 1. HERO ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-(--bpa-navy) pt-20 pb-0">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-(--bpa-green)/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-0 h-[400px] w-[500px] rounded-full bg-(--bpa-green)/5 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">

            {/* Left — copy */}
            <div className="lg:col-span-6 pt-8 pb-16 text-white space-y-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold text-(--bpa-green) ring-1 ring-white/10 backdrop-blur-sm">
                <Heart size={14} className="fill-current" />
                Official BPA Animal Welfare Fund
              </span>

              <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                {settings.heroTitleEn}
              </h1>

              <p className="max-w-lg text-lg leading-relaxed text-gray-300">
                {settings.heroSubtitleEn}
              </p>

              {/* Impact counters */}
              {settings.showImpactCounters && (
                <div className="grid grid-cols-3 gap-4 pt-2 border-t border-white/10">
                  {[
                    { value: `৳${totalRaisedBdt}`, label: 'Total Raised' },
                    { value: '15,000+', label: 'Animals Helped' },
                    { value: '8,500+', label: 'Vaccines Given' },
                    { value: '12,000+', label: 'Meals Served' },
                    { value: '450+', label: 'Rescues Done' },
                    { value: '5,000+', label: 'Donors' },
                  ].map(({ value, label }) => (
                    <div key={label} className="space-y-0.5">
                      <p className="text-2xl font-extrabold text-(--bpa-green)">{value}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Trust badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                {TRUST_BADGES.map(({ icon: Icon, label, sub }) => (
                  <div
                    key={label}
                    className="flex flex-col items-start gap-1 rounded-xl bg-white/5 px-3 py-2.5 ring-1 ring-white/10"
                  >
                    <Icon size={15} className="text-(--bpa-green) shrink-0" />
                    <p className="text-xs font-bold text-white leading-tight">{label}</p>
                    <p className="text-[10px] text-gray-400 leading-tight">{sub}</p>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <a
                  href="#donate-form"
                  className="inline-flex items-center gap-2 rounded-xl bg-(--bpa-green) px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-(--bpa-green)/30 transition hover:opacity-90"
                >
                  <Heart size={16} className="fill-current" />
                  Donate Now
                </a>
                <a
                  href="#impact"
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-7 py-3.5 text-sm font-bold text-white ring-1 ring-white/20 transition hover:bg-white/15"
                >
                  See Our Impact
                  <ChevronDown size={16} />
                </a>
              </div>
            </div>

            {/* Right — Donation form (sticky card) */}
            <div className="lg:col-span-6 lg:sticky lg:top-24" id="donate-form">
              <div className="relative -mb-8 rounded-3xl shadow-2xl shadow-black/40">
                <Suspense
                  fallback={
                    <div className="flex h-64 items-center justify-center rounded-3xl bg-white">
                      <span className="text-sm text-gray-400">Loading donation form…</span>
                    </div>
                  }
                >
                  <DonationForm purposes={purposes} campaigns={campaigns} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. IMPACT QUICK CARDS ────────────────────────────────────────── */}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-6 text-center text-xs font-bold uppercase tracking-widest text-gray-400">
            Quick Impact — Choose a giving level
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {IMPACT_CARDS.map(({ amount, icon: Icon, label, desc, href, color, iconColor }) => (
              <Link
                key={label}
                href={href}
                className={`group relative flex items-start gap-4 rounded-2xl border p-5 transition hover:shadow-md hover:-translate-y-0.5 ${color}`}
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconColor}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xl font-extrabold text-(--bpa-navy)">{amount}</span>
                    <span className="text-xs font-bold text-gray-500">/ impact</span>
                  </div>
                  <p className="text-sm font-bold text-(--bpa-navy) leading-tight">{label}</p>
                  <p className="mt-1 text-xs text-gray-500 leading-snug">{desc}</p>
                </div>
                <ArrowRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-(--bpa-green) transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2b. PET CENSUS 2026 ───────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-50 to-blue-50/40 py-20 border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">

            {/* Left — content */}
            <div className="space-y-8">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-(--bpa-green)/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-(--bpa-green) ring-1 ring-(--bpa-green)/20 mb-4">
                  <ClipboardList size={13} />
                  Pet Census 2026 — Registration Open
                </span>
                <h2 className="text-3xl font-extrabold text-(--bpa-navy) sm:text-4xl leading-tight">
                  Register Your Pets.<br />Help Us Plan Better Care.
                </h2>
                <p className="mt-4 text-base text-gray-500 leading-relaxed">
                  BPA&apos;s first national Pet Census helps us map vaccination zones, plan rescue capacity,
                  and bring Community Pet Care to your neighbourhood. It takes under 2 minutes.
                </p>
              </div>

              {/* Info cards */}
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    icon: Clock,
                    title: 'Registration Period',
                    value: '18 June – 24 June 2026',
                    color: 'text-blue-600 bg-blue-100',
                  },
                  {
                    icon: Stethoscope,
                    title: 'Estimated Time',
                    value: 'Less than 2 minutes',
                    color: 'text-(--bpa-green) bg-green-100',
                  },
                  {
                    icon: Users,
                    title: 'Who Can Register',
                    value: 'Cat & dog owners, rescuers, shelters',
                    color: 'text-purple-600 bg-purple-100',
                  },
                  {
                    icon: BarChart2,
                    title: 'Why It Matters',
                    value: 'Shapes BPA vaccination, clinic & rescue planning',
                    color: 'text-amber-600 bg-amber-100',
                  },
                ].map(({ icon: Icon, title, value, color }) => (
                  <div
                    key={title}
                    className="flex items-start gap-3 rounded-xl bg-white p-4 border border-gray-100 shadow-sm"
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${color}`}>
                      <Icon size={17} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{title}</p>
                      <p className="text-sm font-semibold text-(--bpa-navy) mt-0.5 leading-snug">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/pet-census-2026"
                className="inline-flex items-center gap-2 rounded-xl bg-(--bpa-navy) px-8 py-3.5 text-sm font-bold text-white shadow-md transition hover:opacity-90 hover:-translate-y-0.5"
              >
                <ClipboardList size={16} />
                Register Your Pets — It&apos;s Free
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Right — visual */}
            <div className="hidden lg:flex justify-center">
              <div className="relative w-full max-w-sm">
                {/* Decorative card stack */}
                <div className="absolute -top-4 -right-4 w-full h-full rounded-3xl bg-(--bpa-green)/10 border border-(--bpa-green)/20" />
                <div className="relative rounded-3xl bg-white border border-gray-200 shadow-xl p-8 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-(--bpa-green) flex items-center justify-center shadow-lg shadow-(--bpa-green)/30">
                      <ClipboardList size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="font-extrabold text-(--bpa-navy) text-lg leading-tight">Pet Census</p>
                      <p className="text-xs text-gray-400 font-medium">Bangladesh 2026</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Pets Registered', value: '2,847+', bar: 28 },
                      { label: 'Zones Covered', value: '12 of 64', bar: 19 },
                      { label: 'Target', value: '10,000 pets', bar: 100 },
                    ].map(({ label, value, bar }) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-gray-500 font-medium">{label}</span>
                          <span className="font-bold text-(--bpa-navy)">{value}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-(--bpa-green)"
                            style={{ width: `${bar}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-(--bpa-green) animate-pulse" />
                    <span className="text-xs font-bold text-(--bpa-green)">Registration is OPEN</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 3. PURPOSE CARDS ─────────────────────────────────────────────── */}
      {settings.showPurposeCards && purposes.length > 0 && (
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <span className="mb-2 block text-sm font-bold uppercase tracking-wider text-(--bpa-green)">Direct Your Impact</span>
              <h2 className="text-3xl font-extrabold text-(--bpa-navy) sm:text-4xl">Choose Where to Give</h2>
              <p className="mx-auto mt-3 max-w-xl text-base text-gray-500">
                Select a specific cause or let us direct your funds where they&apos;re needed most today.
              </p>
            </div>
            <PurposeCards purposes={purposes} />
          </div>
        </section>
      )}

      {/* ── 4. FEATURED CAMPAIGNS ────────────────────────────────────────── */}
      {settings.showCampaigns && campaigns.length > 0 && (
        <section className="border-y border-gray-100 bg-gray-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="mb-2 block text-sm font-bold uppercase tracking-wider text-(--bpa-green)">Urgent Needs</span>
                <h2 className="text-3xl font-extrabold text-(--bpa-navy) sm:text-4xl">Active Campaigns</h2>
              </div>
              <Link href="/donations/campaigns" className="flex items-center gap-1 text-sm font-bold text-(--bpa-green) hover:underline">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((campaign) => (
                <DonationCampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 6. IMPACT STORIES ────────────────────────────────────────────── */}
      {settings.showImpactStories && stories.length > 0 && (
        <section className="bg-white py-20" id="impact">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <span className="mb-2 block text-sm font-bold uppercase tracking-wider text-(--bpa-green)">Real Impact</span>
              <h2 className="text-3xl font-extrabold text-(--bpa-navy) sm:text-4xl">Stories of Survival</h2>
              <p className="mx-auto mt-3 max-w-xl text-base text-gray-500">
                See the direct result of your generosity — animals rescued, healed, and given a second chance.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {stories.slice(0, 3).map((story) => (
                <Link
                  key={story.id}
                  href={`/donations/impact-stories/${story.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-sm transition hover:shadow-lg hover:-translate-y-1"
                >
                  {story.afterImageUrl || story.beforeImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={story.afterImageUrl || story.beforeImageUrl || ''}
                      alt={story.titleEn}
                      className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex aspect-video items-center justify-center bg-(--bpa-green-light)">
                      <Heart size={40} className="text-(--bpa-green)/30" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <span className="mb-2 text-xs font-bold uppercase tracking-wider text-(--bpa-green)">
                      {story.storyType}
                    </span>
                    <h3 className="mb-2 text-base font-bold leading-snug text-(--bpa-navy) line-clamp-2">
                      {story.titleEn}
                    </h3>
                    <p className="mb-4 flex-1 text-sm text-gray-500 line-clamp-3">
                      {story.shortDescriptionEn}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-(--bpa-green)">
                      Read Full Story <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 7. WHERE YOUR MONEY GOES ─────────────────────────────────────── */}
      <section className="bg-gray-50 py-20 border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="mb-2 block text-sm font-bold uppercase tracking-wider text-(--bpa-green)">Accountability</span>
              <h2 className="mb-4 text-3xl font-extrabold text-(--bpa-navy) sm:text-4xl">
                Where Your Donation Goes
              </h2>
              <p className="mb-8 text-base text-gray-500 leading-relaxed">
                We follow a strict fund allocation policy approved by our board of trustees. Every Taka is tracked, audited, and reported monthly. Zero hidden fees.
              </p>
              <div className="space-y-5">
                {FUND_ALLOCATION.map(({ label, percent, color, icon: Icon }) => (
                  <div key={label}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon size={15} className="text-gray-400" />
                        <span className="text-sm font-semibold text-gray-700">{label}</span>
                      </div>
                      <span className="text-sm font-bold text-(--bpa-navy)">{percent}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`h-full rounded-full ${color} transition-all duration-700`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link
                  href="/donations/transparency"
                  className="inline-flex items-center gap-2 text-sm font-bold text-(--bpa-green) hover:underline"
                >
                  View Monthly Transparency Reports <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Transparency summary card */}
            <div className="space-y-5">
              <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--bpa-green-light)">
                    <BarChart2 size={20} className="text-(--bpa-green)" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Latest Report</p>
                    <p className="font-bold text-(--bpa-navy)">
                      {transparencySummary?.titleEn ?? 'Fund Transparency Report'}
                    </p>
                  </div>
                </div>

                {transparencySummary ? (
                  <div className="space-y-4">
                    {[
                      { label: 'Total Received', value: `৳${Number(transparencySummary.totalReceived).toLocaleString()}`, color: 'text-(--bpa-green)' },
                      { label: 'Total Used', value: `৳${Number(transparencySummary.totalUsed).toLocaleString()}`, color: 'text-blue-600' },
                      { label: 'Vaccination', value: `৳${Number(transparencySummary.vaccinationExpense).toLocaleString()}`, color: 'text-gray-700' },
                      { label: 'Food Programs', value: `৳${Number(transparencySummary.foodExpense).toLocaleString()}`, color: 'text-gray-700' },
                      { label: 'Treatment', value: `৳${Number(transparencySummary.treatmentExpense).toLocaleString()}`, color: 'text-gray-700' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{label}</span>
                        <span className={`font-bold ${color}`}>{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Full reports published monthly. Click below to view.</p>
                )}

                <Link
                  href="/donations/transparency"
                  className="mt-6 block w-full rounded-xl bg-gray-50 py-2.5 text-center text-sm font-bold text-(--bpa-navy) transition hover:bg-gray-100"
                >
                  View All Reports
                </Link>
              </div>

              {/* Trust card */}
              <div className="rounded-2xl bg-(--bpa-navy) p-6 text-white">
                <ShieldCheck size={24} className="mb-3 text-(--bpa-green)" />
                <h4 className="mb-2 font-bold">Official PDF Receipts</h4>
                <p className="text-sm leading-relaxed text-gray-300">
                  Every donation generates a unique, verifiable receipt with a QR code. Download it any time from{' '}
                  <span className="font-mono text-xs text-(--bpa-green)">/donation/receipt/[reference]</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. QR SECTION ────────────────────────────────────────────────── */}
      {settings.showQrSection && (
        <section className="bg-(--bpa-navy) py-20 border-t border-gray-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div className="text-white space-y-6">
                <span className="text-sm font-bold uppercase tracking-wider text-(--bpa-green)">QR Donation Network</span>
                <h2 className="text-3xl font-extrabold sm:text-4xl">Scan & Give — Anywhere, Anytime</h2>
                <p className="text-gray-300 leading-relaxed">
                  Our official BPA Donation QR codes are placed in partner clinics, pet shops, and cafes across Bangladesh.
                  Scan to donate instantly — no account required.
                </p>
                <div className="flex flex-wrap gap-3">
                  {[{ icon: ShieldCheck, label: 'Verified QR Codes' }, { icon: QrCode, label: 'Instant Redirect' }].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 ring-1 ring-white/10">
                      <Icon size={16} className="text-(--bpa-green)" />
                      <span className="text-sm font-bold">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center">
                <div className="rotate-3 rounded-3xl bg-white p-8 shadow-2xl transition hover:rotate-0">
                  <div className="flex h-48 w-48 items-center justify-center rounded-xl border-4 border-(--bpa-green) bg-gray-50">
                    <QrCode size={64} className="text-gray-300" />
                  </div>
                  <p className="mt-4 text-center text-sm font-bold text-(--bpa-navy)">Scan to Donate</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 9. DONOR WALL ────────────────────────────────────────────────── */}
      {settings.showDonorWall && donors.length > 0 && (
        <section className="bg-white py-20 border-t border-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <span className="mb-2 block text-sm font-bold uppercase tracking-wider text-(--bpa-green)">Community</span>
              <h2 className="text-3xl font-extrabold text-(--bpa-navy) sm:text-4xl">Our Generous Donors</h2>
            </div>
            <div className="rounded-3xl border border-gray-100 bg-gray-50 p-8 shadow-sm">
              <DonorWall donors={donors} />
            </div>
          </div>
        </section>
      )}

      {/* ── 10. TRANSPARENCY TEASER ──────────────────────────────────────── */}
      {settings.showTransparency && transparencySummary && (
        <section className="bg-gray-50 py-16 border-t border-gray-100">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <Leaf size={32} className="mx-auto mb-4 text-(--bpa-green)" />
            <h2 className="mb-3 text-2xl font-bold text-(--bpa-navy)">We Believe in Full Transparency</h2>
            <p className="mb-6 text-gray-500">
              Monthly fund reports are published publicly so donors know exactly where their money went.
            </p>
            <Link
              href="/donations/transparency"
              className="inline-flex items-center gap-2 rounded-xl bg-(--bpa-navy) px-7 py-3 text-sm font-bold text-white transition hover:opacity-90"
            >
              <BarChart2 size={16} /> View Transparency Reports
            </Link>
          </div>
        </section>
      )}

      {/* ── 11. FAQ ──────────────────────────────────────────────────────── */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <span className="mb-2 block text-sm font-bold uppercase tracking-wider text-(--bpa-green)">Have Questions?</span>
            <h2 className="text-3xl font-extrabold text-(--bpa-navy) sm:text-4xl">Frequently Asked Questions</h2>
          </div>
          <FaqAccordion items={FAQ_ITEMS} />
        </div>
      </section>

      {/* ── 12. FINAL CTA ────────────────────────────────────────────────── */}
      <section className="bg-(--bpa-green) py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <Heart size={40} className="mx-auto mb-6 fill-current text-white/30" />
          <h2 className="mb-4 text-4xl font-extrabold text-white sm:text-5xl">
            Make a Difference Today
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-lg text-green-100">
            Over 15,000 animals have been helped with the support of kind people like you.
            Your next donation could save a life tonight.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#donate-form"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-(--bpa-green) shadow-lg transition hover:shadow-xl hover:-translate-y-0.5"
            >
              <Heart size={18} className="fill-current" />
              Donate Now
            </a>
            <Link
              href="/donations/transparency"
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-8 py-4 text-base font-bold text-white ring-1 ring-white/25 transition hover:bg-white/20"
            >
              <BarChart2 size={18} />
              See Where It Goes
            </Link>
          </div>
          <p className="mt-8 text-sm text-green-200">
            Secure payment via EPS · Official PDF receipt · QR-verifiable
          </p>
        </div>
      </section>

    </div>
  );
}

// ─── FAQ Accordion (server-rendered HTML with CSS toggle trick) ───────────────

function FaqAccordion({ items }: { items: typeof FAQ_ITEMS }) {
  return (
    <div className="space-y-4">
      {items.map(({ q, a }, i) => (
        <details
          key={i}
          className="group rounded-2xl border border-gray-100 bg-gray-50 p-0 open:bg-white open:shadow-sm transition-all"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5 font-bold text-(--bpa-navy) select-none">
            {q}
            <ChevronDown
              size={18}
              className="shrink-0 text-gray-400 transition-transform group-open:rotate-180"
            />
          </summary>
          <div className="px-6 pb-5 text-sm leading-relaxed text-gray-600">{a}</div>
        </details>
      ))}
    </div>
  );
}
