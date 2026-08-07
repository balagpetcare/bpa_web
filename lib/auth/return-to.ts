// Validates a `next`/`returnTo` query value before ever using it in a
// redirect — prevents an open redirect through that parameter. Only a
// same-site, relative path is ever accepted; anything that could send the
// user off-site (absolute URL, protocol-relative //host, an embedded
// scheme, or control characters used to smuggle one past a naive check)
// is rejected in favor of the given fallback.
export function getSafeReturnTo(raw: string | null | undefined, fallback = '/'): string {
  if (!raw) return fallback;
  const value = raw.trim();

  if (!value.startsWith('/')) return fallback; // must be relative
  if (value.startsWith('//')) return fallback; // protocol-relative — resolves to an external host
  if (value.startsWith('/\\')) return fallback; // some browsers treat /\ as //
  if (/[\s\r\n\t]/.test(value)) return fallback; // no embedded whitespace/newlines
  if (/^\/[^/]*:/i.test(value)) return fallback; // rejects things like "/\tjavascript:" after trim quirks — defense in depth
  if (value.includes('://')) return fallback; // no embedded scheme anywhere in the path

  return value;
}

/** Appends `next` (already validated by getSafeReturnTo at the point it was read) onto an auth route — used so switching between sign-in and sign-up never loses the caller's intended return destination. */
export function withReturnTo(path: string, next: string | null | undefined): string {
  if (!next || next === '/') return path;
  const qs = new URLSearchParams({ next });
  return `${path}?${qs.toString()}`;
}

// The Central Auth OAuth round-trip (bpa_web -> bpa_api /oauth/:provider/start
// -> external provider -> bpa_api /oauth/:provider/callback -> bpa_web
// /auth/callback) is entirely outside bpa_web's control once the browser
// leaves for the API, and the API's callback redirect is hardcoded to
// `/auth/callback` with no return-path passthrough. A same-site sessionStorage
// slot is the only way to carry the caller's intended destination across that
// trip without adding it to the URL (which Central Auth would then have to
// forward, and which would otherwise sit in browser history/referrer headers).
const RETURN_TO_STORAGE_KEY = 'bpa_auth_return_to';

function getSessionStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage ?? null;
  } catch {
    return null; // sessionStorage can throw in some locked-down/private-browsing contexts
  }
}

/** Called right before navigating away to the OAuth start endpoint — stashes an already-validated relative path so /auth/callback can recover it after the round trip. */
export function storeReturnToForRedirectFlow(next: string | null | undefined): void {
  const storage = getSessionStorage();
  if (!storage) return;
  try {
    storage.setItem(RETURN_TO_STORAGE_KEY, getSafeReturnTo(next));
  } catch {
    // no-op — worst case the callback falls back to '/'
  }
}

/** Reads and clears the stashed return path (single-use, so a later unrelated login never replays a stale destination) and re-validates it defensively in case anything tampered with storage in between. */
export function consumeStoredReturnTo(fallback = '/'): string {
  const storage = getSessionStorage();
  if (!storage) return fallback;
  try {
    const value = storage.getItem(RETURN_TO_STORAGE_KEY);
    storage.removeItem(RETURN_TO_STORAGE_KEY);
    return getSafeReturnTo(value, fallback);
  } catch {
    return fallback;
  }
}
