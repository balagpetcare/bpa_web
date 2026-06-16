import type { MetadataRoute } from 'next';
import { BASE_URL } from '@/lib/seo';
import { getNewsList } from '@/lib/api/news';
import { getEventsList } from '@/lib/api/events';
import { getPublicTransparencyReports } from '@/lib/api/community-care';
import { getCampaignsList } from '@/lib/api/campaigns';

export const revalidate = 3600;

const STATIC_ROUTES = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/mission', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/vision', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/committee', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/news', priority: 0.9, changeFrequency: 'daily' },
  { path: '/events', priority: 0.9, changeFrequency: 'daily' },
  { path: '/membership', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/volunteer', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'yearly' },
  { path: '/community-pet-care', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/community-pet-care/zones', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/community-pet-care/contribute', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/community-pet-care/faq', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/care-partner-card', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/verify/care-card', priority: 0.6, changeFrequency: 'yearly' },
  { path: '/pet-census-2026', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/transparency', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/pet-smart-solution', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/campaigns', priority: 0.9, changeFrequency: 'daily' },
  { path: '/booking-lookup', priority: 0.6, changeFrequency: 'yearly' },
  { path: '/verify/cert', priority: 0.6, changeFrequency: 'yearly' },
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${BASE_URL}${r.path}`,
    priority: r.priority,
    changeFrequency: r.changeFrequency,
  }));

  const [newsResult, eventsResult, reportsResult, campaignsResult] = await Promise.allSettled([
    getNewsList({ limit: 1000 }),
    getEventsList({ limit: 1000 }),
    getPublicTransparencyReports(),
    getCampaignsList({ limit: 1000 }),
  ]);

  const newsEntries: MetadataRoute.Sitemap =
    newsResult.status === 'fulfilled'
      ? newsResult.value.items.map((n) => ({
          url: `${BASE_URL}/news/${n.slug}`,
          lastModified: new Date(n.publishedAt ?? n.updatedAt),
          changeFrequency: 'yearly',
          priority: 0.7,
        }))
      : [];

  const eventEntries: MetadataRoute.Sitemap =
    eventsResult.status === 'fulfilled'
      ? eventsResult.value.items.map((e) => ({
          url: `${BASE_URL}/events/${e.slug}`,
          lastModified: new Date(e.updatedAt),
          changeFrequency: 'weekly',
          priority: 0.9,
        }))
      : [];

  const reportEntries: MetadataRoute.Sitemap =
    reportsResult.status === 'fulfilled'
      ? reportsResult.value.map((report) => ({
          url: `${BASE_URL}/transparency/${report.slug}`,
          lastModified: report.publishedAt ? new Date(report.publishedAt) : undefined,
          changeFrequency: 'monthly',
          priority: 0.6,
        }))
      : [];

  const campaignEntries: MetadataRoute.Sitemap =
    campaignsResult.status === 'fulfilled'
      ? campaignsResult.value.items.map((c) => ({
          url: `${BASE_URL}/campaigns/${c.slug}`,
          lastModified: new Date(c.updatedAt),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }))
      : [];

  return [...staticEntries, ...newsEntries, ...eventEntries, ...reportEntries, ...campaignEntries];
}
