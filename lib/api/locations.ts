import { apiFetch } from '@/lib/api';

export type LocationNodeType =
  | 'DIVISION' | 'DISTRICT' | 'UPAZILA' | 'THANA' | 'UNION' | 'POURASHAVA'
  | 'CITY_CORPORATION' | 'CITY_ZONE' | 'WARD' | 'AREA';

export interface LocationNode {
  id: string;
  parentId: string | null;
  type: LocationNodeType;
  nameEn: string;
  nameBn: string | null;
  slug: string;
  code: string | null;
  isActive: boolean;
}

// Bangladesh administrative tree (Division -> District -> Upazila/City
// Corporation -> Union/City Zone -> Ward), seeded in location_nodes.
export async function getLocationChildren(
  parentId: string | null,
  type?: LocationNodeType,
): Promise<LocationNode[]> {
  const q = new URLSearchParams();
  q.set('parentId', parentId ?? 'null');
  if (type) q.set('type', type);
  const res = await apiFetch<LocationNode[]>(`/public/locations?${q.toString()}`);
  return res.data;
}
