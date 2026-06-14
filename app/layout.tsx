import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import OrganizationJsonLd from '@/components/seo/OrganizationJsonLd';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import { BASE_URL, SITE_NAME } from '@/lib/seo';
import { getPublicSiteSettings } from '@/lib/api/site-settings';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings({
    next: { revalidate: 3600 },
  } as RequestInit).catch(() => null);

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: settings?.siteName ?? SITE_NAME,
      template: `%s | ${settings?.siteName ?? SITE_NAME}`,
    },
    description:
      settings?.defaultMetaDescription ??
      'Bangladesh Pet Association — promoting responsible pet ownership and animal welfare across Bangladesh.',
    keywords: [
      'Bangladesh Pet Association',
      'BPA',
      'pet association Bangladesh',
      'animal welfare Bangladesh',
      'responsible pet ownership',
      'pet community Bangladesh',
      'veterinary Bangladesh',
    ],
    authors: [{ name: SITE_NAME, url: BASE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    icons: settings?.faviconUrl
      ? {
          icon: settings.faviconUrl,
          shortcut: settings.faviconUrl,
          apple: settings.faviconUrl,
        }
      : undefined,
    openGraph: {
      type: 'website',
      siteName: settings?.siteName ?? SITE_NAME,
      locale: 'en_US',
      images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@bpa_bd',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-(--bpa-navy)">
        <OrganizationJsonLd />
        <GoogleAnalytics />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
