/**
 * Returns the bare API origin — no trailing slash, no /api/v1 suffix.
 *
 * Env-var precedence (first defined wins):
 *   NEXT_PUBLIC_API_BASE_URL  e.g. http://localhost:4000
 *   NEXT_PUBLIC_API_URL       e.g. https://api.bangladeshpetassociation.com
 *                             (trailing /api/v1 stripped automatically)
 *
 * Dev fallback (when no env var is set): http://localhost:4000
 * Prod fallback (last resort):           https://api.bangladeshpetassociation.com
 */
export function getApiOrigin(): string {
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    // Dynamically resolve API URL in browser based on how the user accessed the site
    return `${window.location.protocol}//${window.location.hostname}:4000`;
  }

  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.BACKEND_API_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://api.bangladeshpetassociation.com'
      : 'http://localhost:4000');

  return raw.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
}

export function getValidationSlipUrl(bookingRef: string): string {
  return `${getApiOrigin()}/api/v1/public/bookings/${encodeURIComponent(bookingRef)}/validation-slip.pdf`;
}

export function getDonationReceiptPdfUrl(referenceNo: string, lang?: 'en' | 'bn'): string {
  const base = `${getApiOrigin()}/api/v1/public/donations/receipt/${encodeURIComponent(referenceNo)}/pdf`;
  return lang ? `${base}?lang=${lang}` : base;
}

export function getPublicApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getApiOrigin()}/api/v1${normalizedPath}`;
}
