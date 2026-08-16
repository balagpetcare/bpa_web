import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const source = readFileSync(resolve(process.cwd(), 'app/auth/callback/page.tsx'), 'utf8');

test('popup callback resolves trusted server completion before publishing success or failure', () => {
  assert.match(source, /fetchCentralAuthPopupCompletionStatus/);
  assert.match(source, /const completionToken = searchParams\.get\('completion'\)/);
  assert.match(source, /BPA_AUTH_POPUP_COMPLETION_STATUS_RESOLVED/);
  assert.match(source, /if \(status !== 'SUCCESS'\)/);
});

test('popup callback no longer treats one immediate refreshUser miss as authoritative failure', () => {
  assert.doesNotMatch(source, /const authenticated = await refreshUser\(\);/);
  assert.doesNotMatch(source, /if \(!authenticated\) \{\s*postPopupResult\(false\);\s*setFailed\(true\);\s*return;\s*\}/s);
});

test('popup callback still publishes same-origin success and bounded close behavior when opener is null', () => {
  assert.match(source, /postPopupResult\(true\);/);
  assert.match(source, /if \(window\.opener\)/);
  assert.match(source, /ackTimer = window\.setTimeout\(closePopup, 1_250\);/);
  assert.match(source, /Sign-in complete/);
});
