import { apiPost } from '@/lib/api';
import type { ContactFormData, VolunteerFormData, MembershipFormData } from '@/types/bpa.types';

export async function submitContactForm(data: ContactFormData) {
  const res = await apiPost<{ id: string }>('/contacts/public', data);
  return res.data;
}

export async function submitVolunteerForm(data: VolunteerFormData) {
  const res = await apiPost<{ id: string }>('/volunteers/public', data);
  return res.data;
}

export async function initiateMembershipPayment(data: MembershipFormData) {
  const res = await apiPost<{
    paymentId: string;
    merchantTxnId: string;
    redirectUrl: string;
    amount: number;
    currency: string;
  }>('/membership/public/initiate', data);
  return res.data;
}
