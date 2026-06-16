'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight, CalendarDays, Clock, Users, Syringe,
  ChevronRight, MapPin, Tag, AlertCircle, CheckCircle2,
  Zap,
} from 'lucide-react';
import type { CampaignListItem, CampaignType, CampaignStatus, HomepageSection } from '@/types/bpa.types';
import { normalizeCampaignPricing, getCampaignMediaUrl } from '@/lib/utils/format';

// ─── Types ─────────────────────────────────────────────────────────

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

interface NormalizedCampaign {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  campaignType: CampaignType;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  registrationCloseAt: string | null;
  coverUrl: string;
  isFree: boolean;
  campaignFee: number;
  serviceTotal: number;
  savings: number;
  discountPercent: number;
  hasDiscount: boolean;
  sessionCount: number;
  countdownTarget: Date | null;
  isRegistrationOpen: boolean;
  isComingSoon: boolean;
  isExpired: boolean;
  isFeatured: boolean;
}

// ─── Constants ────────────────────────────────────────────────────

const TYPE_LABELS: Record<CampaignType, string> = {
  vaccination: 'Vaccination',
  deworming: 'Deworming',
  microchip: 'Microchipping',
  health_camp: 'Health Camp',
  spay_neuter: 'Spay & Neuter',
};

const TYPE_COLORS: Record<CampaignType, string> = {
  vaccination: 'bg-blue-500',
  deworming: 'bg-amber-500',
  microchip: 'bg-purple-500',
  health_camp: 'bg-teal-500',
  spay_neuter: 'bg-rose-500',
};

// ─── Data normalizer (safe) ───────────────────────────────────────

function normalizeCampaign(c: CampaignListItem): NormalizedCampaign {
  const pricing = normalizeCampaignPricing(c);
  const coverUrl = getCampaignMediaUrl(c, 'hero') || getCampaignMediaUrl(c, 'thumbnail') || c.coverImage?.url || '';

  const now = new Date();
  const regClose = c.registrationCloseAt ? new Date(c.registrationCloseAt) : null;
  const regOpen  = c.registrationOpenAt  ? new Date(c.registrationOpenAt)  : null;
  const end = new Date(c.endDate);

  // Countdown: prefer registrationCloseAt, fall back to endDate
  let countdownTarget: Date | null = null;
  if (regClose && regClose > now) {
    countdownTarget = regClose;
  } else if (end > now) {
    countdownTarget = end;
  }

  // Registration is truly open only when status matches AND dates are valid
  const isRegistrationOpen =
    c.status === 'registration_open' &&
    (!regOpen  || regOpen  <= now) &&
    (!regClose || regClose >  now);

  const isComingSoon = c.status === 'published';

  const isExpired =
    ['completed', 'cancelled', 'registration_closed'].includes(c.status) ||
    (regClose ? regClose <= now : c.status === 'registration_open' && end <= now);

  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description,
    campaignType: c.campaignType,
    status: c.status,
    startDate: c.startDate,
    endDate: c.endDate,
    registrationCloseAt: c.registrationCloseAt ?? null,
    coverUrl,
    ...pricing,
    sessionCount: c._count?.sessions ?? 0,
    countdownTarget,
    isRegistrationOpen,
    isComingSoon,
    isExpired,
    isFeatured: c.isFeatured,
  };
}

// ─── Time helpers ─────────────────────────────────────────────────

function calcTimeLeft(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    total: diff,
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
  };
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Urgency logic ────────────────────────────────────────────────

function getUrgencyLevel(t: TimeLeft | null): 'high' | 'medium' | 'low' | null {
  if (!t || t.total === 0) return null;
  if (t.days === 0) return 'high';
  if (t.days <= 3) return 'medium';
  return 'low';
}

// ─── Countdown display (hydration-safe client component) ──────────

