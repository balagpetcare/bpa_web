import assert from 'node:assert/strict';
import test from 'node:test';
import { consumeStoredReturnTo, getSafeReturnTo, withReturnTo } from './return-to';

class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string) { return this.store.has(key) ? this.store.get(key)! : null; }
  setItem(key: string, value: string) { this.store.set(key, value); }
  removeItem(key: string) { this.store.delete(key); }
}

function withMockedWindow<T>(run: () => Promise<T>): Promise<T> {
  const original = (global as unknown as { window?: unknown }).window;
  (global as unknown as { window: unknown }).window = { sessionStorage: new MemoryStorage() };
  return run().finally(() => {
    (global as unknown as { window: unknown }).window = original;
  });
}

test('getSafeReturnTo accepts a plain relative path', () => {
  assert.equal(getSafeReturnTo('/spay-neuter/offer-1/book'), '/spay-neuter/offer-1/book');
});

test('getSafeReturnTo accepts a relative path with a query string', () => {
  assert.equal(getSafeReturnTo('/spay-neuter/offer-1/book?service=NEUTER&clinic=abc'), '/spay-neuter/offer-1/book?service=NEUTER&clinic=abc');
});

test('getSafeReturnTo falls back on a missing/empty value', () => {
  assert.equal(getSafeReturnTo(null), '/');
  assert.equal(getSafeReturnTo(undefined), '/');
  assert.equal(getSafeReturnTo(''), '/');
  assert.equal(getSafeReturnTo('  '), '/'); // whitespace-only rejected by the embedded-whitespace check
});

test('getSafeReturnTo rejects an absolute URL (open redirect)', () => {
  assert.equal(getSafeReturnTo('https://evil.example.com/phish'), '/');
  assert.equal(getSafeReturnTo('http://evil.example.com'), '/');
});

test('getSafeReturnTo rejects a protocol-relative URL (open redirect)', () => {
  assert.equal(getSafeReturnTo('//evil.example.com'), '/');
});

test('getSafeReturnTo rejects a backslash variant some browsers treat as protocol-relative', () => {
  assert.equal(getSafeReturnTo('/\\evil.example.com'), '/');
});

test('getSafeReturnTo rejects an embedded scheme anywhere in the value', () => {
  assert.equal(getSafeReturnTo('/redirect?to=javascript://alert(1)'), '/');
});

test('getSafeReturnTo rejects embedded whitespace/newlines used to smuggle a scheme past a naive check', () => {
  assert.equal(getSafeReturnTo('/\n//evil.example.com'), '/');
  assert.equal(getSafeReturnTo('/\t/evil.example.com'), '/');
});

test('getSafeReturnTo respects a custom fallback', () => {
  assert.equal(getSafeReturnTo('https://evil.example.com', '/dashboard'), '/dashboard');
});

test('withReturnTo appends next as a query param when it is not the default', () => {
  assert.equal(withReturnTo('/auth/sign-up', '/spay-neuter/offer-1/book'), '/auth/sign-up?next=%2Fspay-neuter%2Foffer-1%2Fbook');
});

test('withReturnTo leaves the path untouched when next is missing or the root default', () => {
  assert.equal(withReturnTo('/auth/sign-up', null), '/auth/sign-up');
  assert.equal(withReturnTo('/auth/sign-up', '/'), '/auth/sign-up');
});

test('storeReturnToForRedirectFlow/consumeStoredReturnTo round-trips a safe path across the OAuth redirect boundary', async () => {
  await withMockedWindow(async () => {
    const { storeReturnToForRedirectFlow, consumeStoredReturnTo } = await import('./return-to');
    storeReturnToForRedirectFlow('/spay-neuter/offer-1/book?service=neuter');
    assert.equal(consumeStoredReturnTo(), '/spay-neuter/offer-1/book?service=neuter');
  });
});

test('consumeStoredReturnTo is single-use: a second read after the first falls back to the default', async () => {
  await withMockedWindow(async () => {
    const { storeReturnToForRedirectFlow, consumeStoredReturnTo } = await import('./return-to');
    storeReturnToForRedirectFlow('/spay-neuter/offer-1/book');
    assert.equal(consumeStoredReturnTo(), '/spay-neuter/offer-1/book');
    assert.equal(consumeStoredReturnTo(), '/');
  });
});

test('storeReturnToForRedirectFlow never persists an unsafe value — it is sanitized before being stashed, not just on read', async () => {
  await withMockedWindow(async () => {
    const { storeReturnToForRedirectFlow, consumeStoredReturnTo } = await import('./return-to');
    storeReturnToForRedirectFlow('https://evil.example.com/phish');
    assert.equal(consumeStoredReturnTo(), '/');
  });
});

test('consumeStoredReturnTo is safe with no window/sessionStorage available (SSR-style call)', () => {
  assert.equal(consumeStoredReturnTo(), '/');
});
