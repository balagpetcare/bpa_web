/**
 * Normalizes EPS payment gateway query params.
 *
 * EPS documentation is inconsistent across SDK versions — the merchant
 * transaction ID may arrive under any of several param names. This module
 * provides a single normalization point for both the backend callback router
 * and the frontend success/failed pages.
 */

export interface NormalizedPaymentParams {
  /** 17-digit merchant transaction ID when found in any known EPS param name. */
  txn: string | null;
  /** Fallback order/reference ID (payment UUID or booking ref) when txn is absent. */
  ref: string | null;
  /** Failure reason string from the backend redirect. */
  reason: string | null;
  /** Campaign booking number (BPA-BK-...) when included in the redirect URL. */
  booking: string | null;
}

// All param names EPS may use for the merchant transaction ID
const TXN_PARAM_NAMES = [
  'txn',
  'merchantTransactionId',
  'merchantTxnId',
  'transactionId',
  'transaction_id',
  'epwTxnId',
  'paymentRefId',
  'payment_ref_id',
] as const;

// Param names that may carry a fallback order/reference ID
const REF_PARAM_NAMES = [
  'ref',
  'orderId',
  'customerOrderId',
  'reference',
  'bookingRef',
] as const;

const MERCHANT_TXN_RE = /^\d{17}$/;

type SearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | null {
  if (!v) return null;
  return (Array.isArray(v) ? v[0] : v) ?? null;
}

export function normalizePaymentParams(params: SearchParams): NormalizedPaymentParams {
  // Try to find a 17-digit merchant transaction ID first (strict format)
  let txn: string | null = null;
  for (const name of TXN_PARAM_NAMES) {
    const val = first(params[name]);
    if (val && MERCHANT_TXN_RE.test(val)) { txn = val; break; }
  }
  // If strict match failed, accept any non-empty value from TXN params as a loose txn
  // (handles future EPS format changes gracefully)
  if (!txn) {
    for (const name of TXN_PARAM_NAMES) {
      const val = first(params[name])?.trim();
      if (val) { txn = val; break; }
    }
  }

  // Extract order/reference ID for display when txn is absent
  let ref: string | null = null;
  for (const name of REF_PARAM_NAMES) {
    const val = first(params[name])?.trim();
    if (val) { ref = val; break; }
  }

  const reason = first(params['reason'])?.trim() ?? null;
  const booking = first(params['booking'])?.trim() ?? null;

  if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG_PAYMENT === '1') {
    // Log received key names only — never log values to avoid leaking payment data
    const keys = Object.keys(params).join(', ') || '(none)';
    console.log(`[payment-page] Query keys received: ${keys} | txn=${txn ? 'found' : 'missing'} ref=${ref ? 'found' : 'missing'} booking=${booking ? 'found' : 'missing'}`);
  }

  return { txn, ref, reason, booking };
}
