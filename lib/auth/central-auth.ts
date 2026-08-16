import { getApiOrigin } from '@/lib/utils/api-url';
import { getSafeReturnTo } from './return-to';

const CENTRAL_AUTH_LOGOUT_BASE = 'https://auth.worldpetsassociation.com/auth/logout';

export type CentralAuthMethod = 'google' | 'facebook' | 'instagram' | 'x' | 'email' | 'register';
export type CentralAuthPopupCompletionStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

function appendCentralAuthParams(url: URL, next: string | null | undefined, method?: CentralAuthMethod, flowId?: string): string {
  const returnTo = getSafeReturnTo(next);
  if (returnTo !== '/') {
    url.searchParams.set('returnTo', returnTo);
  }
  if (method) {
    url.searchParams.set('method', method);
  }
  if (flowId) {
    url.searchParams.set('flowId', flowId);
  }
  return url.toString();
}

export function buildCentralAuthStartUrl(next: string | null | undefined, method?: CentralAuthMethod, flowId?: string): string {
  const url = new URL(`${getApiOrigin()}/api/v1/auth/central-auth/start`);
  return appendCentralAuthParams(url, next, method, flowId);
}

export function buildCentralAuthPopupStartUrl(next: string | null | undefined, method?: CentralAuthMethod, flowId?: string): string {
  const url = new URL(`${getApiOrigin()}/api/v1/auth/central-auth/popup/start`);
  return appendCentralAuthParams(url, next, method, flowId);
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

export async function fetchCentralAuthPopupCompletionStatus(
  flowId: string,
  completionToken: string,
): Promise<CentralAuthPopupCompletionStatus> {
  const url =
    typeof window === 'undefined'
      ? new URL(`${getApiOrigin()}/api/v1/auth/central-auth/popup/completion`)
      : new URL('/api/auth/popup-completion', window.location.origin);
  url.searchParams.set('flowId', flowId);
  url.searchParams.set('completion', completionToken);

  const response = await fetch(url.toString(), {
    cache: 'no-store',
    headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
  });
  if (!response.ok) {
    throw new Error(`lookup_http_${response.status}`);
  }

  const body = await response.json().catch(() => null) as { data?: { status?: CentralAuthPopupCompletionStatus } } | null;
  const status = body?.data?.status;
  if (status !== 'PENDING' && status !== 'SUCCESS' && status !== 'FAILED') {
    throw new Error('Popup completion status response was invalid');
  }
  return status;
}
