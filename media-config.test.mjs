import assert from 'node:assert/strict';
import test from 'node:test';
import { getAllowedMediaOrigins, getContentSecurityPolicy, getRemotePatterns } from './media-config.mjs';

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

test('media config enables Next.js development runtime requirements', () => {
  const csp = getContentSecurityPolicy({
    NODE_ENV: 'development',
    NEXT_PUBLIC_API_URL: 'http://localhost:4000/api/v1',
  });

  assert.match(csp, /script-src 'self' 'unsafe-inline' 'unsafe-eval'/);
  assert.match(csp, /connect-src 'self' .* ws: wss:/);
  assert.match(csp, /worker-src 'self' blob:/);
});
