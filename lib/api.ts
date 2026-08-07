import type { ApiResponse } from '@/types/bpa.types';
import { getApiOrigin } from '@/lib/utils/api-url';

// Strip any /api/v1 suffix from the env var so it is never doubled when
// request() appends `/api/v1` below.  getApiOrigin() handles this normalisation.
export const BASE_URL = getApiOrigin();

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
    /** The stable backend error code (e.g. "INVALID_CREDENTIALS", "TOKEN_EXPIRED") — undefined for network-level failures. Callers should branch on this, never on the message string. */
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Thrown when the request never reached the server at all (DNS/connection refused/offline) — distinct from a real HTTP error response, so callers can show "service unreachable" instead of a credentials-shaped message. */
export class ApiNetworkError extends Error {
  constructor(message = 'Could not reach the server') {
    super(message);
    this.name = 'ApiNetworkError';
  }
}

// Endpoints that must never trigger a silent-refresh retry on their own
// 401 — refreshing and re-attempting a failed *login* would just replay
// the same bad credentials; refreshing on /auth/refresh itself would recurse.
const NO_REFRESH_RETRY_PATHS = ['/auth/login', '/auth/register/email', '/auth/refresh', '/auth/mobile/verify-otp'];

// Single-flight guard: several components can hit a 401 for the same
// expired session within the same tick (e.g. /auth/me + /me/pets both
// firing on mount). Without this, each would race its own POST
// /auth/refresh, and the backend's refresh() revokes-then-reissues the
// refresh token — the second racer would try to redeem an already-revoked
// token and fail outright instead of the retry succeeding.
let refreshInFlight: Promise<boolean> | null = null;

async function attemptSilentRefresh(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({}),
        });
        return res.ok;
      } catch {
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

// The backend's error envelope (see bpa_api/src/middlewares/errorHandler.ts)
// nests the real message under `error.message` — { success:false, error:{code,message,details} } —
// never at the top level except for the one legacy ZodError special case that
// also mirrors it as a top-level `message`. Reading only `body.message` (as
// this used to) silently discarded every real backend message — "Invalid
// credentials", lockout copy, verification-required, etc. — and fell back to
// the generic "API request failed" for every single error response.
async function request<T>(
  path: string,
  options?: RequestInit,
  _isRetry = false,
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}/api/v1${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      credentials: 'include',
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    });
  } catch {
    throw new ApiNetworkError();
  }

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const message = body?.error?.message ?? body?.message ?? 'API request failed';
    const code = body?.error?.code;

    // A genuinely expired (not just invalid/absent) access token gets exactly
    // one silent refresh-and-retry — transparent to the caller. Anything
    // else (wrong password, forbidden, not found, ...) is never retried.
    if (res.status === 401 && code === 'TOKEN_EXPIRED' && !_isRetry && !NO_REFRESH_RETRY_PATHS.includes(path)) {
      const refreshed = await attemptSilentRefresh();
      if (refreshed) {
        return request<T>(path, options, true);
      }
    }

    if (code === 'VALIDATION_ERROR') console.error('API VALIDATION DETAILS:', JSON.stringify(body?.error?.details, null, 2));
    throw new ApiError(res.status, message, body, code);
  }

  return body as ApiResponse<T>;
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  return request<T>(path, options);
}

export async function apiPost<T>(
  path: string,
  data: unknown,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  return request<T>(path, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });
}

export async function apiPut<T>(
  path: string,
  data: unknown,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  return request<T>(path, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options,
  });
}

export async function apiDelete<T>(
  path: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  return request<T>(path, {
    method: 'DELETE',
    ...options,
  });
}

