/**
 * EPS gateway domains that are valid redirect targets for payment flows.
 * Extend this list if EPS adds new domains (e.g., regional gateways).
 */
const ALLOWED_PAYMENT_DOMAINS = [
  'https://pg.eps.com.bd',
  'https://sandbox.eps.com.bd',
];

/**
 * Validates that a payment gateway redirect URL originates from an approved EPS domain.
 * Throws a user-visible error if the URL is not on the allowlist.
 */
export function assertSafePaymentUrl(url: string): void {
  const isAllowed = ALLOWED_PAYMENT_DOMAINS.some((domain) =>
    url.startsWith(domain + '/') || url === domain,
  );
  if (!isAllowed) {
    throw new Error(
      'Payment gateway returned an unexpected redirect URL. Please contact support.',
    );
  }
}
