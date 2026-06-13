import { apiFetch } from '@/lib/api';
import type { EventListItem, EventDetail, PaginationMeta } from '@/types/bpa.types';

export interface EventListParams {
  page?: number;
  limit?: number;
  search?: string;
  upcoming?: boolean;
}

export async function getEventsList(params: EventListParams = {}, fetchOptions?: RequestInit) {
  const q = new URLSearchParams();
  q.set('status', 'published');
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  if (params.search) q.set('search', params.search);
  if (params.upcoming !== undefined) q.set('upcoming', String(params.upcoming));

  const res = await apiFetch<EventListItem[]>(`/events/public?${q.toString()}`, fetchOptions);
  return { items: res.data, meta: res.meta as PaginationMeta };
}

export async function getEventBySlug(slug: string, fetchOptions?: RequestInit) {
  const res = await apiFetch<EventDetail>(`/events/public/slug/${slug}`, fetchOptions);
  return res.data;
}
