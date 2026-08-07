// Pure, DOM/network-free decision logic for what the post-booking-creation
// screen shows. Extracted (same convention as hold-state.ts, booking-flow.ts)
// so the online-advance policy — a booking is never presented as confirmed,
// and the customer is never told to pay the BDT 500 advance at the clinic,
// until the backend has actually verified the advance payment — is testable
// without rendering the page, and cannot silently regress to the previous
// "Booking Confirmed! ... please pay the advance at the clinic" copy that
// contradicted the approved online-advance-required policy.

export type BookingConfirmationStatus = 'pending_payment' | 'confirmed' | (string & {});

export interface BookingConfirmationCopyInput {
  status: BookingConfirmationStatus;
}

export interface BookingConfirmationCopy {
  /** 'confirmed' only once the backend has verified the BDT 500 advance (SpayBooking.status === 'confirmed'). Every other status — most commonly 'pending_payment', including when paymentGatewayUnavailable was true — renders as 'pending'. */
  variant: 'confirmed' | 'pending';
  titleEn: string;
  messageEn: string;
  messageBn: string;
  /** Payment Pending screen only — a confirmed booking has nothing left to pay online. */
  showRetryPayment: boolean;
}

const PENDING_MESSAGE_EN =
  'Your booking request has been saved, but the time slot is not confirmed until the BDT 500 online advance is paid.';
const PENDING_MESSAGE_BN =
  'আপনার বুকিং অনুরোধ সংরক্ষিত হয়েছে। তবে অনলাইনে ৫০০ টাকা অগ্রিম পরিশোধ না হওয়া পর্যন্ত সময়টি নিশ্চিত হবে না।';

/**
 * Deliberately status-driven, not paymentGatewayUnavailable-driven: the
 * approved policy is "confirmed only after successful advance payment",
 * full stop — whether the reason payment hasn't happened yet is EPS being
 * unconfigured, initiation failing, or the customer simply not having paid
 * yet is irrelevant to what copy is safe to show. Any status other than
 * the canonical 'confirmed' must render the payment-pending copy, never
 * "Booking Confirmed" and never an instruction to pay at the clinic.
 *
 * showRetryPayment is tied specifically to 'pending_payment' — never a
 * blanket "anything that isn't confirmed" — so a genuinely
 * expired/cancelled booking (slot already released) is never offered a
 * Retry that the server would just refuse (SPAY_BOOKING_NOT_PAYABLE). The
 * only caller today (handleSubmit's immediate createSpayBooking response)
 * can only ever produce 'confirmed' or 'pending_payment' fresh off
 * creation, but this function is the shared, independently-tested policy
 * — it must stay correct for any status, not just the ones its current
 * caller happens to pass.
 */
export function resolveBookingConfirmationCopy(input: BookingConfirmationCopyInput): BookingConfirmationCopy {
  if (input.status === 'confirmed') {
    return {
      variant: 'confirmed',
      titleEn: 'Booking Confirmed',
      messageEn: 'Your BDT 500 online advance payment was successful — this time slot is confirmed.',
      messageBn: 'আপনার ৫০০ টাকা অনলাইন অগ্রিম পরিশোধ সফল হয়েছে — এই সময়টি নিশ্চিত করা হয়েছে।',
      showRetryPayment: false,
    };
  }
  return {
    variant: 'pending',
    titleEn: 'Booking Created — Payment Pending',
    messageEn: PENDING_MESSAGE_EN,
    messageBn: PENDING_MESSAGE_BN,
    showRetryPayment: input.status === 'pending_payment',
  };
}

/** balanceDueBdt at booking creation is always totalPriceBdt - advanceBdt (see computeBookingPrice on the API) — recomputed here only for display, never trusted as an authorization amount. */
export function computeAmountDueAtClinic(totalPriceBdt: number, advanceBdt: number): number {
  return Math.max(0, totalPriceBdt - advanceBdt);
}

export type RetryPaymentErrorCode =
  | 'PAYMENT_GATEWAY_UNAVAILABLE'
  | 'PAYMENT_INITIATION_FAILED'
  | 'SPAY_PAYMENT_WINDOW_EXPIRED'
  | 'SPAY_BOOKING_NOT_PAYABLE'
  | (string & {});

const RETRY_PAYMENT_ERROR_MESSAGES: Record<string, string> = {
  PAYMENT_GATEWAY_UNAVAILABLE: 'Online payment is not configured in this environment yet. Please check back soon or contact support.',
  PAYMENT_INITIATION_FAILED: 'Could not start the payment. Please try again in a moment.',
  SPAY_PAYMENT_WINDOW_EXPIRED: 'The payment window for this booking has expired. Please book a new time.',
  SPAY_BOOKING_NOT_PAYABLE: 'This booking is no longer awaiting payment.',
};

/** Maps a typed retry-payment error code to a specific, actionable message — never the generic "An unexpected error occurred" banner. */
export function resolveRetryPaymentErrorMessage(code: string | undefined, fallbackMessage: string): string {
  if (code && RETRY_PAYMENT_ERROR_MESSAGES[code]) return RETRY_PAYMENT_ERROR_MESSAGES[code];
  return fallbackMessage || 'Could not start the payment. Please try again.';
}
