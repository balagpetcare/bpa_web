/**
 * Returns the bare API origin — no trailing slash, no /api/v1 suffix.
 *
 * Handles two common env-var patterns:
 *   NEXT_PUBLIC_API_URL=https://api.bangladeshpetassociation.com          → kept as-is
 *   NEXT_PUBLIC_API_URL=https://api.bangladeshpetassociation.com/api/v1   → suffix stripped
 */
export function getApiOrigin(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'https://api.bangladeshpetassociation.com';

  return raw.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
}

export function getValidationSlipUrl(bookingRef: string): string {
  return `${getApiOrigin()}/api/v1/public/bookings/${encodeURIComponent(bookingRef)}/validation-slip.pdf`;
}

export function getPublicApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getApiOrigin()}/api/v1${normalizedPath}`;
}
