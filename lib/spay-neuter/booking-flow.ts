// Pure, DOM-free helpers for the Spay & Neuter booking wizard's flow shape
// and payload construction. Extracted so the "no pet profile required"
// contract — no Select Pet step, no pet param in the login return path, no
// externalPetId (let alone a placeholder/empty one) in the booking
// payload — is verifiable without rendering the page.

import type { CreateBookingPayload } from '@/lib/api/spay-neuter';

export const BOOKING_STEP_LABELS = ['Procedure', 'Clinic', 'Date & Time', 'Review & Payment'] as const;
export const TOTAL_BOOKING_STEPS = BOOKING_STEP_LABELS.length;

// Medical fitness for surgery is the clinic's pre-operative assessment to
// make, never something the booking form asks the owner to certify — the
// previous wording ("I confirm this pet is fit for surgery") was medically
// inappropriate for exactly that reason and has been replaced.
export const CONSENT_TEXT_EN = 'I confirm that I have reviewed and accept the fasting, cancellation and medical-assessment requirements for this booking.';
export const CONSENT_TEXT_BN = 'আমি এই বুকিংয়ের উপবাস, বাতিলকরণ এবং ক্লিনিকের চিকিৎসা মূল্যায়নের শর্তগুলো পড়েছি ও সম্মতি দিচ্ছি।';

export interface BookingReturnQueryInput {
  procedure?: string;
  clinicBranchId?: string;
  selectedDate?: string;
  slotId?: string;
}

/** Builds the query string carried on the /auth/sign-in `next` return path. Only ever carries the non-sensitive service/clinic/date/slot selection — there is no pet-related input to this function at all, so there is no way for a pet identifier to end up in the URL or in browser history. */
export function buildBookingReturnQuery(input: BookingReturnQueryInput): URLSearchParams {
  const q = new URLSearchParams();
  if (input.procedure) q.set('service', input.procedure);
  if (input.clinicBranchId) q.set('clinic', input.clinicBranchId);
  if (input.selectedDate) q.set('date', input.selectedDate);
  if (input.slotId) q.set('slot', input.slotId);
  return q;
}

export interface BookingContactInput {
  holdId: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
}

/** Builds the booking-creation payload. A registered pet is optional for this module: the payload never includes an `externalPetId` key — not `undefined`, not an empty string, not a generated placeholder UUID — it is simply absent, exactly like the case where a caller never supplies one. */
export function buildBookingPayload(input: BookingContactInput): CreateBookingPayload {
  return {
    holdId: input.holdId,
    contactName: input.contactName.trim(),
    contactPhone: input.contactPhone.trim(),
    contactEmail: input.contactEmail.trim() || undefined,
    consentAccepted: true,
    platform: 'web',
  };
}
