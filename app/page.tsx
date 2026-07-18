import type { Metadata } from 'next';
import EnterpriseHeroSection from '@/components/sections/EnterpriseHeroSection';
import FeaturedVideosSection from '@/components/sections/FeaturedVideosSection';
import { getPublicHomepage } from '@/lib/api/homepage';
import { getContentHomepage } from '@/lib/api/content';
import { getSeoData } from '@/lib/api/seo';
import { buildMetadata } from '@/lib/seo';
import type { HeroSlide } from '@/types/bpa.types';
import {
  QuickActionSection,
  AboutSection,
  ProgramsSection,
  FeaturedCampaignSection,
  HowItWorksSection,
  ImpactSection,
  AdoptionRescueSection,
  DonationImpactSection,
  PartnersCtaSection,
  NewsPreviewSection,
  FinalCtaSection,
} from '@/components/home/HomepageSections';

export const dynamic = 'force-dynamic';

const fallbackSlides: HeroSlide[] = [
  {
    id: 'bpa-fallback-1',
    locale: 'en',
    title: 'BPA Cat Vaccination Campaign 2026',
    badgeText: 'Bangladesh Pet Association',
    eyebrow: 'National campaign',
    headline: 'Protect more pets through a nationwide vaccination drive',
    body: 'Join vaccination registration, community outreach, and partner clinic coordination for a healthier pet ecosystem in Bangladesh.',
    campaignTag: 'vaccination-2026',
    status: 'published',
    isActive: true,
    mediaType: 'image',
    overlayPosition: 'left',
    ctaType: 'internal',
    ctaLabel: 'Register for Campaign',
    ctaHref: '/campaigns',
    ctaTarget: '_self',
    secondaryCtaType: 'internal',
    secondaryCtaLabel: 'Donate Now',
    secondaryCtaHref: '/donate',
    secondaryCtaTarget: '_self',
    desktopImage: { id: 'hero-1', url: '/window.svg', mimeType: 'image/svg+xml', altText: 'Campaign banner' },
    mobileImage: null,
    video: null,
    stats: [
      { label: 'Partner clinics', value: '120+' },
      { label: 'Active volunteers', value: '500+' },
      { label: 'District reach', value: '64' },
    ],
    countdownLabel: null,
    countdownTargetAt: null,
    startAt: null,
    endAt: null,
    sortOrder: 1,
  },
  {
    id: 'bpa-fallback-2',
    locale: 'en',
    title: 'Adopt, Rescue, and Protect Pets',
    badgeText: 'Community action',
    eyebrow: 'Compassion in action',
    headline: 'Make adoption, rescue, and support easy to find',
    body: 'A trusted platform for people who want to help animals through adoption, rescue reporting, or direct support.',
    campaignTag: 'adoption-rescue',
    status: 'published',
    isActive: true,
    mediaType: 'image',
    overlayPosition: 'left',
    ctaType: 'internal',
    ctaLabel: 'Adopt a Pet',
    ctaHref: '/adoption',
    ctaTarget: '_self',
    secondaryCtaType: 'internal',
    secondaryCtaLabel: 'Report Rescue',
    secondaryCtaHref: '/contact',
    secondaryCtaTarget: '_self',
    desktopImage: { id: 'hero-2', url: '/globe.svg', mimeType: 'image/svg+xml', altText: 'Community support' },
    mobileImage: null,
    video: null,
    stats: [
      { label: 'Animals helped', value: '15k+' },
      { label: 'Campaigns', value: '40+' },
      { label: 'Volunteer teams', value: '80+' },
    ],
    countdownLabel: null,
    countdownTargetAt: null,
    startAt: null,
    endAt: null,
    sortOrder: 2,
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const [seo, homepage] = await Promise.all([
    getSeoData('/').catch(() => null),
    getPublicHomepage('en', { cache: 'no-store' }).catch(() => null),
  ]);

  return buildMetadata(
    {
      title:
        homepage?.homepage?.title ||
        'Bangladesh Pet Association - Trusted national animal welfare platform',
      description:
        homepage?.homepage?.description ||
        'Bangladesh Pet Association promotes vaccination campaigns, adoption, rescue, donation, awareness, and veterinary support across Bangladesh.',
      canonical: '/',
    },
    seo,
  );
}

export default async function HomePage() {
  const [homepage, contentHomepage] = await Promise.all([
    getPublicHomepage('en', { cache: 'no-store' }).catch(() => null),
    getContentHomepage().catch(() => null),
  ]);

  const heroSlides = homepage?.heroSlides?.length ? homepage.heroSlides : fallbackSlides;
  const featuredVideos = contentHomepage?.featuredVideos || [];

  return (
    <>
      <EnterpriseHeroSection slides={heroSlides} />
      <QuickActionSection />
      <AboutSection />
      <ProgramsSection />
      <FeaturedCampaignSection />
      <FeaturedVideosSection videos={featuredVideos} />
      <HowItWorksSection />
      <ImpactSection />
      <AdoptionRescueSection />
      <DonationImpactSection />
      <PartnersCtaSection />
      <NewsPreviewSection />
      <FinalCtaSection />
    </>
  );
}
