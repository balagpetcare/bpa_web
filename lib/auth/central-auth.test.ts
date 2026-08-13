import test from 'node:test';
import assert from 'node:assert/strict';

test('buildCentralAuthStartUrl preserves only safe internal return paths', async () => {
  process.env.NEXT_PUBLIC_API_URL = 'https://api.bangladeshpetassociation.com/api/v1';
  const { buildCentralAuthStartUrl } = await import('./central-auth');

  const ok = new URL(buildCentralAuthStartUrl('/profile?tab=bookings'));
  assert.equal(ok.origin, 'https://api.bangladeshpetassociation.com');
  assert.equal(ok.pathname, '/api/v1/auth/central-auth/start');
  assert.equal(ok.searchParams.get('returnTo'), '/profile?tab=bookings');

  const bad = new URL(buildCentralAuthStartUrl('https://evil.example'));
  assert.equal(bad.searchParams.get('returnTo'), null);
});
