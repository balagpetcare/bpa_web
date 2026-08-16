import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const proxySource = readFileSync(resolve(process.cwd(), 'app/api/auth/me/route.ts'), 'utf8');

test('same-origin auth me proxy forwards only the browser Cookie header to the authoritative BPA API route', () => {
  assert.match(proxySource, /const upstream = new URL\(`\$\{getApiOrigin\(\)\}\/api\/v1\/auth\/me`\)/);
  assert.match(proxySource, /const cookie = request\.headers\.get\('cookie'\)/);
  assert.match(proxySource, /Cookie: cookie/);
  assert.match(proxySource, /cache:\s*'no-store'/);
  assert.doesNotMatch(proxySource, /Authorization:/);
});
