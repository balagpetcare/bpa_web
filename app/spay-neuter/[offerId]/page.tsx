import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/ui/Breadcrumb';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import SpayOfferJsonLd from '@/components/seo/SpayOfferJsonLd';
import ServiceComparisonCards from '@/components/spay-neuter/ServiceComparisonCards';
import BookingSummaryCard from '@/components/spay-neuter/BookingSummaryCard';
import InstructionAccordion from '@/components/spay-neuter/InstructionAccordion';
import ParticipatingClinics from '@/components/spay-neuter/ParticipatingClinics';
import SpayOfferStickyBar from '@/components/spay-neuter/SpayOfferStickyBar';
import SpayOfferGallery from '@/components/spay-neuter/SpayOfferGallery';
import SpayOfferVideos from '@/components/spay-neuter/SpayOfferVideos';
import { getPublicSpayOffer, getPublicSpayOffers } from '@/lib/api/spay-neuter';
import { getSeoData } from '@/lib/api/seo';
import { resolveMediaUrl } from '@/lib/utils/media-url';
import { buildBookingHref, getLifecycleBadge } from '@/lib/spay-neuter/offer-detail';
import { buildMetadata } from '@/lib/seo';
import {
  CalendarDays,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Stethoscope,
  Info,
  Ban,
  ClipboardList,
  HeartPulse,
  Undo2,
  CheckCircle,
  PawPrint,
} from 'lucide-react';

export const revalidate = 60;
export const dynamicParams = true;

interface PageProps { params: Promise<{ offerId: string }> }

export async function generateStaticParams() {
  try {
    const offers = await getPublicSpayOffers();
    return offers.map((o) => ({ offerId: o.id }));
  } catch {
    return [];
  }
}

function fmtDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { offerId } = await params;
  try {
    const [offer, seo] = await Promise.all([
      getPublicSpayOffer(offerId, { next: { revalidate: 60 } }),
      getSeoData(`/spay-neuter/${offerId}`),
    ]);
    const ogImage = resolveMediaUrl(offer.webImage?.url) ?? undefined;
    return buildMetadata(
      {
        title: `${offer.title} | BPA Spay & Neuter`,
        description: offer.summary ?? `Book a spay or neuter appointment for your cat with ${offer.title} — verified participating clinics, advance booking online.`,
        ogImage: (offer.galleryImages?.[0]?.url ? resolveMediaUrl(offer.galleryImages[0].url) : ogImage) ?? undefined,
        canonical: `/spay-neuter/${offerId}`,
      },
      seo,
    );
  } catch {
    return {};
  }
}

