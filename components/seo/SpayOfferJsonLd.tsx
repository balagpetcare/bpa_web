import JsonLd from './JsonLd';
import { BASE_URL } from '@/lib/seo';
import type { SpayOfferPublic } from '@/lib/api/spay-neuter';

interface SpayOfferJsonLdProps {
  offer: SpayOfferPublic;
  imageUrl: string | null;
}

/** Mirrors CampaignJsonLd's Event+Offer schema.org convention exactly — a spay/neuter campaign is the same shape (a scheduled service campaign with per-service pricing), so it reuses the same structured-data pattern rather than inventing a new one. */
export default function SpayOfferJsonLd({ offer, imageUrl }: SpayOfferJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: offer.title,
    description: offer.summary ?? offer.description ?? undefined,
    startDate: offer.startsAt ?? undefined,
    endDate: offer.endsAt ?? undefined,
    url: `${BASE_URL}/spay-neuter/${offer.id}`,
    image: imageUrl ?? undefined,
    organizer: {
      '@type': 'Organization',
      name: 'Bangladesh Pet Association',
      url: BASE_URL,
    },
    offers: offer.serviceChoices.map((choice) => ({
      '@type': 'Offer',
      name: choice.displayName,
      price: String(choice.totalAmount),
      priceCurrency: 'BDT',
      availability: choice.enabled && offer.bookable ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
    })),
    eventStatus: offer.lifecycleState === 'expired' ? 'https://schema.org/EventPostponed' : 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  };

  return <JsonLd data={schema} />;
}
