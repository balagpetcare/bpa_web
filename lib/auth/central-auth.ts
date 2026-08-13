import { getApiOrigin } from '@/lib/utils/api-url';
import { getSafeReturnTo } from './return-to';

const CENTRAL_AUTH_LOGOUT_BASE = 'https://auth.worldpetsassociation.com/auth/logout';

export function buildCentralAuthStartUrl(next: string | null | undefined): string {
  const url = new URL(`${getApiOrigin()}/api/v1/auth/central-auth/start`);
  const returnTo = getSafeReturnTo(next);
  if (returnTo !== '/') {
    url.searchParams.set('returnTo', returnTo);
  }
  return url.toString();
}

export function buildCentralAuthLogoutUrl(): string {
  const redirectOrigin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://bangladeshpetassociation.com';
  const url = new URL(CENTRAL_AUTH_LOGOUT_BASE);
  url.searchParams.set('redirect_uri', redirectOrigin);
  return url.toString();
}
