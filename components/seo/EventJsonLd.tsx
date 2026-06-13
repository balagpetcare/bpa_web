import JsonLd from './JsonLd';
import { BASE_URL } from '@/lib/seo';
import type { EventDetail } from '@/types/bpa.types';

interface EventJsonLdProps {
  event: EventDetail;
}

export default function EventJsonLd({ event }: EventJsonLdProps) {
  const eventUrl = `${BASE_URL}/events/${event.slug}`;

  const offers = event.isPaid && event.fee
    ? {
        '@type': 'Offer',
        price: event.fee,
        priceCurrency: 'BDT',
        availability:
          event.capacity != null && event.capacity - event.registrationCount <= 0
            ? 'https://schema.org/SoldOut'
            : 'https://schema.org/InStock',
        url: eventUrl,
      }
    : {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'BDT',
        availability:
          event.capacity != null && event.capacity - event.registrationCount <= 0
            ? 'https://schema.org/SoldOut'
            : 'https://schema.org/InStock',
        url: eventUrl,
      };

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.title,
        description: event.description ?? undefined,
        image: event.coverImageUrl ? [event.coverImageUrl] : undefined,
        startDate: event.startsAt,
        endDate: event.endsAt ?? undefined,
        location: event.location
          ? {
              '@type': 'Place',
              name: event.location,
              address: { '@type': 'PostalAddress', addressCountry: 'BD' },
            }
          : undefined,
        organizer: {
          '@type': 'Organization',
          name: 'Bangladesh Pet Association',
          url: BASE_URL,
        },
        offers,
        url: eventUrl,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      }}
    />
  );
}
