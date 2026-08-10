import assert from 'node:assert/strict';
import test from 'node:test';
import { findPublicPlatform, selectCanonicalPlatformShowcase, type PublicHomepageContract } from './public-homepage';

const contract = { platformShowcases: [{ key: 'digital-ecosystem', items: [{ platformKey: 'furtail' }] }] } as unknown as PublicHomepageContract;

test('findPublicPlatform resolves a stable platform key from the canonical contract', () => {
  assert.equal(findPublicPlatform(contract, 'furtail')?.item.platformKey, 'furtail');
});

test('findPublicPlatform rejects missing and malformed keys', () => {
  assert.equal(findPublicPlatform(contract, 'draft-platform'), null);
  assert.equal(findPublicPlatform(contract, '../furtail'), null);
  assert.equal(findPublicPlatform(null, 'furtail'), null);
});

test('selectCanonicalPlatformShowcase prefers the digital ecosystem section over unrelated showcases', () => {
  const showcase = selectCanonicalPlatformShowcase([
    { key: 'platform-showcase-e2e', items: [{ platformKey: 'platform-e2e' }] } as never,
    { key: 'digital-ecosystem', items: [{ platformKey: 'bpa-app' }] } as never,
  ]);

  assert.equal(showcase?.key, 'digital-ecosystem');
  assert.equal(showcase?.items[0]?.platformKey, 'bpa-app');
});
