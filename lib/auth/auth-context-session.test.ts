import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const authContextSource = readFileSync(resolve(process.cwd(), 'context/AuthContext.tsx'), 'utf8');
const signInSource = readFileSync(resolve(process.cwd(), 'app/auth/sign-in/page.tsx'), 'utf8');

test('AuthProvider refreshes the authoritative server session on mount instead of inspecting HttpOnly cookies', () => {
  assert.match(authContextSource, /void refreshUser\(\);/);
  assert.match(authContextSource, /fetch\('\/api\/auth\/me'/);
  assert.doesNotMatch(authContextSource, /document\.cookie/);
  assert.doesNotMatch(authContextSource, /hasAuthCookie/);
  assert.doesNotMatch(authContextSource, /apiFetch<[\s\S]*\/auth\/me/);
});

test('trusted popup success refreshes BPA auth state and invalidates the current route before navigation', () => {
  assert.match(signInSource, /authenticated = Boolean\(await refreshUser\(\)\);/);
  assert.match(signInSource, /await reconcilePopupAuthentication\('completion_signal'\);/);
  assert.match(signInSource, /window\.setTimeout\(\(\) => router\.refresh\(\), 0\);/);
  assert.match(signInSource, /router\.replace\(destination\);/);
  assert.match(signInSource, /isTrustedCentralAuthPopupEvent/);
  assert.match(signInSource, /parseCentralAuthPopupStorageEvent/);
});

test('sign-in page redirects away when the authoritative auth state is already authenticated', () => {
  assert.match(signInSource, /if \(authLoading \|\| !user\) return;/);
  assert.match(signInSource, /navigateAfterAuth\(\);/);
});

test('popup close polling re-checks the authoritative session before showing cancellation', () => {
  assert.match(signInSource, /popupRef\.current\?\.closed/);
  assert.match(signInSource, /flowStateRef\.current = 'RECONCILING_SESSION';/);
  assert.match(signInSource, /await reconcilePopupAuthentication\('popup_closed'\);/);
  assert.match(signInSource, /attempt >= POPUP_RECONCILIATION_ATTEMPTS/);
  assert.match(signInSource, /The authentication window was closed before sign-in completed/);
});

test('popup success is a synchronous state transition that close polling cannot overwrite', () => {
  assert.match(signInSource, /type PopupFlowState =/);
  assert.match(signInSource, /'RECONCILING_SESSION'/);
  assert.match(signInSource, /flowStateRef\.current = 'SUCCESS_RECEIVED';/);
  assert.match(signInSource, /flowStateRef\.current = 'REFRESHING_SESSION';/);
  assert.match(signInSource, /flowStateRef\.current !== 'WAITING'/);
  assert.match(signInSource, /flowStateRef\.current = 'AUTHENTICATED';/);
});

test('post-login navigation never leaves an authenticated user stranded on sign-in', () => {
  assert.match(signInSource, /destination === '\/auth\/sign-in'/);
  assert.match(signInSource, /window\.location\.pathname === '\/auth\/sign-in'/);
  assert.match(signInSource, /window\.location\.replace\(destination\)/);
});

test('stale popup WindowProxy starts bounded session reconciliation instead of immediate cancellation', () => {
  assert.match(signInSource, /const POPUP_RECONCILIATION_ATTEMPTS = 12;/);
  assert.match(signInSource, /const POPUP_RECONCILIATION_INTERVAL_MS = 1_000;/);
  assert.match(signInSource, /successSignalReceivedRef\.current/);
  assert.match(signInSource, /consumeCentralAuthPopupStorageMarker/);
  assert.match(signInSource, /readCentralAuthPopupStorageMarker/);
});

test('trusted popup success that never becomes session-visible is reported as a session load failure, not provider failure', () => {
  assert.match(signInSource, /Sign-in completed, but your session could not be loaded\. Please try again\./);
  assert.doesNotMatch(signInSource, /Sign-in could not be completed\. Please try again\.\);\s*return;\s*\}\s*\n\s*flowStateRef\.current = 'FAILED';/);
});
