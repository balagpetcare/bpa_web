/**
 * Validates that a payment gateway redirect URL is safe to assign to window.location.
 * Blocks unsafe protocols like javascript:, data:, and file:.
 */
export function assertSafePaymentUrl(url: string): void {
  const lowercaseUrl = url.trim().toLowerCase();
  if (
    lowercaseUrl.startsWith('javascript:') ||
    lowercaseUrl.startsWith('data:') ||
    lowercaseUrl.startsWith('file:')
  ) {
    throw new Error(
      'Payment gateway returned an invalid or unsafe redirect URL. Please contact support.',
    );
  }
}
