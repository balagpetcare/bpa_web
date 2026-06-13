import { apiFetch } from '@/lib/api';
import type {
  CommunityZonePublic,
  ContributionPlanPublic,
  CareFundOverview,
  TransparencyReportPublic,
  TransparencySummary,
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

export async function getTransparencyReportBySlug(
  slug: string,
  options?: RequestInit,
): Promise<TransparencyReportPublic> {
  const res = await apiFetch<TransparencyReportPublic>(`/public/transparency-reports/${slug}`, options);
  return res.data;
}
