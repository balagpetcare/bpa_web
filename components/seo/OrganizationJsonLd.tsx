import JsonLd from './JsonLd';
import { BASE_URL } from '@/lib/seo';

export default function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Bangladesh Pet Association',
        url: BASE_URL,
        logo: `${BASE_URL}/logo.png`,
        sameAs: [],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          email: 'info@bpa.org.bd',
        },
      }}
    />
  );
}
