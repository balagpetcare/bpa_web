import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Syringe, Scissors, CalendarDays, MapPin } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import { Section, Container } from './Section';
import type { FeaturedCampaign } from '@/lib/api/public-homepage';

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateRange(startIso: string | null, endIso: string | null): string | null {
  const start = formatDate(startIso);
  const end = formatDate(endIso);
  if (start && end && start !== end) return `${start} – ${end}`;
  return start || end;
}

const KIND_META: Record<FeaturedCampaign['kind'], { label: string; icon: typeof Syringe }> = {
  VACCINATION: { label: 'Vaccination Campaign', icon: Syringe },
  SPAY_NEUTER: { label: 'Spay & Neuter', icon: Scissors },
};

function formatPricing(pricing: FeaturedCampaign['pricing']): string | null {
  if (!pricing) return null;
  if (pricing.amountFrom === 0 && pricing.amountTo === 0) return 'Free';
  if (pricing.amountFrom === pricing.amountTo) return `৳${pricing.amountFrom.toLocaleString()}`;
  return `৳${pricing.amountFrom.toLocaleString()} – ৳${pricing.amountTo.toLocaleString()}`;
}

function StatusBadge({ campaign }: { campaign: FeaturedCampaign }) {
  const tone = campaign.isOpenForAction
    ? 'bg-(--bpa-green) text-white'
    : campaign.statusLabel === 'Completed' || campaign.statusLabel === 'Registration Closed'
      ? 'bg-gray-100 text-gray-600'
      : 'bg-blue-100 text-blue-700';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${tone}`}>
      {campaign.isOpenForAction && <span className="ping-dot relative flex h-1.5 w-1.5" aria-hidden="true" />}
      {campaign.statusLabel}
    </span>
  );
}

function CampaignRow({ campaign, imageOnRight }: { campaign: FeaturedCampaign; imageOnRight: boolean }) {
  const { label: kindLabel, icon: Icon } = KIND_META[campaign.kind];
  const dateRange = formatDateRange(campaign.startDate, campaign.endDate);
  const priceLabel = formatPricing(campaign.pricing);
  const locationLabel = campaign.locationSummary.length > 0 ? campaign.locationSummary.join(', ') : null;

  const imageBlock = (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-100 lg:col-span-6">
      {campaign.thumbnailUrl ? (
        <Image
          src={campaign.thumbnailUrl}
          alt={campaign.thumbnailAlt || campaign.title}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-(--bpa-navy)/10 to-(--bpa-green)/10">
          <Icon className="h-16 w-16 text-(--bpa-green)/40" aria-hidden="true" />
        </div>
      )}
    </div>
  );

  const textBlock = (
    <div className="flex flex-col justify-center lg:col-span-6">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-(--bpa-green-light) px-3 py-1 text-xs font-bold uppercase tracking-wide text-(--bpa-green)">
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          {kindLabel}
        </span>
        <StatusBadge campaign={campaign} />
      </div>
      <h3 className="mt-4 text-2xl sm:text-3xl font-bold text-(--bpa-navy)">{campaign.title}</h3>
      {campaign.summary && <p className="mt-3 text-base leading-7 text-gray-500 line-clamp-3">{campaign.summary}</p>}

      <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
        {dateRange && (
          <div className="flex items-center gap-2 text-gray-600">
            <CalendarDays className="h-4 w-4 text-(--bpa-green)" aria-hidden="true" />
            <dt className="sr-only">Dates</dt>
            <dd>{dateRange}</dd>
          </div>
        )}
        {locationLabel && (
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4 text-(--bpa-green)" aria-hidden="true" />
            <dt className="sr-only">Location</dt>
            <dd className="line-clamp-1">{locationLabel}</dd>
          </div>
        )}
        {priceLabel && (
          <div className="flex items-center gap-2 font-semibold text-(--bpa-navy)">
            <dt className="sr-only">Price</dt>
            <dd>{priceLabel}</dd>
          </div>
        )}
      </dl>

      <Link
        href={campaign.ctaHref}
        className="mt-7 inline-flex w-fit items-center gap-2 rounded-lg bg-(--bpa-green) px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-(--color-bpa-button-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--bpa-navy) focus-visible:ring-offset-2"
      >
        {campaign.ctaLabel}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-12">
      {imageOnRight ? (
        <>
          {textBlock}
          {imageBlock}
        </>
      ) : (
        <>
          {imageBlock}
          {textBlock}
        </>
      )}
    </div>
  );
}

interface Props {
  campaigns: FeaturedCampaign[];
}

// Renders vaccination campaigns and Spay & Neuter offers in alternating
// image/text rows using the same FeaturedCampaign shape — both already
// arrive normalized from bpa_api's `/public/homepage` contract, so this
// component never branches on the underlying source model.
export default function ActiveCampaignsSection({ campaigns }: Props) {
  if (campaigns.length === 0) return null;

  return (
    <Section tone="muted" aria-label="Active Care Campaigns">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeader
            eyebrow="Care in progress"
            title="Active Care Campaigns"
            subtitle="Live vaccination drives and Spay & Neuter offers open for registration right now."
          />
          <Link
            href="/campaigns"
            className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-(--bpa-navy) transition-colors hover:text-(--bpa-green) md:inline-flex"
          >
            All campaigns <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-12 flex flex-col gap-14">
          {campaigns.map((campaign, i) => (
            <CampaignRow key={campaign.id} campaign={campaign} imageOnRight={i % 2 === 1} />
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--bpa-navy) hover:text-(--bpa-green)"
          >
            All campaigns <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </Section>
  );
}
