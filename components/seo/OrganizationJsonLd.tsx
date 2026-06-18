import JsonLd from './JsonLd';
import { BASE_URL } from '@/lib/seo';
import type { PublicSiteSettings } from '@/lib/api/site-settings';

export default function OrganizationJsonLd({ settings }: { settings: PublicSiteSettings | null }) {
  const name = settings?.organizationName || 'Bangladesh Pet Association';
  const email = settings?.contactEmail || settings?.supportEmail || settings?.generalEmail || 'info@bpa.org.bd';
  const logo = settings?.primaryLogoUrl || `${BASE_URL}/logo.png`;

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name,
        url: BASE_URL,
        logo,
        sameAs: [],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          email,
        },
      }}
    />
  );
}
