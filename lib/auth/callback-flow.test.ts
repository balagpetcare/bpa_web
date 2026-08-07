import assert from 'node:assert/strict';
import test from 'node:test';

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

test('successful login return: refreshUser resolves and the stashed destination is returned', async () => {
  await withMockedWindow(async () => {
    const { storeReturnToForRedirectFlow } = await import('./return-to');
    const { completeAuthCallback } = await import('./callback-flow');
    storeReturnToForRedirectFlow('/spay-neuter/offer-1/book?service=neuter&clinic=c1&date=2026-08-09&slot=slot-1');

    const destination = await completeAuthCallback(async () => {});
    assert.equal(destination, '/spay-neuter/offer-1/book?service=neuter&clinic=c1&date=2026-08-09&slot=slot-1');
  });
});

test('session refresh failure: a rejected refreshUser never throws out of the callback and still returns a destination', async () => {
  await withMockedWindow(async () => {
    const { storeReturnToForRedirectFlow } = await import('./return-to');
    const { completeAuthCallback } = await import('./callback-flow');
    storeReturnToForRedirectFlow('/spay-neuter/offer-1/book');

    const destination = await completeAuthCallback(async () => { throw new Error('network down'); });
    assert.equal(destination, '/spay-neuter/offer-1/book');
  });
});

test('invalid returnTo rejection: an external/protocol-relative stashed value never survives as the destination', async () => {
  await withMockedWindow(async () => {
    const { storeReturnToForRedirectFlow } = await import('./return-to');
    const { completeAuthCallback } = await import('./callback-flow');
    storeReturnToForRedirectFlow('https://evil.example.com/phish');

    const destination = await completeAuthCallback(async () => {});
    assert.equal(destination, '/');
  });
});

test('duplicate callback protection: consuming the stashed return path twice only replays it once, falling back afterwards', async () => {
  await withMockedWindow(async () => {
    const { storeReturnToForRedirectFlow } = await import('./return-to');
    const { completeAuthCallback } = await import('./callback-flow');
    storeReturnToForRedirectFlow('/spay-neuter/offer-1/book');

    const first = await completeAuthCallback(async () => {});
    const second = await completeAuthCallback(async () => {});
    assert.equal(first, '/spay-neuter/offer-1/book');
    assert.equal(second, '/'); // single-use — a second, duplicate callback invocation can't replay the same destination
  });
});
