import { apiPost, apiFetch } from '@/lib/api';

export interface ContactInquiryConfig {
  types: { id: string; slug: string; labelEn: string; labelBn?: string }[];
  categories: { id: string; slug: string; labelEn: string; labelBn?: string }[];
}

export interface SubmitInquiryPayload {
  contactTypeId?: string;
  categoryId?: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  country?: string;
  city?: string;
  organizationName?: string;
  designation?: string;
  website?: string;
  subject: string;
  message: string;
  attachmentUrl?: string;
  consentGiven: boolean;
}

export function getContactInquiryConfig() {
  return apiFetch<ContactInquiryConfig>('/public/contact-inquiries/config');
}

export function submitContactInquiry(data: SubmitInquiryPayload) {
  return apiPost<{ id: string; ticketNumber: string; message: string }>('/public/contact-inquiries', data);
}
