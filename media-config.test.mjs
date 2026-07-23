import assert from 'node:assert/strict';
import test from 'node:test';
import { getAllowedMediaOrigins, getAllowedMapTileOrigins, getContentSecurityPolicy, getRemotePatterns } from './media-config.mjs';

test('media config exposes expected development remote patterns', () => {
  const patterns = getRemotePatterns({
    NODE_ENV: 'development',
    NEXT_PUBLIC_API_BASE_URL: 'http://localhost:4000/api/v1',
  });

  assert.ok(patterns.some((p) => p.hostname === 'localhost' && p.port === '4000' && p.pathname === '/uploads/**'));
  assert.ok(patterns.some((p) => p.hostname === '127.0.0.1' && p.port === '4000' && p.pathname === '/uploads/**'));
  assert.ok(patterns.some((p) => p.hostname === '192.168.10.111' && p.port === '4000' && p.pathname === '/uploads/**'));
  assert.ok(patterns.some((p) => p.hostname === 'images.unsplash.com' && p.pathname === '/**'));
});

test('media config builds CSP with allowed media origins only', () => {
  const origins = getAllowedMediaOrigins({
    NODE_ENV: 'production',
    NEXT_PUBLIC_API_URL: 'https://api.example.com/api/v1',
    NEXT_PUBLIC_MEDIA_CDN_URL: 'https://cdn.example.com',
  });
  const csp = getContentSecurityPolicy({
    NODE_ENV: 'production',
    NEXT_PUBLIC_API_URL: 'https://api.example.com/api/v1',
    NEXT_PUBLIC_MEDIA_CDN_URL: 'https://cdn.example.com',
  });

  assert.ok(origins.includes('https://api.example.com'));
  assert.ok(origins.includes('https://cdn.example.com'));
  assert.match(csp, /script-src 'self' 'unsafe-inline' https:\/\/www\.googletagmanager\.com/);
  assert.match(csp, /style-src 'self' 'unsafe-inline' https:\/\/fonts\.googleapis\.com/);
  assert.match(csp, /connect-src 'self' .*https:\/\/www\.google-analytics\.com/);
  assert.match(csp, /img-src 'self' data: blob: .*https:\/\/images\.unsplash\.com/);
  assert.match(csp, /img-src 'self' data: blob: .*https:\/\/api\.example\.com/);
  assert.match(csp, /img-src 'self' data: blob: .*https:\/\/cdn\.example\.com/);
  assert.doesNotMatch(csp, /img-src 'self' data: blob: .*\*+/);
});

test('map tile origins default to the public OpenStreetMap servers, and the CSP allows them without an API key', () => {
  const origins = getAllowedMapTileOrigins({});
  assert.deepEqual(origins, [
    'https://a.tile.openstreetmap.org',
    'https://b.tile.openstreetmap.org',
    'https://c.tile.openstreetmap.org',
  ]);

  const csp = getContentSecurityPolicy({ NODE_ENV: 'production', NEXT_PUBLIC_API_URL: 'https://api.example.com/api/v1' });
  assert.match(csp, /img-src[^;]*https:\/\/a\.tile\.openstreetmap\.org/);
  assert.match(csp, /img-src[^;]*https:\/\/unpkg\.com/);
});

test('a custom NEXT_PUBLIC_MAP_TILE_URL with the {s} subdomain placeholder is allowed via a CSP wildcard', () => {
  const origins = getAllowedMapTileOrigins({ NEXT_PUBLIC_MAP_TILE_URL: 'https://{s}.tiles.example.com/{z}/{x}/{y}.png' });
  assert.deepEqual(origins, ['https://*.tiles.example.com']);
});

test('a custom NEXT_PUBLIC_MAP_TILE_URL without a subdomain placeholder is allowed as its exact origin', () => {
  const origins = getAllowedMapTileOrigins({ NEXT_PUBLIC_MAP_TILE_URL: 'https://tiles.example.com/{z}/{x}/{y}.png' });
  assert.deepEqual(origins, ['https://tiles.example.com']);
});

test('media config enables Next.js development runtime requirements', () => {
  const csp = getContentSecurityPolicy({
    NODE_ENV: 'development',
    NEXT_PUBLIC_API_URL: 'http://localhost:4000/api/v1',
  });

  assert.match(csp, /script-src 'self' 'unsafe-inline' 'unsafe-eval'/);
  assert.match(csp, /connect-src 'self' .* ws: wss:/);
  assert.match(csp, /worker-src 'self' blob:/);
});
