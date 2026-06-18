import { apiFetch } from '@/lib/api';
import { DonationImpactStory } from './donations';

export async function getDonationImpactStory(slug: string, options?: RequestInit) {
  const res = await apiFetch(`/public/donations/impact-stories/${slug}`, options);
  return res.data as DonationImpactStory;
}

export async function getImpactStories(options?: RequestInit) {
  const res = await apiFetch('/public/donations/impact-stories', options);
  return res.data as DonationImpactStory[];
}
