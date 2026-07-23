import { apiFetch } from '@/lib/api';
import type { PaginationMeta, PublicClinic, PublicClinicFilterOptions } from '@/types/bpa.types';

export interface ClinicListParams {
  page?: number;
  limit?: number;
  search?: string;
  organizationSlug?: string;
  cityCorporation?: string;
  area?: string;
  district?: string;
  service?: string;
  animalType?: string;
  facilityType?: string;
  openNow?: boolean;
  open24Hours?: boolean;
  emergencyAvailability?: boolean;
  appointmentRequired?: boolean;
  verifiedOnly?: boolean;
  featured?: boolean;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  sortBy?: 'distance' | 'name' | 'featured' | 'recentlyVerified';
}

function buildQuery(params: ClinicListParams): string {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  if (params.search) q.set('search', params.search);
  if (params.organizationSlug) q.set('organizationSlug', params.organizationSlug);
  if (params.cityCorporation) q.set('cityCorporation', params.cityCorporation);
  if (params.area) q.set('area', params.area);
  if (params.district) q.set('district', params.district);
  if (params.service) q.set('service', params.service);
  if (params.animalType) q.set('animalType', params.animalType);
  if (params.facilityType) q.set('facilityType', params.facilityType);
  if (params.openNow) q.set('openNow', 'true');
  if (params.open24Hours) q.set('open24Hours', 'true');
  if (params.emergencyAvailability) q.set('emergencyAvailability', 'true');
  if (params.appointmentRequired) q.set('appointmentRequired', 'true');
  if (params.verifiedOnly) q.set('verifiedOnly', 'true');
  if (params.featured) q.set('featured', 'true');
  // latitude/longitude/radiusKm/sortBy=distance are only ever sent together
  // — the backend rejects `distance` sort or a radius without coordinates.
  if (params.latitude !== undefined && params.longitude !== undefined) {
    q.set('latitude', String(params.latitude));
    q.set('longitude', String(params.longitude));
    if (params.radiusKm) q.set('radiusKm', String(params.radiusKm));
    if (params.sortBy) q.set('sortBy', params.sortBy);
  } else if (params.sortBy && params.sortBy !== 'distance') {
    q.set('sortBy', params.sortBy);
  }
  return q.toString();
}

export async function getClinicsList(params: ClinicListParams = {}, fetchOptions?: RequestInit) {
  const qs = buildQuery(params);
  const res = await apiFetch<PublicClinic[]>(`/public/clinics${qs ? `?${qs}` : ''}`, fetchOptions);
  return { items: res.data, meta: res.meta as PaginationMeta | undefined };
}

export async function getClinicBySlug(slug: string, fetchOptions?: RequestInit): Promise<PublicClinic | null> {
  try {
    const res = await apiFetch<PublicClinic>(`/public/clinics/${slug}`, fetchOptions);
    return res.data;
  } catch {
    return null;
  }
}

export async function getClinicFilterOptions(fetchOptions?: RequestInit): Promise<PublicClinicFilterOptions> {
  try {
    const res = await apiFetch<PublicClinicFilterOptions>('/public/clinics/filters', fetchOptions);
    return res.data;
  } catch {
    return { cityCorporations: [], areas: [], districts: [], services: [], animalTypes: [], facilityTypes: [] };
  }
}
