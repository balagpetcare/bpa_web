import type { Metadata } from 'next';
import EnterpriseHeroSection from '@/components/sections/EnterpriseHeroSection';
import StatsSection from '@/components/sections/StatsSection';
import MissionPreviewSection from '@/components/sections/MissionPreviewSection';
import VisionPreviewSection from '@/components/sections/VisionPreviewSection';
import LatestNewsSection from '@/components/sections/LatestNewsSection';
import UpcomingEventsSection from '@/components/sections/UpcomingEventsSection';
import CommitteePreviewSection from '@/components/sections/CommitteePreviewSection';
import CtaSection from '@/components/sections/CtaSection';
import PartnersSection from '@/components/sections/PartnersSection';
import CampaignsSection from '@/components/sections/CampaignsSection';
import { MembershipVolunteerSection, SuccessStoriesSection, findCustomSection } from '@/components/sections/EngagementSections';
import CommunityCareFundSection from '@/components/sections/CommunityCareFundSection';
import TransparencyTeaserSection from '@/components/sections/TransparencyTeaserSection';
import PetCensusCTASection from '@/components/sections/PetCensusCTASection';
import PetSmartSolutionPreviewSection from '@/components/sections/PetSmartSolutionPreviewSection';
import { getNewsList } from '@/lib/api/news';
import { getEventsList } from '@/lib/api/events';
import { getCommitteeMembers } from '@/lib/api/committee';
import { getFeaturedCampaigns } from '@/lib/api/campaigns';
import { getSeoData } from '@/lib/api/seo';
import { getPublicHomepage } from '@/lib/api/homepage';
import { getPublicZones, getCareFundOverview } from '@/lib/api/community-care';
import { buildMetadata } from '@/lib/seo';

// force-dynamic: homepage uses cache:'no-store' on CMS data so it must render
// fresh on every request — revalidate=N would conflict and serve stale HTML.
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const [seo, homepage] = await Promise.all([
    getSeoData('/').catch(() => null),
    getPublicHomepage('en', { cache: 'no-store' }).catch(() => null),
  ]);

  return buildMetadata(
    {
      title: homepage?.homepage?.title || 'Bangladesh Pet Association - Caring for Pets, Building a Community',
      description: homepage?.homepage?.description || 'The Bangladesh Pet Association promotes responsible pet ownership, animal welfare, and community building for pet lovers across Bangladesh.',
      canonical: '/',
    },
    seo,
  );
}


export default async function HomePage() {
  const [homepageResult, newsResult, eventsResult, committeeResult, campaignsResult, zonesResult, overviewResult] = await Promise.allSettled([
    getPublicHomepage('en', { cache: 'no-store' }),
    getNewsList({ limit: 3, isFeatured: undefined }, { next: { revalidate: 300, tags: ['news-list'] } }),
    getEventsList({ limit: 3, upcoming: true }, { next: { revalidate: 300, tags: ['events-list'] } }),
    getCommitteeMembers({ next: { revalidate: 3600, tags: ['committee'] } }),
    getFeaturedCampaigns({ next: { revalidate: 300, tags: ['campaigns-featured'] } } as RequestInit),
    getPublicZones({ next: { revalidate: 300, tags: ['community-zones'] } } as RequestInit),
    getCareFundOverview({ next: { revalidate: 300, tags: ['care-fund-overview'] } } as RequestInit),
  ]);

  const homepage = homepageResult.status === 'fulfilled' ? homepageResult.value : null;
  const news = newsResult.status === 'fulfilled' ? newsResult.value.items : [];
  const events = eventsResult.status === 'fulfilled' ? eventsResult.value.items : [];
  const committee = committeeResult.status === 'fulfilled' ? committeeResult.value : [];
  const campaignData = campaignsResult.status === 'fulfilled'
    ? campaignsResult.value
    : { featured: [], registrationOpen: [], upcoming: [] };
  const zones = zonesResult.status === 'fulfilled' ? zonesResult.value : [];
  const careFundOverview = overviewResult.status === 'fulfilled' ? overviewResult.value : null;
  const sections = homepage?.sections ?? [];
  const section = (type: string) => sections.find((item) => item.type === type) ?? null;
  const membership = findCustomSection(sections, 'membership');
  const volunteer = findCustomSection(sections, 'volunteer');
  const success = findCustomSection(sections, 'success_stories');

  return (
    <>
      <EnterpriseHeroSection slides={homepage?.heroSlides ?? []} />
      <StatsSection section={section('stats')} />
      <MissionPreviewSection section={section('mission')} />
      <CampaignsSection
        section={section('campaigns')}
        featured={campaignData.featured}
        registrationOpen={campaignData.registrationOpen}
        upcoming={campaignData.upcoming}
      />
      <CommunityCareFundSection overview={careFundOverview} zones={zones} />
      <TransparencyTeaserSection />
      <PetCensusCTASection />
      <MembershipVolunteerSection membership={membership} volunteer={volunteer} />
      <LatestNewsSection items={news} section={section('news')} />
      <UpcomingEventsSection items={events} section={section('events')} />
      <VisionPreviewSection section={section('vision')} />
      <SuccessStoriesSection section={success} />
      <CommitteePreviewSection members={committee} section={section('committee')} />
      <PetSmartSolutionPreviewSection />
      <CtaSection section={section('cta')} />
      <PartnersSection section={section('partners')} partners={homepage?.partners ?? []} />
    </>
  );
}
