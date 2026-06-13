import { apiFetch, apiPost } from '@/lib/api';
import type { CareCardVerifyResult, PetCensusPayload } from '@/types/bpa.types';

export async function verifyCareCard(
  token: string,
  options?: RequestInit,
): Promise<CareCardVerifyResult> {
  const res = await apiFetch<CareCardVerifyResult>(
    `/public/care-partner-cards/verify?token=${encodeURIComponent(token)}`,
    options,
  );
  return res.data;
}

export async function submitPetCensus(data: PetCensusPayload): Promise<{
  id: string;
  duplicateHint?: { possibleDuplicate: boolean };
  message: string;
}> {
  const res = await apiPost<{
    id: string;
    duplicateHint?: { possibleDuplicate: boolean };
    message: string;
  }>('/public/pet-census/submit', data);
  return res.data;
}
