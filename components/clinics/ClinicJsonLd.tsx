import type { PublicClinic } from '@/types/bpa.types';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * VeterinaryCare (a LocalBusiness subtype) structured data for a clinic
 * branch. Only encodes facts the API actually confirmed — tri-state
 * UNKNOWN/NO fields and missing coordinates/hours are simply omitted
 * rather than asserted as false, and nothing here claims a clinic is
 * verified unless `verificationStatus` is literally `VERIFIED`. No API
 * keys or secrets are involved — this is static JSON built from already
 * public API data.
 */
export default function ClinicJsonLd({ clinic }: { clinic: PublicClinic }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bpa.org.bd';
  const displayName = clinic.branchName?.trim() || clinic.organizationName;

  const openingHoursSpecification = clinic.weeklyHours
    .filter((h) => !h.isClosed && h.opensAt && h.closesAt)
    .map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: DAY_NAMES[h.dayOfWeek],
      opens: h.opensAt,
      closes: h.closesAt,
    }));

  const primaryPhone = clinic.phones.find((p) => p.isPrimary) ?? clinic.phones[0];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'VeterinaryCare',
    name: displayName,
    url: `${siteUrl}/clinics/${clinic.slug}`,
    image:
      clinic.images.length > 0
        ? clinic.images.map((i) => i.url)
        : [clinic.organizationCoverUrl, clinic.organizationLogoUrl].filter((u): u is string => !!u).length > 0
          ? [clinic.organizationCoverUrl, clinic.organizationLogoUrl].filter((u): u is string => !!u)
          : undefined,
    telephone: primaryPhone?.phoneNumber ?? undefined,
    address: clinic.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: clinic.address,
          addressLocality: clinic.area ?? undefined,
          addressRegion: clinic.cityCorporation ?? undefined,
          addressCountry: 'BD',
        }
      : undefined,
    geo: clinic.location
      ? { '@type': 'GeoCoordinates', latitude: clinic.location.latitude, longitude: clinic.location.longitude }
      : undefined,
    openingHoursSpecification: openingHoursSpecification.length > 0 ? openingHoursSpecification : undefined,
    sameAs: clinic.socialLinks.length > 0 ? clinic.socialLinks.map((s) => s.url) : undefined,
    // Deliberately no `aggregateRating` — the API does not provide one, and
    // this schema must never assert a rating BPA has not collected.
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
