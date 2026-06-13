import { apiFetch } from '@/lib/api';
import type { NewsListItem, NewsArticle, PaginationMeta } from '@/types/bpa.types';

export interface NewsListParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isFeatured?: boolean;
}

export async function getNewsList(params: NewsListParams = {}, fetchOptions?: RequestInit) {
  const q = new URLSearchParams();
  q.set('status', 'published');
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  if (params.search) q.set('search', params.search);
  if (params.categoryId) q.set('categoryId', params.categoryId);
  if (params.isFeatured !== undefined) q.set('isFeatured', String(params.isFeatured));

  const res = await apiFetch<NewsListItem[]>(`/news/public/news?${q.toString()}`, fetchOptions);
  return { items: res.data, meta: res.meta as PaginationMeta };
}

export async function getNewsBySlug(slug: string, fetchOptions?: RequestInit) {
  const res = await apiFetch<NewsArticle>(`/news/public/news/slug/${slug}`, fetchOptions);
  return res.data;
}
