import { apiFetch, apiPost } from '@/lib/api';
import type {
  CampaignListItem,
  CampaignDetail,
  CampaignRegistration,
  CampaignWaitlistEntry,
  CertificateVerification,
  GuestPet,
  GuestPetBatchResponse,
  RegisterCampaignPayload,
  RegisterResponse,
  JoinWaitlistPayload,
  PaginationMeta,
} from '@/types/bpa.types';

export interface CampaignListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  campaignType?: string;
}

export interface FeaturedCampaignsResult {
  featured: CampaignListItem[];
  registrationOpen: CampaignListItem[];
  upcoming: CampaignListItem[];
}

export async function getFeaturedCampaigns(fetchOptions?: RequestInit): Promise<FeaturedCampaignsResult> {
  const res = await apiFetch<FeaturedCampaignsResult>('/public/campaigns/featured', fetchOptions);
  return res.data;
}

export async function getCampaignsList(params: CampaignListParams = {}, fetchOptions?: RequestInit) {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  if (params.search) q.set('search', params.search);
  if (params.status) q.set('status', params.status);
  if (params.campaignType) q.set('campaignType', params.campaignType);
  const res = await apiFetch<CampaignListItem[]>(`/public/campaigns?${q.toString()}`, fetchOptions);
  return { items: res.data, meta: res.meta as PaginationMeta };
}

export async function getCampaignBySlug(slug: string, fetchOptions?: RequestInit) {
  const res = await apiFetch<CampaignDetail>(`/public/campaigns/${slug}`, fetchOptions);
  return res.data;
}

export async function getBookingByNumber(bookingNumber: string, fetchOptions?: RequestInit) {
  const res = await apiFetch<CampaignRegistration>(
    `/public/campaign-registrations/booking/${bookingNumber}`,
    fetchOptions,
  );
  return res.data;
}

export async function createGuestPets(
  ownerInfo: {
    ownerName: string; mobile: string; email?: string; address?: string;
    divisionId?: string; districtId?: string; upazilaId?: string;
    unionId?: string; cityCorporationId?: string; cityZoneId?: string; wardId?: string;
  },
  pets: GuestPet[],
): Promise<GuestPetBatchResponse> {
  const res = await apiPost<GuestPetBatchResponse>('/public/pets/guest', { ...ownerInfo, pets });
  return res.data;
}

export async function registerForCampaign(payload: RegisterCampaignPayload): Promise<RegisterResponse> {
  const res = await apiPost<RegisterResponse>('/public/campaign-registrations/register', payload);
  return res.data;
}

export async function joinWaitlist(payload: JoinWaitlistPayload): Promise<CampaignWaitlistEntry> {
  const res = await apiPost<CampaignWaitlistEntry>('/public/campaign-registrations/waitlist', payload);
  return res.data;
}

export async function verifyCertificate(verifyToken: string, fetchOptions?: RequestInit): Promise<CertificateVerification> {
  const res = await apiFetch<CertificateVerification>(
    `/public/campaigns/verify-certificate/${verifyToken}`,
    fetchOptions,
  );
  return res.data;
}
