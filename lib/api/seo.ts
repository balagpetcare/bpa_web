import { apiFetch } from '@/lib/api';
import type { SeoData } from '@/types/bpa.types';

export async function getSeoData(route: string, fetchOptions?: RequestInit): Promise<SeoData | null> {
  try {
    const res = await apiFetch<SeoData>(`/admin/seo/public/${encodeURIComponent(route)}`, fetchOptions);
    return res.data;
  } catch {
    return null;
  }
}
