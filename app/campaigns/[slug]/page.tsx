import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/ui/Breadcrumb';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import CountdownTimer from '@/components/campaigns/CountdownTimer';
import CampaignStickyBar from '@/components/campaigns/CampaignStickyBar';
import CampaignJsonLd from '@/components/campaigns/CampaignJsonLd';
import CampaignGallery from '@/components/campaigns/CampaignGallery';
import CoverageSummary from '@/components/campaigns/CoverageSummary';
import SessionsExplorer from '@/components/campaigns/SessionsExplorer';
import { getCampaignBySlug, getCampaignsList, getCampaignFaqs, getCampaignCoverage } from '@/lib/api/campaigns';
import {
  CalendarDays, MapPin, Users, Syringe, Clock, BanknoteIcon,
  ArrowLeft, CheckCircle, AlertCircle, Info, ChevronDown,
  Activity, ShieldCheck, CreditCard, FlaskConical,
  Target, TrendingUp,
} from 'lucide-react';
import type { CampaignStatus, CampaignType, CampaignService, CampaignMedia, CampaignFaq, CampaignCoverageSummary } from '@/types/bpa.types';
import { formatMoney, toDisplayString, getCampaignMediaUrl, getCampaignRoleUrl } from '@/lib/utils/format';

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const { items } = await getCampaignsList({ limit: 100 });
    return items.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

interface PageProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    // Metadata only needs title/description/media — never the sessions array.
    const campaign = await getCampaignBySlug(slug, undefined, { next: { revalidate: 60 } }, false);
    if (!campaign) return {};
    const desc = campaign.description ?? `Register your pets for ${campaign.title} by Bangladesh Pet Association.`;
    const heroImg = getCampaignMediaUrl(campaign, 'hero');
    return {
      title: `${campaign.title} | BPA Vaccination Campaigns`,
      description: desc,
      openGraph: {
        title: campaign.title,
        description: desc,
        url: `/campaigns/${slug}`,
        type: 'website',
        images: heroImg ? [{ url: heroImg, alt: campaign.title }] : [],
        siteName: 'Bangladesh Pet Association',
      },
      twitter: {
        card: 'summary_large_image',
        title: campaign.title,
        description: desc,
        images: heroImg ? [heroImg] : [],
      },
    };
  } catch { return {}; }
}


