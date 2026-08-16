import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const source = readFileSync(resolve(process.cwd(), 'app/auth/sign-in/page.tsx'), 'utf8');

test('BPA sign-in page renders enterprise method choices without technical intermediary copy', () => {
  assert.match(source, /Sign in to Bangladesh Pet Association/);
  assert.match(source, /Continue securely with your WPA account/);
  assert.match(source, /label: 'Google'/);
  assert.match(source, /label: 'Facebook'/);
  assert.match(source, /label: 'Instagram'/);
  assert.match(source, /label: 'X'/);
  assert.match(source, /Continue with \$\{provider\.label\}/);
  assert.match(source, /Continue with Email/);
  assert.match(source, /Create account/);
  assert.match(source, /Secured by World Pets Association/);

  assert.doesNotMatch(source, /Open Secure Popup/);
  assert.doesNotMatch(source, /Use Full-Page Sign-In/);
  assert.doesNotMatch(source, /What to expect/);
  assert.doesNotMatch(source, /OTP/i);
  assert.doesNotMatch(source, /phone sign-in/i);
  assert.doesNotMatch(source, /type="password"/);
});

test('BPA sign-in provider choices route through WPA-managed Central Auth start, never provider domains', () => {
  assert.match(source, /buildCentralAuthPopupStartUrl\(next, method, flowId\)/);
  assert.match(source, /buildCentralAuthStartUrl\(next, method, flowId\)/);
  assert.doesNotMatch(source, /accounts\.google\.com/);
  assert.doesNotMatch(source, /facebook\.com\/.*oauth/);
  assert.doesNotMatch(source, /api\.instagram\.com\/oauth/);
  assert.doesNotMatch(source, /x\.com\/i\/oauth2/);
});
