import { apiFetch } from '../api';
import type { PetCensusCampaign } from '@/types/bpa.types';

/**
 * Fetch public campaign settings for Pet Census 2026
 */
export async function getPetCensusSettings() {
  const res = await apiFetch<PetCensusCampaign>('/public/pet-census/settings');
  return res.data;
}