export default async function SpayOfferDetailPage({ params }: PageProps) {
  const { offerId } = await params;
  let offer;
  try {
    offer = await getPublicSpayOffer(offerId, { next: { revalidate: 60, tags: [`spay-offer-${offerId}`] } });
  } catch {
    notFound();
  }
  if (!offer) notFound();

  const badge = getLifecycleBadge(offer.lifecycleState);
  const heroImageUrl = resolveMediaUrl(offer.webImage?.url);
  const hasInstructions = Boolean(
    offer.eligibilityText || offer.fastingRules || offer.medicalInstructions || offer.cancellationPolicy,
  );

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Spay & Neuter', url: '/spay-neuter' }, { name: offer.title, url: `/spay-neuter/${offer.id}` }]} />
      <SpayOfferJsonLd offer={offer} imageUrl={heroImageUrl} />

      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-(--bpa-navy) text-white">
        {heroImageUrl ? (
          <>
            <div className="absolute inset-0 -z-20">
              <Image src={heroImageUrl} alt={offer.webImage?.altText ?? offer.title} fill priority sizes="100vw" className="object-cover" />
            </div>
            {/* Overlays for readability matching campaign page */}
            <div className="absolute inset-0 bg-slate-950/60 -z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-950/25 -z-10" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950/80 to-transparent -z-10" />
          </>
        ) : (
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-(--bpa-navy) to-slate-800" />
        )}

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8 lg:py-28 min-h-[460px] flex items-center">
          <div className="max-w-3xl">
            <div className="mb-6 [&_a]:text-white/70 [&_a:hover]:text-white">
              <Breadcrumb items={[{ label: 'Spay & Neuter', href: '/spay-neuter' }, { label: offer.title }]} />
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full border shadow-sm ${badge.className}`}>
                {badge.label}
              </span>
              <span className="text-xs font-semibold bg-white/10 text-white/90 px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/15">
                Spay & Neuter
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">{offer.title}</h1>
            {offer.summary && <p className="mt-3 text-lg md:text-xl text-white/80 max-w-2xl mb-8 leading-relaxed">{offer.summary}</p>}

            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm md:text-base text-white/80">
              {(offer.startsAt || offer.endsAt) && (
                <span className="flex items-center gap-2">
                  <CalendarDays size={18} className="text-white/40" />
                  {fmtDate(offer.startsAt)} – {fmtDate(offer.endsAt)}
                </span>
              )}
              <span className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-white/40" /> Verified participating clinics
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle size={18} className="text-white/40" /> Advance booking online
              </span>
            </div>

            {offer.bookable && (
              <div className="mt-10 lg:hidden">
                <Link
                  href={buildBookingHref(offer.id)}
                  className="inline-flex items-center justify-center bg-(--bpa-green) text-white font-bold px-8 py-4 rounded-xl hover:bg-(--color-bpa-green-dark) transition-colors active:scale-95 shadow-xl"
                >
                  Book Appointment
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Main content ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 pb-28 lg:pb-16">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-12">
            
            {offer.galleryImages && offer.galleryImages.length > 0 && (
              <SpayOfferGallery items={offer.galleryImages} title={offer.title} />
            )}

            {offer.description && (
              <section aria-labelledby="about-heading">
                <h2 id="about-heading" className="text-xl font-bold text-(--bpa-navy) mb-3 flex items-center gap-2">
                  <Info size={18} className="text-(--bpa-green)" /> About This Offer
                </h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{offer.description}</p>
              </section>
            )}

            <section aria-labelledby="services-heading">
              <h2 id="services-heading" className="text-xl font-bold text-(--bpa-navy) mb-1 flex items-center gap-2">
                <Stethoscope size={18} className="text-(--bpa-green)" /> Choose a Service
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Spay and neuter are separate procedures for a single pet — choose the one that matches your cat.
              </p>
              <ServiceComparisonCards offerId={offer.id} serviceChoices={offer.serviceChoices} bookable={offer.bookable} />
            </section>

            {hasInstructions && (
              <section aria-labelledby="instructions-heading">
                <h2 id="instructions-heading" className="text-xl font-bold text-(--bpa-navy) mb-3 flex items-center gap-2">
                  <ClipboardList size={18} className="text-(--bpa-green)" /> Eligibility &amp; Instructions
                </h2>
                <div className="space-y-3">
                  {offer.eligibilityText && (
                    <InstructionAccordion title="Eligibility" icon={<PawPrint size={15} className="text-(--bpa-green)" />} defaultOpen>
                      {offer.eligibilityText}
                    </InstructionAccordion>
                  )}
                  {offer.fastingRules && (
                    <InstructionAccordion title="Fasting rules" icon={<Ban size={15} className="text-(--bpa-green)" />} defaultOpen>
                      {offer.fastingRules}
                    </InstructionAccordion>
                  )}
                  {offer.medicalInstructions && (
                    <InstructionAccordion title="Post-operative &amp; medical instructions" icon={<HeartPulse size={15} className="text-(--bpa-green)" />}>
                      {offer.medicalInstructions}
                    </InstructionAccordion>
                  )}
                  {offer.cancellationPolicy && (
                    <InstructionAccordion title="Cancellation policy" icon={<Info size={15} className="text-(--bpa-green)" />}>
                      {offer.cancellationPolicy}
                    </InstructionAccordion>
                  )}
                  <InstructionAccordion title="Refund policy — medically unfit pets" icon={<Undo2 size={15} className="text-(--bpa-green)" />}>
                    {offer.medicallyUnfitRefundable
                      ? 'If a veterinarian determines your pet is not medically fit for surgery on the day of the appointment, the online advance is refunded.'
                      : 'If a veterinarian determines your pet is not medically fit for surgery on the day of the appointment, the online advance is not refunded for this offer.'}
                  </InstructionAccordion>
                </div>
              </section>
            )}

            <section aria-labelledby="clinics-heading">
              <h2 id="clinics-heading" className="text-xl font-bold text-(--bpa-navy) mb-3 flex items-center gap-2">
                <MapPin size={18} className="text-(--bpa-green)" /> Participating Clinics
              </h2>
              <ParticipatingClinics offerId={offer.id} clinics={offer.clinics} bookable={offer.bookable} />
            </section>

            {offer.videos && offer.videos.length > 0 && (
              <SpayOfferVideos offerId={offer.id} videos={offer.videos} />
            )}
          </div>

          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">
              <BookingSummaryCard
                offerId={offer.id}
                serviceChoices={offer.serviceChoices}
                bookable={offer.bookable}
                lifecycleState={offer.lifecycleState}
              />

              {(offer.contactName || offer.contactPhone || offer.contactEmail) && (
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <h3 className="font-bold text-(--bpa-navy) text-sm mb-3">Contact</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    {offer.contactName && (
                      <p className="flex items-center gap-2">
                        <CheckCircle size={13} className="text-(--bpa-green)" />
                        {offer.contactName}
                      </p>
                    )}
                    {offer.contactPhone && (
                      <a href={`tel:${offer.contactPhone.replace(/\s/g, '')}`} className="flex items-center gap-2 hover:text-(--bpa-green) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--bpa-green) rounded">
                        <Phone size={13} className="text-(--bpa-green)" />
                        {offer.contactPhone}
                      </a>
                    )}
                    {offer.contactEmail && (
                      <a href={`mailto:${offer.contactEmail}`} className="flex items-center gap-2 hover:text-(--bpa-green) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--bpa-green) rounded">
                        <Mail size={13} className="text-(--bpa-green)" />
                        {offer.contactEmail}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        <div className="pt-8 mt-8 border-t border-gray-100">
          <Link href="/spay-neuter" className="text-sm text-(--bpa-green) hover:underline">
            ← Back to Spay &amp; Neuter Campaigns
          </Link>
        </div>
      </div>

      <SpayOfferStickyBar
        offerId={offer.id}
        serviceChoices={offer.serviceChoices}
        bookable={offer.bookable}
        lifecycleState={offer.lifecycleState}
      />
    </>
  );
}
