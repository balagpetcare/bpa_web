interface Props {
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  slug: string;
  coverImageUrl: string | null;
  isFree: boolean;
  basePriceBdt: string;
  venues: Array<{ name: string; address: string | null }>;
}

export default function CampaignJsonLd({
  title, description, startDate, endDate, slug, coverImageUrl, isFree, basePriceBdt, venues,
}: Props) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bpa.org.bd';

  const offers = isFree
    ? { '@type': 'Offer', price: '0', priceCurrency: 'BDT', availability: 'https://schema.org/InStock' }
    : { '@type': 'Offer', price: basePriceBdt, priceCurrency: 'BDT', availability: 'https://schema.org/InStock' };

  const locations = venues.length > 0
    ? venues.map(v => ({ '@type': 'Place', name: v.name, address: v.address ?? undefined }))
    : undefined;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: title,
    description: description ?? undefined,
    startDate,
    endDate,
    url: `${siteUrl}/campaigns/${slug}`,
    image: coverImageUrl ?? undefined,
    organizer: {
      '@type': 'Organization',
      name: 'Bangladesh Pet Association',
      url: siteUrl,
    },
    offers,
    ...(locations && locations.length === 1 ? { location: locations[0] } : {}),
    ...(locations && locations.length > 1 ? { location: locations } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
