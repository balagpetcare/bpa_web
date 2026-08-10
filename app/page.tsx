import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import EnterpriseHeroSection from '@/components/sections/EnterpriseHeroSection';
import MissionPreviewSection from '@/components/sections/MissionPreviewSection';
import VisionPreviewSection from '@/components/sections/VisionPreviewSection';
import { MembershipVolunteerSection } from '@/components/sections/EngagementSections';
import CommunityCareFundSection from '@/components/sections/CommunityCareFundSection';
import PartnersSection from '@/components/sections/PartnersSection';
import CtaSection from '@/components/sections/CtaSection';
import QuickActionsSection from '@/components/home/QuickActionsSection';
import ActiveCampaignsSection from '@/components/home/ActiveCampaignsSection';
import CoreServicesSection from '@/components/home/CoreServicesSection';
import DigitalEcosystemSection from '@/components/home/DigitalEcosystemSection';
import VideoLearningHubSection from '@/components/home/VideoLearningHubSection';
import HowBpaWorksSection from '@/components/home/HowBpaWorksSection';
import ClinicNetworkSection from '@/components/home/ClinicNetworkSection';
import ImpactStatsSection from '@/components/home/ImpactStatsSection';
import GovernanceTransparencySection from '@/components/home/GovernanceTransparencySection';
import NewsResourcesSection from '@/components/home/NewsResourcesSection';
import { getPublicHomepage } from '@/lib/api/homepage';
import { getPublicHomepageContract } from '@/lib/api/public-homepage';
import { getCareFundOverview, getPublicZones } from '@/lib/api/community-care';
import { getSeoData } from '@/lib/api/seo';
import { buildMetadata } from '@/lib/seo';
import type { HeroSlide, HomepageSection, HomepageSectionType } from '@/types/bpa.types';

export const dynamic = 'force-dynamic';

// ─── Hero fallback — UNCHANGED. The hero slider itself must remain exactly
// as-is; only the sections below it are redesigned. ──────────────────────
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

function findSection(sections: HomepageSection[], type: HomepageSectionType): HomepageSection | undefined {
  return sections.find((s) => s.type === type);
}

// Every section below the hero that has a corresponding admin-managed
// HomepageSection record. Visibility and sort order come straight from the
// CMS (Homepage CMS > Sections tab); a section with no CMS record yet keeps
// rendering at its default position so a fresh install looks identical to
// before an admin has touched the Sections tab.
interface OrderedSection {
  // null = no dedicated CMS section type (structural content); always
  // visible, and ordered by defaultOrder only — not admin-hideable.
  type: HomepageSectionType | null;
  defaultOrder: number;
  node: ReactNode;
}

export default async function HomePage() {
  const [homepage, contract, careFundOverview, careFundZones] = await Promise.all([
    getPublicHomepage('en', { cache: 'no-store' }).catch(() => null),
    getPublicHomepageContract('en', { cache: 'no-store' }),
    getCareFundOverview().catch(() => null),
    getPublicZones().catch(() => []),
  ]);

  const heroSlides = homepage?.heroSlides?.length ? homepage.heroSlides : fallbackSlides;
  const sections = homepage?.sections ?? [];
  const partners = homepage?.partners ?? [];

  const featuredCampaigns = contract?.featuredCampaigns ?? [];
  const programs = contract?.programs ?? [];
  const featuredVideos = contract?.featuredVideos ?? [];
  const platformShowcases = contract?.platformShowcases ?? [];
  const featuredClinics = contract?.featuredClinics ?? [];
  const documents = contract?.documents ?? [];
  const news = contract?.news ?? [];

  const orderedSections: OrderedSection[] = [
    { type: 'mission', defaultOrder: 20, node: <MissionPreviewSection section={findSection(sections, 'mission')} /> },
    { type: 'vision', defaultOrder: 21, node: <VisionPreviewSection section={findSection(sections, 'vision')} /> },
    { type: 'campaigns', defaultOrder: 30, node: <ActiveCampaignsSection campaigns={featuredCampaigns} /> },
    { type: 'core_services', defaultOrder: 40, node: <CoreServicesSection programs={programs} /> },
    { type: 'digital_ecosystem', defaultOrder: 50, node: <DigitalEcosystemSection showcases={platformShowcases} /> },
    // 'furtail_community' (legacy standalone "Community layer" section) is
    // intentionally NOT registered here. Furtail App is now presented as
    // one of the Platform Showcase items inside digital_ecosystem above —
    // rendering both would duplicate the Furtail presentation on the
    // homepage. The CMS section type/enum value still exists for historical
    // records; it's simply never looked up in this render tree.
    { type: 'video_hub', defaultOrder: 70, node: <VideoLearningHubSection videos={featuredVideos} /> },
    { type: null, defaultOrder: 80, node: <HowBpaWorksSection /> },
    { type: 'clinic_network', defaultOrder: 90, node: <ClinicNetworkSection clinics={featuredClinics} /> },
    { type: 'stats', defaultOrder: 100, node: contract ? <ImpactStatsSection stats={contract.stats} /> : null },
    { type: null, defaultOrder: 110, node: <MembershipVolunteerSection /> },
    {
      type: null,
      defaultOrder: 111,
      node: <CommunityCareFundSection overview={careFundOverview} zones={careFundZones} />,
    },
    { type: 'governance_documents', defaultOrder: 120, node: <GovernanceTransparencySection documents={documents} /> },
    { type: 'news', defaultOrder: 130, node: <NewsResourcesSection news={news} /> },
    { type: 'partners', defaultOrder: 140, node: <PartnersSection section={findSection(sections, 'partners')} partners={partners} /> },
    { type: 'cta', defaultOrder: 150, node: <CtaSection section={findSection(sections, 'cta')} /> },
  ];

  const visibleOrdered = orderedSections
    .map((entry, index) => {
      const cmsSection = entry.type ? findSection(sections, entry.type) : undefined;
      const isVisible = cmsSection ? cmsSection.isVisible : true;
      const sortOrder = cmsSection ? cmsSection.sortOrder : entry.defaultOrder;
      return { ...entry, key: `${entry.type ?? 'structural'}-${index}`, isVisible, sortOrder };
    })
    .filter((entry) => entry.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      {/* Hero — unchanged, functionally and visually */}
      <EnterpriseHeroSection slides={heroSlides} />

      {/* 1. Quick actions — always shown; no dedicated CMS section type */}
      <QuickActionsSection />

      {/* 2–15. Admin-orderable/hideable sections where a CMS type exists
          (Homepage CMS > Sections); structural sections with no CMS
          equivalent (How BPA Works, Membership, Community Care Fund) are
          always shown, ordered alongside the rest. */}
      {visibleOrdered.map((entry) => (
        <div key={entry.key}>{entry.node}</div>
      ))}

      {/* 16. Institutional footer — rendered site-wide by app/layout.tsx */}
    </>
  );
}
