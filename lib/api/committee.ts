import { apiFetch } from '@/lib/api';
import type { CommitteeMember } from '@/types/bpa.types';

export async function getCommitteeMembers(fetchOptions?: RequestInit): Promise<CommitteeMember[]> {
  const res = await apiFetch<CommitteeMember[]>(
    '/admin/committee/public?isActive=true',
    fetchOptions,
  );
  return res.data;
}
