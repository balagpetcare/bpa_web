import { apiFetch, apiPost } from '@/lib/api';
import type {
  CampaignListItem,
  CampaignDetail,
  CampaignFaq,
  CampaignRegistration,
  CampaignWaitlistEntry,
  CertificateVerification,
  GuestPet,
  GuestPetBatchResponse,
  RegisterCampaignPayload,
  RegisterResponse,
  JoinWaitlistPayload,
  PaginationMeta,
  CampaignCoverageSummary,
  CampaignSessionListItem,
  CampaignSessionLookupItem,
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

// ─── Location-first venue discovery ────────────────────────────────

export interface PublicCampaignVenueFilters {
  divisionId?: string;
  districtId?: string;
  upazilaId?: string;
  unionId?: string;
  cityCorporationId?: string;
  cityZoneId?: string;
  wardId?: string;
}

export interface PublicCampaignVenueSession {
  id: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  campaign: { id: string; slug: string; title: string; campaignType: string; status: string };
}

export interface PublicCampaignVenue {
  id: string;
  name: string;
  address: string;
  googleMapsUrl: string | null;
  latitude: string | null;
  longitude: string | null;
  contactPerson: string | null;
  contactPhone: string | null;
  location: { id: string; type: string; nameEn: string; nameBn: string | null; parentId: string | null } | null;
  locationPath: { id: string; type: string; nameEn: string; nameBn: string | null; parentId: string | null }[];
  campaignSessions: PublicCampaignVenueSession[];
}

export async function getPublicCampaignVenues(
  filters: PublicCampaignVenueFilters = {},
  fetchOptions?: RequestInit,
): Promise<PublicCampaignVenue[]> {
  const q = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v) q.set(k, v); });
  const qs = q.toString();
  const res = await apiFetch<PublicCampaignVenue[]>(`/public/campaigns/venues${qs ? `?${qs}` : ''}`, fetchOptions);
  return res.data;
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

// `includeSessions` defaults to true, preserving the original full-payload
// contract for every existing caller. Pass `false` to fetch metadata +
// bounded `sessionStats` only — used where the raw sessions array isn't
// actually needed (e.g. the main campaign page, or a form's initial load
// before a location/session has been chosen).
export async function getCampaignBySlug(
  slug: string,
  locationId?: string,
  fetchOptions?: RequestInit,
  includeSessions: boolean = true,
) {
  const q = new URLSearchParams();
  if (locationId) q.set('locationId', locationId);
  if (!includeSessions) q.set('includeSessions', 'false');
  const qs = q.toString();
  const res = await apiFetch<CampaignDetail>(`/public/campaigns/${slug}${qs ? `?${qs}` : ''}`, fetchOptions);
  return res.data;
}

// Resolves exactly one session by its canonical UUID — used to resume a
// `?session=<id>` deep link without downloading every session in the
// campaign to find it.
export async function getCampaignSessionById(
  slug: string,
  sessionId: string,
  fetchOptions?: RequestInit,
): Promise<CampaignSessionLookupItem | null> {
  try {
    const res = await apiFetch<CampaignSessionLookupItem>(`/public/campaigns/${slug}/sessions/${sessionId}`, fetchOptions);
    return res.data;
  } catch {
    return null;
  }
}

export async function getCampaignCoverage(slug: string, fetchOptions?: RequestInit): Promise<CampaignCoverageSummary> {
  const res = await apiFetch<CampaignCoverageSummary>(`/public/campaigns/${slug}/coverage`, fetchOptions);
  return res.data;
}

export interface CampaignSessionsParams {
  search?: string;
  divisionId?: string;
  districtId?: string;
  date?: string;
  availability?: string;
  tab?: 'upcoming' | 'past';
  page?: number;
  limit?: number;
}

export async function getCampaignSessions(
  slug: string,
  params: CampaignSessionsParams = {},
  fetchOptions?: RequestInit,
): Promise<{ items: CampaignSessionListItem[]; meta: PaginationMeta }> {
  const q = new URLSearchParams();
  if (params.search) q.set('search', params.search);
  if (params.divisionId) q.set('divisionId', params.divisionId);
  if (params.districtId) q.set('districtId', params.districtId);
  if (params.date) q.set('date', params.date);
  if (params.availability) q.set('availability', params.availability);
  if (params.tab) q.set('tab', params.tab);
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  const qs = q.toString();
  const res = await apiFetch<CampaignSessionListItem[]>(`/public/campaigns/${slug}/sessions${qs ? `?${qs}` : ''}`, fetchOptions);
  return { items: res.data, meta: res.meta as PaginationMeta };
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

export async function getCampaignFaqs(slug: string, fetchOptions?: RequestInit): Promise<CampaignFaq[]> {
  try {
    const res = await apiFetch<CampaignFaq[]>(`/public/campaigns/${slug}/faqs`, fetchOptions);
    return res.data;
  } catch {
    return [];
  }
}
