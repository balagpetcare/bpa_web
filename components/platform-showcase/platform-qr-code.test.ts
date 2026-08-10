import assert from 'node:assert/strict';
import test from 'node:test';
import { createPlatformQrSvg, getRenderablePlatformQrUrl } from './platform-qr-code';

const validInput = {
  destinationUrl: 'https://play.google.com/store/apps/details?id=org.bpa.app',
  isActive: true,
  qrEnabled: true,
};

test('returns the exact canonical URL when the active QR link is valid', () => {
  assert.equal(getRenderablePlatformQrUrl(validInput), validInput.destinationUrl);
});

test('does not render when QR is disabled', () => {
  assert.equal(getRenderablePlatformQrUrl({ ...validInput, qrEnabled: false }), null);
});

test('does not render for an inactive link', () => {
  assert.equal(getRenderablePlatformQrUrl({ ...validInput, isActive: false }), null);
});

test('does not render for an empty URL', () => {
  assert.equal(getRenderablePlatformQrUrl({ ...validInput, destinationUrl: '' }), null);
});

test('does not render for malformed or unsafe URLs', () => {
  assert.equal(getRenderablePlatformQrUrl({ ...validInput, destinationUrl: 'not a url' }), null);
  assert.equal(getRenderablePlatformQrUrl({ ...validInput, destinationUrl: 'javascript:alert(1)' }), null);
  assert.equal(getRenderablePlatformQrUrl({ ...validInput, destinationUrl: 'https://user:secret@example.com' }), null);
});

test('generates a different QR when the canonical URL changes between responses', async () => {
  const first = await createPlatformQrSvg('https://example.com/releases/one');
  const second = await createPlatformQrSvg('https://example.com/releases/two');

  assert.notEqual(first, second);
  assert.match(first, /<svg/);
  assert.match(second, /<svg/);
});
