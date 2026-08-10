import { apiFetch } from '@/lib/api';
import type { PaginationMeta } from '@/types/bpa.types';

// Mirrors bpa_api's GET /public/documents — the full, paginated public
// governance/document catalog. Only ever returns documents the backend
// considers explicitly published (isActive + a past publishedAt); never
// exposes drafts or internal documents.

export type PublicDocumentCategory = 'LEGAL' | 'GOVERNANCE' | 'FINANCIAL' | 'POLICY' | 'OTHER';

export interface PublicDocument {
  id: string;
  key: string;
  title: string;
  category: PublicDocumentCategory;
  summary: string | null;
  url: string | null;
  version: string | null;
  publishedAt: string | null;
}

export async function getPublicDocuments(
  params: { category?: PublicDocumentCategory; page?: number; limit?: number } = {},
  fetchOptions?: RequestInit,
): Promise<{ items: PublicDocument[]; meta?: PaginationMeta }> {
  const q = new URLSearchParams();
  if (params.category) q.set('category', params.category);
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  const qs = q.toString();

  try {
    const res = await apiFetch<PublicDocument[]>(`/public/documents${qs ? `?${qs}` : ''}`, fetchOptions);
    return { items: res.data, meta: res.meta as PaginationMeta | undefined };
  } catch {
    return { items: [] };
  }
}