// ─── Utilities ──────────────────────────────────────────────────────────────

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
function fmtDateShort(s: string) {
  return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtDateMobile(s: string) {
  return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const TYPE_LABELS: Record<CampaignType, string> = {
  vaccination: 'Vaccination Campaign',
  deworming: 'Deworming Campaign',
  microchip: 'Microchipping Campaign',
  health_camp: 'Health Camp',
  spay_neuter: 'Spay & Neuter Campaign',
};

const STATUS_INFO: Record<CampaignStatus, { label: string; color: string; dot: string }> = {
  published:            { label: 'Coming Soon',          color: 'text-blue-700 bg-blue-50 border-blue-200',     dot: 'bg-blue-400' },
  registration_open:    { label: 'Registration Open',    color: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  registration_closed:  { label: 'Registration Closed',  color: 'text-orange-700 bg-orange-50 border-orange-200',   dot: 'bg-orange-400' },
  completed:            { label: 'Completed',            color: 'text-gray-600 bg-gray-100 border-gray-200',     dot: 'bg-gray-400' },
  draft:                { label: 'Draft',                color: 'text-gray-500 bg-gray-50 border-gray-200',      dot: 'bg-gray-300' },
  cancelled:            { label: 'Cancelled',            color: 'text-red-700 bg-red-50 border-red-200',         dot: 'bg-red-400' },
};

// ─── Sub-components ─────────────────────────────────────────────────────────

function SectionHeading({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="text-2xl font-bold text-(--bpa-navy) mb-6 flex items-center gap-2">
      {children}
    </h2>
  );
}

function StatPill({ label, value, color = 'green' }: { label: string; value: string | number; color?: 'green' | 'navy' | 'amber' | 'red' }) {
  const cls = {
    green: 'bg-(--bpa-green-light) text-(--bpa-green)',
    navy:  'bg-blue-50 text-(--bpa-navy)',
    amber: 'bg-amber-50 text-amber-700',
    red:   'bg-red-50 text-red-700',
  }[color];
  return (
    <div className={`rounded-xl p-4 text-center ${cls}`}>
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-xs font-semibold mt-1 opacity-70 uppercase tracking-wide">{label}</p>
    </div>
  );
}

function SessionsExplorerSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading sessions">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 animate-pulse">
          <div className="h-4 w-1/3 bg-gray-200 rounded mb-3" />
          <div className="h-3 w-1/2 bg-gray-100 rounded mb-4" />
          <div className="h-8 w-full bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );
}

function CapacityBar({ booked, total, label }: { booked: number; total: number; label: string }) {
  const pct = total > 0 ? Math.min(100, Math.round((booked / total) * 100)) : 0;
  const available = total - booked;
  const color = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-(--bpa-green)';
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
        <span className="font-medium text-(--bpa-navy)">{label}</span>
        <span className={pct >= 100 ? 'text-red-600 font-bold' : pct >= 80 ? 'text-amber-600 font-semibold' : 'text-emerald-600 font-semibold'}>
          {pct >= 100 ? 'Full' : `${available} left (${100 - pct}%)`}
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-gray-400 mt-1">{booked.toLocaleString()} of {total.toLocaleString()} booked</p>
    </div>
  );
}


function VaccineCard({ service }: { service: CampaignService }) {
  const vc = service.vaccineCatalog;
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-(--bpa-green)/30 hover:shadow-sm transition-all">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-(--bpa-green-light) flex items-center justify-center shrink-0">
          <Syringe size={18} className="text-(--bpa-green)" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4 className="font-bold text-(--bpa-navy) text-sm">{service.name}</h4>
            {service.isRequired && (
              <span className="text-[10px] font-bold bg-(--bpa-green-light) text-(--bpa-green) px-2 py-0.5 rounded-full">Included</span>
            )}
            {service.priceBdt != null && service.priceBdt > 0 && (
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full ml-auto">
                {formatMoney(service.priceBdt)}
              </span>
            )}
          </div>
          {service.description && (
            <p className="text-xs text-gray-500 mb-2">{service.description}</p>
          )}
          {vc && (
            <div className="flex flex-wrap gap-2 mt-2">
              {vc.species && vc.species !== 'all' && (
                <span className="inline-flex items-center gap-1 text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  <ShieldCheck size={9} /> {vc.species}
                </span>
              )}
              {vc.manufacturer && (
                <span className="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                  <FlaskConical size={9} /> {vc.manufacturer}
                </span>
              )}
              {vc.standardIntervalDays && (
                <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                  <Clock size={9} /> Next dose: {vc.standardIntervalDays}d
                </span>
              )}
            </div>
          )}
          {vc?.description && (
            <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">{vc.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default async function CampaignDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let campaign: Awaited<ReturnType<typeof getCampaignBySlug>>;
  let campaignFaqs: CampaignFaq[] = [];
  // Coverage summary is a compact aggregate, not a full session dump — safe
  // to fetch alongside the campaign detail. Missing/failed coverage data
  // must never break the page, so it degrades to null on failure.
  let coverageSummary: CampaignCoverageSummary | null = null;

  try {
    // includeSessions=false: the main page only ever needs metadata + the
    // small `sessionStats` aggregate below, never the raw sessions array —
    // that would mean downloading hundreds of session rows just to render
    // a title, hero, pricing and an FAQ list.
    [campaign, campaignFaqs, coverageSummary] = await Promise.all([
      getCampaignBySlug(slug, undefined, { next: { revalidate: 60, tags: [`campaign-${slug}`] } }, false),
      getCampaignFaqs(slug, { next: { revalidate: 60 } }),
      getCampaignCoverage(slug, { next: { revalidate: 60, tags: [`campaign-${slug}`] } }).catch(() => null),
    ]);
  } catch {
    notFound();
  }
  if (!campaign) notFound();

  const statusInfo = STATUS_INFO[campaign.status] ?? STATUS_INFO.published;
  const canRegister = campaign.status === 'registration_open';
  const campaignFeeBdt = Number(campaign.basePriceBdt ?? 0);
  const isFree = campaignFeeBdt === 0;
  const now = new Date();

  // Pricing summary from service prices
  const servicesTotalBdt = campaign.services.reduce((sum, s) => sum + (s.priceBdt ?? 0), 0);
  const discountAmountBdt = servicesTotalBdt - campaignFeeBdt;
  const discountPercent = servicesTotalBdt > 0 && discountAmountBdt > 0
    ? Math.round((discountAmountBdt / servicesTotalBdt) * 100)
    : 0;
  const hasPricingDiscount = servicesTotalBdt > 0 && discountAmountBdt > 0;

  // ── Computed stats ──────────────────────────────────────────────────
  // Sourced entirely from the backend-computed `sessionStats` aggregate
  // (see getCampaignSessionStats) — `campaign.sessions` is intentionally
  // `[]` on this page (includeSessions=false above), so none of this ever
  // scales with the campaign's actual session count.
  const stats = campaign.sessionStats;
  const totalCapacity  = stats?.totalCapacity ?? 0;
  const totalBooked    = stats?.totalBooked ?? 0;
  const totalAvailable = stats?.totalAvailable ?? 0;
  const venueCount     = stats?.venueCount ?? 0;
  const sessionCount   = stats?.sessionCount ?? 0;

  const nextSessionLabel = stats?.nextSession
    ? `${fmtDateMobile(stats.nextSession.sessionDate)} · ${stats.nextSession.venueName ?? ''}`
    : null;

  // ── Per-day capacity breakdown (already bounded + bucketed server-side —
  // see MAX_DAY_BREAKDOWN_ROWS in getCampaignSessionStats) ────────────
  const capacityDayBars = stats?.dayBreakdown ?? [];
  const hiddenCapacityDayCount = stats?.hasMoreDays ? 1 : 0; // exact hidden count isn't tracked server-side; only used to show/hide the "+more" note

  // ── Key dates timeline ────────────────────────────────────────────
  const keyDates = [
    campaign.registrationOpenAt  && { label: 'Registration Opens',  date: campaign.registrationOpenAt,  done: new Date(campaign.registrationOpenAt) <= now },
    campaign.registrationCloseAt && { label: 'Registration Closes', date: campaign.registrationCloseAt, done: new Date(campaign.registrationCloseAt) <= now },
    { label: 'Campaign Starts', date: campaign.startDate, done: new Date(campaign.startDate) <= now },
    { label: 'Campaign Ends',   date: campaign.endDate,   done: new Date(campaign.endDate) <= now },
  ].filter(Boolean) as Array<{ label: string; date: string; done: boolean }>;

  // ── Media by role ─────────────────────────────────────────────────
  const galleryMedia  = (campaign.media ?? []).filter((m: CampaignMedia) => m.role === 'gallery').sort((a: CampaignMedia, b: CampaignMedia) => a.sortOrder - b.sortOrder);

  // Banner: media-array-only — no coverImage fallback so blank box never renders
  const heroBannerUrl   = getCampaignRoleUrl(campaign, 'hero')
    || getCampaignRoleUrl(campaign, 'thumbnail')
    || getCampaignRoleUrl(campaign, 'mobile_banner');
  const heroBannerAlt   = campaign.title;
  const mobileBannerUrl = getCampaignRoleUrl(campaign, 'mobile_banner');
  // SEO: can use coverImage as fallback
  const seoImageUrl     = getCampaignMediaUrl(campaign, 'thumbnail');

  // ── Venue list for JSON-LD ────────────────────────────────────────
  // Sourced from the already-fetched coverage summary (a small, bounded
  // venue list) rather than deduping the sessions array — this page never
  // downloads the raw sessions collection in the first place.
  const venuesForSchema = (coverageSummary?.breakdown ?? [])
    .flatMap((division) => division.districts)
    .flatMap((district) => district.venues)
    .map((venue) => ({ name: venue.name, address: venue.address ?? null }));

  return (
    <>
      {/* JSON-LD */}
      <CampaignJsonLd
        title={campaign.title}
        description={campaign.description}
        startDate={campaign.startDate}
        endDate={campaign.endDate}
        slug={slug}
        coverImageUrl={seoImageUrl}
        isFree={isFree}
        basePriceBdt={toDisplayString(campaign.basePriceBdt)}
        venues={venuesForSchema}
      />
      <BreadcrumbJsonLd items={[{ name: 'Campaigns', url: '/campaigns' }, { name: campaign.title, url: `/campaigns/${slug}` }]} />

      {/* ─── FULL BACKGROUND CAMPAIGN HERO ─────────────────────── */}
      <section className="relative isolate overflow-hidden bg-(--bpa-navy) text-white">
        {/* Background Image */}
        {heroBannerUrl && (
          <picture className="absolute inset-0 -z-20">
            {mobileBannerUrl && <source media="(max-width: 767px)" srcSet={mobileBannerUrl} />}
            <img
              src={heroBannerUrl}
              alt={campaign.title}
              className="h-full w-full object-cover"
            />
          </picture>
        )}

        {/* Overlays for readability */}
        <div className="absolute inset-0 bg-slate-950/60 -z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-950/25 -z-10" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950/80 to-transparent -z-10" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8 lg:py-28 min-h-[560px] md:min-h-[620px] flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 items-center w-full">
            {/* Left side: Info */}
            <div className="max-w-3xl">
              {/* Breadcrumb */}
              <div className="mb-6 [&_a]:text-white/70 [&_a:hover]:text-white">
                <Breadcrumb items={[{ label: 'Campaigns', href: '/campaigns' }, { label: campaign.title }]} />
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full border shadow-sm ${statusInfo.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot} animate-pulse`} />
                  {statusInfo.label}
                </span>
                <span className="text-xs font-semibold bg-white/10 text-white/90 px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/15">
                  {TYPE_LABELS[campaign.campaignType] ?? campaign.campaignType}
                </span>
                {isFree && (
                  <span className="text-xs font-bold bg-amber-400 text-amber-950 px-3.5 py-1.5 rounded-full shadow-sm">Free</span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                {campaign.title}
              </h1>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm md:text-base text-white/80">
                <span className="flex items-center gap-2">
                  <CalendarDays size={18} className="text-white/40" />
                  {fmtDateShort(campaign.startDate)} – {fmtDateShort(campaign.endDate)}
                </span>
                {venueCount > 0 && (
                  <span className="flex items-center gap-2">
                    <MapPin size={18} className="text-white/40" />
                    {venueCount} venue{venueCount !== 1 ? 's' : ''}
                  </span>
                )}
                {totalCapacity > 0 && (
                  <span className="flex items-center gap-2">
                    <Users size={18} className="text-white/40" />
                    {totalAvailable > 0 ? `${totalAvailable.toLocaleString()} slots left` : 'Fully booked'}
                  </span>
                )}
              </div>
            </div>

            {/* Right side: Price & CTA Card */}
            <div className="lg:block">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
                <div className="mb-6">
                  <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Registration fee</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-white font-extrabold text-4xl">{isFree ? 'Free' : formatMoney(campaignFeeBdt)}</p>
                    {!isFree && <p className="text-white/50 text-sm font-medium">/ pet</p>}
                  </div>
                  {hasPricingDiscount && (
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-white/50 line-through">{formatMoney(servicesTotalBdt)}</span>
                      <span className="text-xs font-bold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full">{discountPercent}% OFF</span>
                    </div>
                  )}
                </div>

                {canRegister && totalAvailable > 0 ? (
                  <Link href={`/campaigns/${slug}/register`}
                    className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all active:scale-[0.98]">
                    Book Now
                  </Link>
                ) : canRegister && totalAvailable === 0 ? (
                  <Link href={`/campaigns/${slug}/waitlist`}
                    className="mt-5 inline-flex w-full items-center justify-center rounded-xl border-2 border-white/30 bg-white/5 px-6 py-4 font-bold text-white hover:bg-white/10 transition-all">
                    Join Waitlist
                  </Link>
                ) : (
                  <div className="w-full text-center py-4 bg-white/5 rounded-xl border border-white/10 text-white/50 font-bold text-sm">
                    Registration {campaign.status.replace('_', ' ')}
                  </div>
                )}

                {totalAvailable > 0 && totalAvailable <= 50 && (
                  <p className="mt-4 text-center text-xs font-bold text-amber-400 animate-pulse">
                    Hurry! Only {totalAvailable} slots remaining
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MAIN CONTENT + SIDEBAR ──────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid lg:grid-cols-3 gap-10">

          {/* ── MAIN COLUMN ─────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-14">

            {/* ─── SECTION 1: OVERVIEW ─────────────────────────── */}
            {campaign.description && (
              <section id="overview">
                <SectionHeading><Info size={20} className="text-(--bpa-green)" />About This Campaign</SectionHeading>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line text-[15px]">{campaign.description}</p>

                {/* Meta grid */}
                <dl className="grid sm:grid-cols-2 gap-4 mt-8">
                  {[
                    { icon: <CalendarDays size={16} />, label: 'Campaign Period', value: `${fmtDateShort(campaign.startDate)} – ${fmtDateShort(campaign.endDate)}` },
                    { icon: <BanknoteIcon size={16} />, label: 'Fee Per Pet', value: isFree ? 'Free' : formatMoney(campaignFeeBdt) },
                    { icon: <Users size={16} />, label: 'Max Pets / Booking', value: `${campaign.maxPetsPerBooking} pets` },
                    { icon: <Syringe size={16} />, label: 'Services Included', value: `${campaign.services.length} vaccine service${campaign.services.length !== 1 ? 's' : ''}` },
                    { icon: <MapPin size={16} />, label: 'Venues', value: `${venueCount} location${venueCount !== 1 ? 's' : ''}` },
                    { icon: <Activity size={16} />, label: 'Total Sessions', value: `${sessionCount} session${sessionCount !== 1 ? 's' : ''}` },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="text-(--bpa-green) mt-0.5">{icon}</div>
                      <div>
                        <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</dt>
                        <dd className="text-sm font-semibold text-(--bpa-navy) mt-0.5">{value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {/* ─── SECTION 2: STATISTICS ───────────────────────── */}
            {totalCapacity > 0 && (
              <section id="capacity">
                <SectionHeading><TrendingUp size={20} className="text-(--bpa-green)" />Capacity & Availability</SectionHeading>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  <StatPill label="Total Capacity"  value={totalCapacity.toLocaleString()}  color="navy" />
                  <StatPill label="Booked"          value={totalBooked.toLocaleString()}     color="amber" />
                  <StatPill label="Available"       value={totalAvailable.toLocaleString()}  color={totalAvailable === 0 ? 'red' : 'green'} />
                  <StatPill label="Venues"          value={venueCount}                       color="navy" />
                </div>

                <div className="space-y-5 bg-white rounded-2xl border border-gray-200 p-6">
                  <CapacityBar booked={totalBooked} total={totalCapacity} label="Overall Campaign Capacity" />
                  {capacityDayBars.map(day => (
                    <CapacityBar
                      key={day.date}
                      booked={day.bookedCount}
                      total={day.capacity}
                      label={new Date(day.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                    />
                  ))}
                  {hiddenCapacityDayCount > 0 && (
                    <p className="text-xs text-gray-400 text-center">More dates available — see Sessions & Venues below for the full schedule</p>
                  )}
                </div>
              </section>
            )}

            {/* ─── SECTION 3: VACCINES INCLUDED ────────────────── */}
            {campaign.services.length > 0 && (
              <section id="vaccines">
                <SectionHeading><Syringe size={20} className="text-(--bpa-green)" />Vaccines & Services Included</SectionHeading>
                <div className="grid sm:grid-cols-2 gap-4">
                  {campaign.services.map(svc => (
                    <VaccineCard key={svc.id} service={svc} />
                  ))}
                </div>
              </section>
            )}

            {/* ─── SECTION 4: COVERAGE AREAS ───────────────────── */}
            <CoverageSummary campaignTitle={campaign.title} summary={coverageSummary} />

            {/* ─── SECTION 5: SESSIONS ─────────────────────────── */}
            <Suspense fallback={<SessionsExplorerSkeleton />}>
              <SessionsExplorer campaignSlug={slug} />
            </Suspense>

            {/* ─── SECTION 6: REGISTRATION INFORMATION ─────────── */}
            <section id="registration-info">
              <SectionHeading><CheckCircle size={20} className="text-(--bpa-green)" />Registration Information</SectionHeading>
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  {campaign.registrationOpenAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <Clock size={14} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Registration Opens</p>
                        <p className="text-sm font-semibold text-(--bpa-navy)">{fmtDate(campaign.registrationOpenAt)}</p>
                      </div>
                    </div>
                  )}
                  {campaign.registrationCloseAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                        <AlertCircle size={14} className="text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Registration Closes</p>
                        <p className="text-sm font-semibold text-(--bpa-navy)">{fmtDate(campaign.registrationCloseAt)}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-5">
                  <h4 className="font-bold text-(--bpa-navy) text-sm mb-4">How to Register</h4>
                  <ol className="space-y-3">
                    {[
                      'Select your preferred session date and venue',
                      'Enter your name and mobile number (no account needed)',
                      'Add your pet(s) with basic details',
                      'Review your booking and confirm',
                      `${isFree ? 'Receive instant confirmation' : 'Complete online payment to confirm your booking'}`,
                      'Get QR code — show it at the venue on campaign day',
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                        <span className="w-5 h-5 rounded-full bg-(--bpa-green) text-white text-xs flex items-center justify-center shrink-0 font-bold mt-0.5">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="border-t border-gray-100 pt-5">
                  <h4 className="font-bold text-(--bpa-navy) text-sm mb-3">What to Bring</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {[
                      'Your booking confirmation / QR code',
                      'Your pet(s) — in a carrier or on a leash',
                      'Previous vaccination records (if any)',
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle size={13} className="text-(--bpa-green) shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* ─── SECTION 7: GALLERY ──────────────────────────── */}
            {galleryMedia.length > 0 && (
              <CampaignGallery items={galleryMedia} title={campaign.title} />
            )}

            {/* ─── SECTION 8: FAQ ──────────────────────────────── */}
            {campaignFaqs.length > 0 && (
              <section id="faq">
                <SectionHeading><Info size={20} className="text-(--bpa-green)" />Frequently Asked Questions</SectionHeading>
                <div className="space-y-2">
                  {campaignFaqs.map((faq) => (
                    <details key={faq.id} className="group border border-gray-200 rounded-xl overflow-hidden bg-white">
                      <summary className="flex items-center justify-between gap-3 p-4 cursor-pointer list-none font-semibold text-sm text-(--bpa-navy) hover:bg-gray-50 transition-colors">
                        {faq.questionBn || faq.questionEn}
                        <ChevronDown size={16} className="text-gray-400 shrink-0 group-open:rotate-180 transition-transform" />
                      </summary>
                      <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                        {faq.answerBn || faq.answerEn}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* ─── SECTION 8: T&C ──────────────────────────────── */}
            {campaign.termsAndConditions && (
              <section id="terms">
                <SectionHeading><ShieldCheck size={20} className="text-(--bpa-green)" />Terms & Conditions</SectionHeading>
                <div className="bg-gray-50 rounded-2xl p-6 text-sm text-gray-600 leading-relaxed whitespace-pre-line border border-gray-100">
                  {campaign.termsAndConditions}
                </div>
              </section>
            )}

            <div className="pt-4 border-t border-gray-100">
              <Link href="/campaigns" className="inline-flex items-center gap-2 text-sm font-medium text-(--bpa-green) hover:underline">
                <ArrowLeft size={16} /> Back to All Campaigns
              </Link>
            </div>
          </div>

          {/* ── SIDEBAR ─────────────────────────────────────────── */}
          <aside className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">

              {/* ── REGISTRATION CTA CARD ─────────────────────── */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-(--bpa-navy) px-6 py-4">
                  <p className="text-white/60 text-xs font-medium mb-1">Registration Fee</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-white font-extrabold text-3xl">
                      {isFree ? 'Free' : formatMoney(campaignFeeBdt)}
                    </p>
                    {!isFree && <p className="text-white/50 text-xs">/ pet</p>}
                  </div>
                  {hasPricingDiscount && (
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-white/40 line-through">{formatMoney(servicesTotalBdt)}</span>
                      <span className="text-xs font-bold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full">{discountPercent}% OFF</span>
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-3">
                  {/* Savings callout */}
                  {hasPricingDiscount && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-center">
                      <p className="text-xs font-semibold text-amber-800">
                        You save <span className="font-extrabold">{formatMoney(discountAmountBdt)}</span> per pet
                      </p>
                      <p className="text-[10px] text-amber-600 mt-0.5">
                        Services worth {formatMoney(servicesTotalBdt)} included
                      </p>
                    </div>
                  )}
                  {/* Status */}
                  <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border w-full justify-center ${statusInfo.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                    {statusInfo.label}
                  </div>

                  {/* Availability pill */}
                  {totalCapacity > 0 && (
                    <div className="text-center text-xs text-gray-500">
                      <span className={`font-bold ${totalAvailable === 0 ? 'text-red-600' : totalAvailable <= 20 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {totalAvailable === 0 ? 'Fully Booked' : `${totalAvailable} slots remaining`}
                      </span>
                      {' '}out of {totalCapacity}
                    </div>
                  )}

                  {/* Next session */}
                  {stats?.nextSession && (
                    <div className="bg-gray-50 rounded-xl p-3 text-xs">
                      <p className="text-gray-400 font-semibold uppercase tracking-wide mb-1">Next Available Session</p>
                      <p className="font-bold text-(--bpa-navy)">{fmtDateShort(stats.nextSession.sessionDate)}</p>
                      <p className="text-gray-500">{stats.nextSession.startTime} – {stats.nextSession.endTime}</p>
                      <p className="text-gray-400">{stats.nextSession.venueName}</p>
                    </div>
                  )}

                  {/* CTA buttons */}
                  {canRegister && totalAvailable > 0 ? (
                    <Link href={`/campaigns/${slug}/register`}
                      className="block w-full text-center bg-(--bpa-green) text-white font-bold text-sm px-4 py-3.5 rounded-xl hover:bg-(--color-bpa-green-dark) transition-colors shadow-sm">
                      Book Now
                    </Link>
                  ) : canRegister && totalAvailable === 0 ? (
                    <Link href={`/campaigns/${slug}/waitlist`}
                      className="block w-full text-center border-2 border-(--bpa-green) text-(--bpa-green) font-bold text-sm px-4 py-3.5 rounded-xl hover:bg-emerald-50 transition-colors">
                      Join Waitlist
                    </Link>
                  ) : campaign.status === 'registration_closed' ? (
                    <Link href={`/campaigns/${slug}/waitlist`}
                      className="block w-full text-center bg-orange-500 text-white font-bold text-sm px-4 py-3.5 rounded-xl hover:bg-orange-600 transition-colors">
                      Join Waitlist
                    </Link>
                  ) : campaign.status === 'published' ? (
                    <div className="w-full text-center bg-gray-100 text-gray-500 font-semibold text-sm px-4 py-3.5 rounded-xl cursor-not-allowed">
                      Registration Not Yet Open
                    </div>
                  ) : null}

                  <Link href="/booking-lookup"
                    className="block w-full text-center border border-gray-200 text-gray-500 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                    Find My Booking
                  </Link>
                </div>
              </div>

              {/* ── COUNTDOWN ─────────────────────────────────── */}
              {campaign.registrationCloseAt && campaign.status === 'registration_open' && (
                <CountdownTimer targetIso={campaign.registrationCloseAt} label="Registration closes in" />
              )}
              {campaign.registrationOpenAt && campaign.status === 'published' && (
                <CountdownTimer targetIso={campaign.registrationOpenAt} label="Registration opens in" />
              )}

              {/* ── PAYMENT METHODS ───────────────────────────── */}
              {!isFree && (
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <h3 className="font-bold text-(--bpa-navy) text-sm mb-3 flex items-center gap-2">
                    <CreditCard size={15} className="text-(--bpa-green)" />
                    Online Payment Acceptable
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Online payment is available for this campaign. Pay securely via card, mobile banking,
                    or internet banking during registration.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-(--bpa-green)">
                    <CheckCircle size={13} />
                    <span className="font-semibold">Secured payment</span>
                  </div>
                </div>
              )}

              {/* ── KEY DATES ─────────────────────────────────── */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-bold text-(--bpa-navy) text-sm mb-4 flex items-center gap-2">
                  <CalendarDays size={15} className="text-(--bpa-green)" />
                  Key Dates
                </h3>
                <ol className="space-y-3">
                  {keyDates.map(({ label, date, done }, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${done ? 'bg-(--bpa-green) text-white' : 'border-2 border-gray-300'}`}>
                        {done && <CheckCircle size={12} />}
                      </div>
                      <div>
                        <p className={`text-xs font-semibold ${done ? 'text-gray-400' : 'text-(--bpa-navy)'}`}>{label}</p>
                        <p className={`text-xs ${done ? 'text-gray-300' : 'text-gray-500'}`}>{fmtDate(date)}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* ── ORGANISER ─────────────────────────────────── */}
              <div className="bg-(--bpa-green-light) rounded-2xl p-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Organised by</p>
                <p className="font-extrabold text-(--bpa-green) text-base">Bangladesh Pet Association</p>
                <p className="text-xs text-gray-500 mt-1">Promoting responsible pet ownership since 2020</p>
                <Link href="/contact" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-(--bpa-green) hover:text-(--bpa-navy) transition-colors">
                  Contact us <Target size={10} />
                </Link>
              </div>

              {/* ── CERT INFO ─────────────────────────────────── */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-bold text-(--bpa-navy) text-sm mb-2 flex items-center gap-2">
                  <ShieldCheck size={15} className="text-(--bpa-green)" />
                  Vaccination Certificate
                </h3>
                <p className="text-xs text-gray-500">
                  After vaccination, each pet receives a digital certificate with QR code verification — valid proof of vaccination.
                </p>
                <Link href="/verify/cert" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-(--bpa-green) hover:underline">
                  Verify a certificate →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ─── MOBILE STICKY CTA ──────────────────────────────────── */}
      <CampaignStickyBar
        slug={slug}
        status={campaign.status}
        isFree={isFree}
        basePriceBdt={toDisplayString(campaign.basePriceBdt)}
        nextSessionDate={nextSessionLabel}
        totalAvailable={totalAvailable}
      />
    </>
  );
}
