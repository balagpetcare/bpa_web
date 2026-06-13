import { apiPost, apiFetch } from '@/lib/api';
import type {
  InitiateContributionPayload,
  InitiateContributionResponse,
  ContributionStatusPublic,
} from '@/types/bpa.types';

export async function initiateContribution(
  data: InitiateContributionPayload,
): Promise<InitiateContributionResponse> {
  const res = await apiPost<InitiateContributionResponse>('/public/care-contributions', data);
  return res.data;
}

export async function getContributionByNumber(
  contributionNumber: string,
  options?: RequestInit,
): Promise<ContributionStatusPublic> {
  const res = await apiFetch<ContributionStatusPublic>(
    `/public/care-contributions/by-number/${encodeURIComponent(contributionNumber)}`,
    options,
  );
  return res.data;
}
