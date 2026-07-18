import { apiFetch, apiPost, apiDelete } from '../api';
export interface Author {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface Category {
  id: string;
  nameEn: string;
  nameBn: string;
  slug: string;
  description: string | null;
}

export interface VideoCategoryWithCount {
  id: string;
  nameEn: string;
  nameBn: string;
  slug: string;
  description?: string | null;
  publishedVideoCount: number;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  body: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
    email?: string;
  };
}

export interface ContentPost {
  id: string;
  type: 'VIDEO' | 'COMMUNITY_POST' | 'ANNOUNCEMENT' | 'DONATION_STORY' | 'CAMPAIGN_UPDATE' | 'PET_CARE_TIP';
  titleEn: string;
  titleBn: string;
  slug: string;
  summaryEn: string | null;
  summaryBn: string | null;
  bodyEn: string | null;
  bodyBn: string | null;
  coverImageUrl: string | null;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  videoProvider: string | null;
  videoSourceType?: 'youtube' | 'vimeo' | 'upload';
  videoFileUrl?: string | null;
  videoFileKey?: string | null;
  videoPosterUrl?: string | null;
  status: string;
  categoryId: string | null;
  tags: string[];
  allowComments: boolean;
  showOnHomepage: boolean;
  isFeatured: boolean;
  isPinned: boolean;
  homepagePriority: number;
  ctaLabelEn: string | null;
  ctaLabelBn: string | null;
  ctaUrl: string | null;
  ctaType: string | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  liked?: boolean;
  category?: Category | null;
  createdBy?: Author | null;
  comments?: Comment[];
}

export interface ContentHomepage {
  featuredVideos: ContentPost[];
  communityPosts: ContentPost[];
}

export async function getContentHomepage() {
  const res = await apiFetch<ContentHomepage>('/public/content/homepage', { cache: 'no-store' });
  return res.data;
}

export async function getPublicVideoCategories() {
  const res = await apiFetch<VideoCategoryWithCount[]>(`/public/video-categories`, { cache: 'no-store' });
  return res.data || [];
}

export async function getPublicVideos(params?: { page?: number; limit?: number; q?: string; categorySlug?: string; featured?: boolean }) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.q) query.set('q', params.q);
  if (params?.categorySlug) query.set('categorySlug', params.categorySlug);
  if (params?.featured) query.set('featured', 'true');

  const res = await apiFetch<ContentPost[]>(`/public/videos${query.size ? `?${query}` : ''}`, { cache: 'no-store' });
  return res;
}

export async function getPublicVideoDetail(slug: string, headers?: HeadersInit) {
  const res = await apiFetch<ContentPost>(`/public/videos/${slug}`, {
    headers,
    cache: 'no-store',
  });
  return res.data;
}

export async function getPublicCommunityPosts(params?: { page?: number; limit?: number; categoryId?: string; q?: string }) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.categoryId) query.set('categoryId', params.categoryId);
  if (params?.q) query.set('q', params.q);

  const res = await apiFetch<ContentPost[]>(`/public/community${query.size ? `?${query}` : ''}`, { cache: 'no-store' });
  return res;
}

export async function getPublicCommunityPostDetail(slug: string, headers?: HeadersInit) {
  const res = await apiFetch<ContentPost>(`/public/community/${slug}`, {
    headers,
    cache: 'no-store',
  });
  return res.data;
}

// Authenticated interactions
export async function toggleLikePost(postId: string, like: boolean) {
  const res = await apiPost<{ postId: string; likeCount: number; liked: boolean }>(
    `/content/posts/${postId}/${like ? 'like' : 'unlike'}`,
    {}
  );
  return res.data;
}

export async function addPostComment(postId: string, body: string) {
  const res = await apiPost<Comment>(`/content/posts/${postId}/comments`, { body });
  return res.data;
}

export async function reportContent(payload: { postId?: string; commentId?: string; reason: string }) {
  const res = await apiPost<{ success: boolean }>('/content/report', payload);
  return res.data;
}

export async function deletePostComment(commentId: string) {
  const res = await apiDelete<{ success: boolean }>(`/content/comments/${commentId}`);
  return res.data;
}
