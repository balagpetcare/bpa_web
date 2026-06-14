import { apiFetch } from '@/lib/api';
import type {
  CommunityZonePublic,
  ContributionPlanPublic,
  CareFundOverview,
  TransparencyReportPublic,
  TransparencySummary,
  CarePartnerBenefit,
  SocialImpactProgram,
  RoadmapItem,
  DiagnosticCenterService,
  PublicContributor,
  PublicImpactStats,
} from '@/types/bpa.types';

export async function getPublicZones(options?: RequestInit): Promise<CommunityZonePublic[]> {
  const res = await apiFetch<CommunityZonePublic[]>('/public/community-zones', options);
  return res.data;
}

export async function getPublicPlans(options?: RequestInit): Promise<ContributionPlanPublic[]> {
  const res = await apiFetch<ContributionPlanPublic[]>('/public/contribution-plans', options);
  return res.data;
}

export async function getCareFundOverview(options?: RequestInit): Promise<CareFundOverview> {
  const res = await apiFetch<CareFundOverview>('/public/community-fund/overview', options);
  return res.data;
}

export async function getPublicTransparencyReports(options?: RequestInit): Promise<TransparencyReportPublic[]> {
  const res = await apiFetch<TransparencyReportPublic[]>('/public/transparency-reports?status=published', options);
  return Array.isArray(res.data) ? res.data : (res as unknown as { data: { data: TransparencyReportPublic[] } }).data.data ?? [];
}

export async function getTransparencySummary(options?: RequestInit): Promise<TransparencySummary> {
  const res = await apiFetch<TransparencySummary>('/public/transparency-reports/summary', options);
  return res.data;
}

function extractPagedList<T>(res: { data: T[] | { data: T[] } }): T[] {
  if (Array.isArray(res.data)) return res.data;
  return (res.data as { data: T[] }).data ?? [];
}

export async function getPublicCarePartnerBenefits(options?: RequestInit): Promise<CarePartnerBenefit[]> {
  const res = await apiFetch<CarePartnerBenefit[] | { data: CarePartnerBenefit[] }>('/public/care-partner-benefits', options);
  return extractPagedList(res);
}

export async function getPublicSocialImpactPrograms(options?: RequestInit): Promise<SocialImpactProgram[]> {
  const res = await apiFetch<SocialImpactProgram[] | { data: SocialImpactProgram[] }>('/public/social-impact-programs', options);
  return extractPagedList(res);
}

export async function getPublicRoadmapItems(options?: RequestInit): Promise<RoadmapItem[]> {
  const res = await apiFetch<RoadmapItem[] | { data: RoadmapItem[] }>('/public/roadmap-items', options);
  return extractPagedList(res);
}

export async function getPublicDiagnosticServices(options?: RequestInit): Promise<DiagnosticCenterService[]> {
  const res = await apiFetch<DiagnosticCenterService[] | { data: DiagnosticCenterService[] }>('/public/diagnostic-center-services', options);
  return extractPagedList(res);
}

export async function getRecentPublicContributors(limit = 12, options?: RequestInit): Promise<PublicContributor[]> {
  try {
    const res = await apiFetch<PublicContributor[]>(`/public/community-fund/recent-contributors?limit=${limit}`, options);
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
}

export async function getPublicImpactStats(options?: RequestInit): Promise<PublicImpactStats | null> {
  try {
    const res = await apiFetch<PublicImpactStats>('/public/community-fund/impact-stats', options);
    return res.data ?? null;
  } catch {
    return null;
  }
}

export async function getTransparencyReportBySlug(
  slug: string,
  options?: RequestInit,
): Promise<TransparencyReportPublic> {
  const res = await apiFetch<TransparencyReportPublic>(`/public/transparency-reports/${slug}`, options);
  return res.data;
}
