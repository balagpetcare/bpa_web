import test from 'node:test';
import assert from 'node:assert/strict';

test('buildCentralAuthStartUrl preserves only safe internal return paths', async () => {
  process.env.NEXT_PUBLIC_API_URL = 'https://api.bangladeshpetassociation.com/api/v1';
  const {
    buildCentralAuthStartUrl,
    buildCentralAuthPopupStartUrl,
    fetchCentralAuthPopupCompletionStatus,
  } = await import('./central-auth');

  const ok = new URL(buildCentralAuthStartUrl('/profile?tab=bookings'));
  assert.equal(ok.origin, 'https://api.bangladeshpetassociation.com');
  assert.equal(ok.pathname, '/api/v1/auth/central-auth/start');
  assert.equal(ok.searchParams.get('returnTo'), '/profile?tab=bookings');

  const popup = new URL(buildCentralAuthPopupStartUrl('/profile'));
  assert.equal(popup.pathname, '/api/v1/auth/central-auth/popup/start');
  assert.equal(popup.searchParams.get('returnTo'), '/profile');

  const google = new URL(buildCentralAuthPopupStartUrl('/profile', 'google'));
  assert.equal(google.pathname, '/api/v1/auth/central-auth/popup/start');
  assert.equal(google.searchParams.get('method'), 'google');
  assert.equal(google.searchParams.get('returnTo'), '/profile');

  const traced = new URL(buildCentralAuthPopupStartUrl('/profile', 'google', 'flow_123'));
  assert.equal(traced.searchParams.get('flowId'), 'flow_123');

  const email = new URL(buildCentralAuthStartUrl('/account', 'email'));
  assert.equal(email.searchParams.get('method'), 'email');
  assert.equal(email.searchParams.get('returnTo'), '/account');

  const bad = new URL(buildCentralAuthStartUrl('https://evil.example'));
  assert.equal(bad.searchParams.get('returnTo'), null);

  const originalFetch = global.fetch;
  global.fetch = (async () => ({
    ok: true,
    json: async () => ({ data: { status: 'SUCCESS' } }),
  })) as typeof fetch;
  try {
    const status = await fetchCentralAuthPopupCompletionStatus('flow_123', 'signed-token-abc');
    assert.equal(status, 'SUCCESS');
  } finally {
    global.fetch = originalFetch;
  }
});
