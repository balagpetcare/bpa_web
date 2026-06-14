import JsonLd from './JsonLd';
import { BASE_URL } from '@/lib/seo';
import { getPublicSiteSettings, formatAddress } from '@/lib/api/site-settings';

export default async function OrganizationJsonLd() {
  const settings = await getPublicSiteSettings({
    next: { revalidate: 3600 },
  } as RequestInit).catch(() => null);

  const sameAs = [
    settings?.facebookUrl,
    settings?.youtubeUrl,
    settings?.linkedinUrl,
  ].filter((u): u is string => !!u);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings?.organizationName ?? settings?.siteName ?? 'Bangladesh Pet Association',
    url: BASE_URL,
    logo: settings?.primaryLogoUrl ?? `${BASE_URL}/logo.png`,
    ...(sameAs.length > 0 && { sameAs }),
  };

  // Contact point
  const phone = settings?.officialPhone ?? settings?.emergencyPhone ?? null;
  const email = settings?.generalEmail ?? settings?.supportEmail ?? null;
  if (phone || email) {
    data.contactPoint = {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      ...(phone && { telephone: phone }),
      ...(email && { email }),
    };
  }

  // Postal address
  const addr = settings ? formatAddress(settings) : null;
  if (addr || settings?.city) {
    data.address = {
      '@type': 'PostalAddress',
      ...(settings?.addressLine1 && {
        streetAddress: [settings.addressLine1, settings.addressLine2].filter(Boolean).join(', '),
      }),
      ...(settings?.city && { addressLocality: settings.city }),
      ...(settings?.area && { addressRegion: settings.area }),
      ...(settings?.postalCode && { postalCode: settings.postalCode }),
      addressCountry: settings?.country ?? 'BD',
    };
  }

  return <JsonLd data={data} />;
}
