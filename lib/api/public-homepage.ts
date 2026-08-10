import { apiFetch } from '@/lib/api';

// Mirrors bpa_api's src/modules/homepage-public/homepage-public.types.ts
// exactly — this is the single stable public homepage data contract both
// this website and (in future) other BPA clients consume. Every field here
// is read live from its source of truth on the backend; nothing is
// hardcoded on either side.

export interface PublicMedia {
  id: string;
  url: string;
  altText: string | null;
}

export type FeaturedCampaignKind = 'VACCINATION' | 'SPAY_NEUTER';

export interface FeaturedCampaignPricing {
  currency: 'BDT';
  amountFrom: number;
  amountTo: number;
}

export type FeaturedCampaignStatusLabel =
  | 'Registration Open'
  | 'Booking Open'
  | 'Upcoming'
  | 'Registration Closed'
  | 'Completed';

export interface FeaturedCampaign {
  id: string;
  kind: FeaturedCampaignKind;
  slug: string;
  title: string;
  summary: string | null;
  status: string;
  statusLabel: FeaturedCampaignStatusLabel;
  isOpenForAction: boolean;
  startDate: string | null;
  endDate: string | null;
  registrationOrBookingOpensAt: string | null;
  registrationOrBookingClosesAt: string | null;
  pricing: FeaturedCampaignPricing | null;
  coverImage: PublicMedia | null;
  // Normalized homepage thumbnail — identical contract for VACCINATION and
  // SPAY_NEUTER cards regardless of which internal media field(s) the
  // source record has. Already resolved through the backend's fallback
  // chain; null means render the branded placeholder, never a broken image.
  thumbnailUrl: string | null;
  thumbnailAlt: string | null;
  locationSummary: string[];
  ctaHref: string;
  ctaLabel: string;
}

export interface HomepageProgram {
  id: string;
  key: string;
  title: string;
  description: string | null;
  iconKey: string | null;
  iconMedia: PublicMedia | null;
  ctaLabel: string | null;
  ctaHref: string | null;
}

export interface HomepageVideo {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  thumbnailUrl: string | null;
  videoProvider: string | null;
  durationSeconds: number | null;
  publishedAt: string | null;
}

export type AppPlatform = 'ANDROID' | 'IOS' | 'WEB';
export type AppAvailability = 'LIVE' | 'COMING_SOON' | 'BETA';

// `storeUrl` is guaranteed non-null only when `availability === 'LIVE'` —
// the backend never sends a real link for a Coming Soon/Beta platform, so
// the frontend never needs to (and must not) infer availability from the
// presence of a URL.
export interface HomepageAppPlatformLink {
  platform: AppPlatform;
  availability: AppAvailability;
  storeUrl: string | null;
  qrCode: PublicMedia | null;
}

export interface HomepageAppInfo {
  appKey: string;
  name: string;
  tagline: string | null;
  description: string | null;
  relationshipLabel: string | null;
  icon: PublicMedia | null;
  features: string[];
  screenshots: PublicMedia[];
  platforms: HomepageAppPlatformLink[];
}

export type PlatformShowcaseLayout = 'PREVIEW_LEFT' | 'PREVIEW_RIGHT';
export type PlatformShowcasePreviewMode = 'RAW_IMAGE' | 'DEVICE_FRAME';
export type PlatformShowcaseLinkType = 'GOOGLE_PLAY' | 'APP_STORE' | 'WEBSITE' | 'DETAILS' | 'OTHER';

export interface PlatformShowcaseLink {
  type: PlatformShowcaseLinkType;
  label: string;
  url: string;
  qrEnabled: boolean;
  qrCaption: string | null;
  openInNewTab: boolean;
  isActive?: boolean;
}

export interface PlatformShowcaseItem {
  platformKey: string;
  brandKey: string;
  platformType: 'APP' | 'WEBSITE';
  name: string;
  badgeText: string | null;
  heading: string | null;
  subheading: string | null;
  description: string | null;
  featureBullets: string[];
  ctaText: string | null;
  ctaUrl: string | null;
  layoutOverride: PlatformShowcaseLayout | null;
  previewMode: PlatformShowcasePreviewMode;
  featured: boolean;
  isActive?: boolean;
  logo: PublicMedia | null;
  primaryPreview: PublicMedia | null;
  secondaryPreview: PublicMedia | null;
  links: PlatformShowcaseLink[];
}

export interface PlatformShowcase {
  key: string;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  description: string | null;
  layout: PlatformShowcaseLayout;
  theme: string;
  logo: PublicMedia | null;
  items: PlatformShowcaseItem[];
}

export interface HomepageStats {
  animalsVaccinated: number;
  spayNeuterCompleted: number;
  activeMembers: number;
  partnerClinics: number;
  districtsReached: number;
  asOf: string;
}

export interface HomepageClinic {
  id: string;
  slug: string | null;
  name: string;
  area: string | null;
  district: string | null;
  logo: PublicMedia | null;
}

export interface HomepageDocument {
  id: string;
  key: string;
  title: string;
  category: string;
  summary: string | null;
  url: string | null;
  version: string | null;
  publishedAt: string | null;
}

export interface HomepageNewsItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  publishedAt: string | null;
}

export interface PublicHomepageContract {
  locale: string;
  generatedAt: string;
  featuredCampaigns: FeaturedCampaign[];
  programs: HomepageProgram[];
  featuredVideos: HomepageVideo[];
  apps: HomepageAppInfo[];
  platformShowcases: PlatformShowcase[];
  stats: HomepageStats;
  featuredClinics: HomepageClinic[];
  documents: HomepageDocument[];
  news: HomepageNewsItem[];
}

export async function getPublicHomepageContract(
  locale = 'en',
  fetchOptions?: RequestInit,
): Promise<PublicHomepageContract | null> {
  try {
    const q = new URLSearchParams({ locale });
    const res = await apiFetch<PublicHomepageContract>(`/public/homepage?${q.toString()}`, fetchOptions);
    return res.data;
  } catch {
    return null;
  }
}

/** Resolve a public platform from the canonical showcase contract.
 * The API contract contains published, active sections/items only, so a miss
 * is intentionally indistinguishable from an unpublished platform.
 */
export function findPublicPlatform(
  contract: PublicHomepageContract | null,
  platformKey: string,
): { showcase: PlatformShowcase; item: PlatformShowcaseItem } | null {
  if (!contract || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(platformKey)) return null;

  for (const showcase of contract.platformShowcases) {
    const item = showcase.items.find((candidate) => candidate.platformKey === platformKey);
    if (item) return { showcase, item };
  }
  return null;
}

export function selectCanonicalPlatformShowcase(
  showcases: PlatformShowcase[] | null | undefined,
): PlatformShowcase | null {
  if (!showcases?.length) return null;

  const activeShowcases = showcases.filter((showcase) => showcase.items.length > 0);
  if (activeShowcases.length === 0) return null;

  return (
    activeShowcases.find((showcase) => showcase.key === 'digital-ecosystem') ??
    activeShowcases[0]
  );
}

export async function getPublicPlatform(
  platformKey: string,
  fetchOptions?: RequestInit,
): Promise<{ showcase: PlatformShowcase; item: PlatformShowcaseItem } | null> {
  const contract = await getPublicHomepageContract('en', fetchOptions);
  return findPublicPlatform(contract, platformKey);
}
