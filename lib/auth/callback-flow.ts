import { consumeStoredReturnTo } from './return-to';

/**
 * Resolves what /auth/callback should do once the browser lands back from
 * Central Auth: read (and clear) the stashed return path, refresh the local
 * user state, and always return a safe destination — regardless of whether
 * the refresh succeeds. A failed refresh (network blip, cookie rejected,
 * Central Auth down) must never strand the user on a spinner or throw; the
 * destination route itself is responsible for handling "still not signed
 * in" (e.g. the booking page's own sign-in gate), not this callback page.
 */
export async function completeAuthCallback(refreshUser: () => Promise<void>): Promise<string> {
  const destination = consumeStoredReturnTo();
  try {
    await refreshUser();
  } catch {
    // Swallowed deliberately — see doc comment above.
  }
  return destination;
}
