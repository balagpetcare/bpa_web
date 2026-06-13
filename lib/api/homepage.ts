import { apiFetch } from '@/lib/api';
import type { PublicHomepagePayload } from '@/types/bpa.types';

export async function getPublicHomepage(locale = 'en', fetchOptions?: RequestInit) {
  const q = new URLSearchParams({ locale });
  const res = await apiFetch<PublicHomepagePayload>(`/homepage/public?${q.toString()}`, fetchOptions);
  return res.data;
}