function CountdownClock({ target, compact = false }: { target: Date; compact?: boolean }) {
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const update = () => setTime(calcTimeLeft(target));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!time) {
    // SSR placeholder — avoids hydration mismatch
    if (compact) {
      return <span className="inline-block w-24 h-5 bg-white/20 rounded animate-pulse" />;
    }
    return (
      <div className="grid grid-cols-4 gap-2">
        {['Days', 'Hrs', 'Min', 'Sec'].map((u) => (
          <div key={u} className="flex flex-col items-center">
            <div className="bg-white/20 rounded-xl w-full h-14 animate-pulse mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">{u}</span>
          </div>
        ))}
      </div>
    );
  }

  if (time.total === 0) return null;

  if (compact) {
    const urgency = getUrgencyLevel(time);
    const color = urgency === 'high' ? 'text-red-400' : urgency === 'medium' ? 'text-amber-400' : 'text-green-300';
    return (
      <span className={`font-mono text-xs font-bold ${color}`}>
        {time.days > 0
          ? `${time.days}d ${String(time.hours).padStart(2, '0')}h`
          : `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`}
      </span>
    );
  }

  const urgency = getUrgencyLevel(time);
  const unitBg = urgency === 'high'
    ? 'bg-red-500/30 border-red-400/40'
    : urgency === 'medium'
    ? 'bg-amber-500/20 border-amber-400/30'
    : 'bg-white/10 border-white/20';

  const units = [
    { v: time.days, l: 'Days' },
    { v: time.hours, l: 'Hrs' },
    { v: time.minutes, l: 'Min' },
    { v: time.seconds, l: 'Sec' },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {units.map(({ v, l }) => (
        <div key={l} className="flex flex-col items-center">
          <div className={`border rounded-xl w-full flex items-center justify-center py-2.5 mb-1 transition-colors ${unitBg}`}>
            <span className="text-white text-xl font-black tabular-nums leading-none">
              {String(v).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">{l}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Registration status badge ────────────────────────────────────

function RegStatusBadge({ campaign }: { campaign: NormalizedCampaign }) {
  if (campaign.isExpired) {
    return (
      <span className="inline-flex items-center gap-1 bg-gray-700/80 text-gray-300 text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
        <AlertCircle size={10} />
        Registration Closed
      </span>
    );
  }
  if (campaign.isRegistrationOpen) {
    return (
      <span className="inline-flex items-center gap-1 bg-(--bpa-green) text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
        <Zap size={10} className="fill-white" />
        Register Now
      </span>
    );
  }
  if (campaign.isComingSoon) {
    return (
      <span className="inline-flex items-center gap-1 bg-blue-500/80 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
        <Clock size={10} />
        Coming Soon
      </span>
    );
  }
  return null;
}

// ─── Spotlight hero card ──────────────────────────────────────────

function SpotlightCard({ campaign }: { campaign: NormalizedCampaign }) {
  const typeDot = TYPE_COLORS[campaign.campaignType] ?? 'bg-gray-400';

  return (
    <div className="relative bg-(--bpa-navy) rounded-2xl overflow-hidden flex flex-col lg:flex-row min-h-[380px] shadow-xl border border-white/5">
      {/* ── Cover image (left/top) ── */}
      <div className="relative w-full lg:w-[55%] shrink-0 overflow-hidden min-h-[220px] lg:min-h-0">
        {campaign.coverUrl ? (
          <Image
            src={campaign.coverUrl}
            alt={campaign.title}
            fill
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-(--bpa-navy) to-green-900 flex items-center justify-center">
            <Syringe size={64} className="text-white/20" />
          </div>
        )}
        {/* Gradient overlay bottom-only for mobile, right-only for desktop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-(--bpa-navy)/95" />

        {/* Floating badges on image */}
        <div className="absolute top-4 left-4 flex items-center gap-2 flex-wrap">
          <span className={`w-2 h-2 rounded-full ${typeDot}`} />
          <span className="text-white/90 text-xs font-bold uppercase tracking-widest bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
            {TYPE_LABELS[campaign.campaignType] ?? campaign.campaignType}
          </span>
          {campaign.isFree && (
            <span className="bg-yellow-400 text-yellow-900 text-[11px] font-black px-2.5 py-1 rounded-full">
              FREE
            </span>
          )}
          {campaign.hasDiscount && !campaign.isFree && (
            <span className="bg-amber-400 text-amber-900 text-[11px] font-black px-2.5 py-1 rounded-full">
              {campaign.discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Mobile bottom title area */}
        <div className="absolute bottom-0 left-0 right-0 p-5 lg:hidden">
          <RegStatusBadge campaign={campaign} />
          <h3 className="text-white font-black text-xl mt-2 leading-tight line-clamp-2 drop-shadow-lg">
            {campaign.title}
          </h3>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col justify-between p-6 lg:p-8 gap-5">
        {/* Title (desktop) */}
        <div className="hidden lg:block">
          <RegStatusBadge campaign={campaign} />
          <h3 className="text-white font-black text-2xl mt-3 leading-tight line-clamp-3">
            {campaign.title}
          </h3>
          {campaign.description && (
            <p className="text-white/60 text-sm mt-2 line-clamp-2 leading-relaxed">
              {campaign.description}
            </p>
          )}
        </div>

        {/* Countdown block */}
        <div>
          {!campaign.isExpired && campaign.countdownTarget ? (
            <div>
              <p className="text-white/50 text-[11px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Clock size={11} />
                {campaign.isRegistrationOpen ? 'Registration closes in' : 'Campaign starts in'}
              </p>
              <CountdownClock target={campaign.countdownTarget} />
            </div>
          ) : campaign.isExpired ? (
            <div className="flex items-center gap-2 bg-gray-700/50 rounded-xl px-4 py-3">
              <CheckCircle2 size={16} className="text-gray-400" />
              <span className="text-gray-400 text-sm font-semibold">Registration Closed</span>
            </div>
          ) : null}
        </div>

        {/* Metrics row */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-white/50 text-xs">
            <CalendarDays size={12} className="shrink-0" />
            <span>{formatShortDate(campaign.startDate)}</span>
          </div>
          {campaign.sessionCount > 0 && (
            <div className="flex items-center gap-1.5 text-white/50 text-xs">
              <Users size={12} className="shrink-0" />
              <span>{campaign.sessionCount} session{campaign.sessionCount !== 1 ? 's' : ''}</span>
            </div>
          )}
          {!campaign.isFree && campaign.campaignFee > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <Tag size={12} className="text-white/50 shrink-0" />
              {campaign.hasDiscount && campaign.serviceTotal > 0 && (
                <span className="text-white/30 line-through">৳{campaign.serviceTotal.toLocaleString()}</span>
              )}
              <span className="text-white font-bold">৳{campaign.campaignFee.toLocaleString()}</span>
              <span className="text-white/40">/pet</span>
            </div>
          )}
          {campaign.isFree && (
            <div className="flex items-center gap-1.5 text-xs text-yellow-400 font-bold">
              <Tag size={12} className="shrink-0" />
              Free Entry
            </div>
          )}
        </div>

        {/* CTA */}
        <Link
          href={`/campaigns/${campaign.slug}`}
          className={`group flex items-center justify-center gap-2 rounded-xl py-3.5 px-6 font-bold text-sm transition-all ${
            campaign.isRegistrationOpen
              ? 'bg-(--bpa-green) text-white hover:bg-green-600 shadow-lg shadow-(--bpa-green)/30 hover:shadow-green-600/40'
              : campaign.isComingSoon
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-white/10 text-white/70 hover:bg-white/20 cursor-default'
          }`}
        >
          {campaign.isRegistrationOpen
            ? 'Register Now'
            : campaign.isComingSoon
            ? 'View Details'
            : 'View Campaign'}
          <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

// ─── Sidebar mini card ────────────────────────────────────────────

function SidebarCard({ campaign }: { campaign: NormalizedCampaign }) {
  const urgency = campaign.countdownTarget ? getUrgencyLevel(calcTimeLeft(campaign.countdownTarget)) : null;
  const urgencyBorder = urgency === 'high'
    ? 'border-red-200 bg-red-50/50'
    : urgency === 'medium'
    ? 'border-amber-200 bg-amber-50/30'
    : 'border-gray-100 bg-white';

  return (
    <Link
      href={`/campaigns/${campaign.slug}`}
      className={`group flex items-start gap-3 p-3.5 rounded-xl border transition-all hover:shadow-sm hover:border-(--bpa-green)/30 ${urgencyBorder}`}
    >
      {/* Thumbnail */}
      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
        {campaign.coverUrl ? (
          <Image src={campaign.coverUrl} alt={campaign.title} fill sizes="56px" className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-(--bpa-navy)/10 to-(--bpa-green)/10">
            <Syringe size={18} className="text-(--bpa-green)" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          {campaign.isRegistrationOpen && (
            <span className="text-[10px] font-bold text-white bg-(--bpa-green) px-1.5 py-0.5 rounded-full">Open</span>
          )}
          {campaign.isComingSoon && (
            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded-full">Soon</span>
          )}
          {campaign.isExpired && (
            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">Closed</span>
          )}
          {campaign.isFree && (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">Free</span>
          )}
        </div>
        <h4 className="text-sm font-semibold text-(--bpa-navy) line-clamp-2 leading-snug group-hover:text-(--bpa-green) transition-colors">
          {campaign.title}
        </h4>
        <div className="flex items-center justify-between mt-1.5 gap-2">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <CalendarDays size={10} />
            {formatShortDate(campaign.startDate)}
          </span>
          {!campaign.isExpired && campaign.countdownTarget && (
            <CountdownClock target={campaign.countdownTarget} compact />
          )}
        </div>
      </div>

      <ChevronRight size={13} className="text-gray-300 group-hover:text-(--bpa-green) shrink-0 mt-1 transition-colors" />
    </Link>
  );
}

// ─── Section header ──────────────────────────────────────────────

function SectionHeader({ section }: { section?: HomepageSection | null }) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div>
        <div className="inline-flex items-center gap-2 mb-2">
          <span className="w-1 h-4 rounded-full bg-(--bpa-green)" />
          <p className="text-xs font-bold text-(--bpa-green) uppercase tracking-[0.15em]">
            {section?.eyebrow || 'Campaign Spotlight'}
          </p>
        </div>
        <h2 className="text-3xl font-black text-(--bpa-navy) leading-tight">
          {section?.title || 'Active Campaigns'}
        </h2>
        {section?.subtitle && (
          <p className="text-gray-500 mt-1.5 text-sm max-w-md">{section.subtitle}</p>
        )}
      </div>
      <Link
        href="/campaigns"
        className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-(--bpa-navy) hover:text-(--bpa-green) transition-colors group"
      >
        All campaigns
        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
}

// ─── Sidebar section label ────────────────────────────────────────

function SidebarLabel({ label }: { label: string }) {
  return (
    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.12em] px-1 mb-2">{label}</p>
  );
}

// ─── Empty state ──────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Syringe size={24} className="text-gray-300" />
      </div>
      <p className="text-gray-700 font-bold text-lg mb-1">No active campaign registration right now</p>
      <p className="text-gray-400 text-sm max-w-xs mx-auto mb-5">
        You can still check your existing booking or registration status.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/booking-lookup"
          className="inline-flex items-center justify-center gap-2 bg-(--bpa-green) text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-green-600 transition-colors"
        >
          Check Booking / Registration
        </Link>
        <Link
          href="/campaigns"
          className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-600 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Browse all campaigns
        </Link>
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────

interface Props {
  featured: CampaignListItem[];
  registrationOpen: CampaignListItem[];
  upcoming: CampaignListItem[];
  section?: HomepageSection | null;
}

// Only actively open or upcoming campaigns are visible in this section
const VISIBLE = new Set<CampaignStatus>(['published', 'registration_open']);

// ─── Main section ─────────────────────────────────────────────────

export default function CampaignsSection({ featured, registrationOpen, upcoming, section }: Props) {
  const allItems = [
    ...featured,
    ...registrationOpen,
    ...upcoming,
  ].filter((c, i, arr) => VISIBLE.has(c.status) && arr.findIndex((x) => x.id === c.id) === i);

  const normalized = allItems
    .map(normalizeCampaign)
    .filter((c) => !c.isExpired);

  // Spotlight: prefer admin-selected isFeatured + open, then any open, then any upcoming
  const spotlight =
    normalized.find((c) => c.isFeatured && c.isRegistrationOpen) ??
    normalized.find((c) => c.isRegistrationOpen) ??
    normalized.find((c) => c.isComingSoon) ??
    normalized[0] ??
    null;

  const sidebarItems = spotlight
    ? normalized.filter((c) => c.id !== spotlight.id).slice(0, 4)
    : [];

  const openItems = sidebarItems.filter((c) => c.isRegistrationOpen);
  const otherItems = sidebarItems.filter((c) => !c.isRegistrationOpen);

  return (
    <section className="py-16 bg-gray-50/80">
      <div className="max-w-6xl mx-auto px-4">
        <SectionHeader section={section} />

        {!spotlight ? (
          <EmptyState />
        ) : (
          <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Spotlight hero — 2/3 width on desktop */}
          <div className="lg:col-span-2">
            <SpotlightCard campaign={spotlight} />
          </div>

          {/* Sidebar — 1/3 width */}
          <div className="flex flex-col gap-3">
            {openItems.length > 0 && (
              <>
                <SidebarLabel label="Open for Registration" />
                {openItems.map((c) => (
                  <SidebarCard key={c.id} campaign={c} />
                ))}
              </>
            )}
            {otherItems.length > 0 && (
              <>
                <SidebarLabel label={openItems.length > 0 ? 'Coming Soon' : 'More Campaigns'} />
                {otherItems.map((c) => (
                  <SidebarCard key={c.id} campaign={c} />
                ))}
              </>
            )}
            {sidebarItems.length === 0 && (
              <div className="flex items-center justify-center flex-1 min-h-[180px] bg-white rounded-2xl border border-dashed border-gray-200">
                <Link
                  href="/campaigns"
                  className="flex flex-col items-center gap-2 text-gray-400 hover:text-(--bpa-green) transition-colors text-center px-4"
                >
                  <MapPin size={20} />
                  <span className="text-xs font-medium">Browse all campaigns →</span>
                </Link>
              </div>
            )}

            {/* View all CTA on mobile */}
            <Link
              href="/campaigns"
              className="md:hidden mt-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-(--bpa-navy) hover:text-(--bpa-green) transition-colors py-3 bg-white rounded-xl border border-gray-100 hover:border-(--bpa-green)/30"
            >
              View all campaigns <ArrowRight size={14} />
            </Link>
          </div>
        </div>

          {/* Mobile "all" link — below grid */}
          <div className="mt-6 text-center hidden">
            <Link href="/campaigns" className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--bpa-navy) hover:text-(--bpa-green) transition-colors">
              View all campaigns <ArrowRight size={14} />
            </Link>
          </div>
          </>
        )}
      </div>
    </section>
  );
}
