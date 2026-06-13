import type { Metadata } from 'next';
import type { SeoData } from '@/types/bpa.types';

const SITE_NAME = 'Bangladesh Pet Association';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bpa.org.bd';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-default.jpg`;

export interface PageSeoDefaults {
  title: string;
  description?: string;
  ogImage?: string;
  canonical?: string;
  keywords?: string[];
  ogType?: 'website' | 'article';
  /** article:published_time — ISO string */
  publishedTime?: string;
  /** article:modified_time — ISO string */
  modifiedTime?: string;
  /** article:author names */
  authors?: string[];
  noIndex?: boolean;
}

export function buildMetadata(defaults: PageSeoDefaults, cms?: SeoData | null): Metadata {
  const title = cms?.title ?? defaults.title;
  const description = cms?.description ?? defaults.description ?? '';
  const ogTitle = cms?.ogTitle ?? title;
  const ogDescription = cms?.ogDescription ?? description;
  const ogImage = cms?.ogImageUrl ?? defaults.ogImage ?? DEFAULT_OG_IMAGE;
  const canonical = defaults.canonical ? `${BASE_URL}${defaults.canonical}` : undefined;
  const ogType = defaults.ogType ?? 'website';

  const openGraphBase = {
    title: ogTitle,
    description: ogDescription,
    siteName: SITE_NAME,
    images: [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }],
    ...(canonical ? { url: canonical } : {}),
  };

  const openGraph: Metadata['openGraph'] =
    ogType === 'article'
      ? {
          ...openGraphBase,
          type: 'article',
          ...(defaults.publishedTime ? { publishedTime: defaults.publishedTime } : {}),
          ...(defaults.modifiedTime ? { modifiedTime: defaults.modifiedTime } : {}),
          ...(defaults.authors?.length ? { authors: defaults.authors } : {}),
        }
      : {
          ...openGraphBase,
          type: 'website',
        };

  return {
    title,
    description,
    ...(defaults.keywords?.length ? { keywords: defaults.keywords } : {}),
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph,
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: [{ url: ogImage, alt: ogTitle }],
    },
    robots: defaults.noIndex ? { index: false, follow: false } : undefined,
  };
}

export function absoluteUrl(path: string): string {
  return `${BASE_URL}${path}`;
}

export { BASE_URL, SITE_NAME };
