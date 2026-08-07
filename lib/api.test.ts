import assert from 'node:assert/strict';
import test from 'node:test';

process.env.NEXT_PUBLIC_API_URL = 'http://localhost:4000/api/v1';
(global as unknown as { window: unknown }).window = { location: { origin: 'http://localhost:3000' } };

function jsonResponse(status: number, body: unknown): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
  } as Response;
}

function withMockedFetch<T>(handler: (url: string, opts?: RequestInit) => Response | Promise<Response>, run: () => Promise<T>): Promise<T> {
  const original = global.fetch;
  global.fetch = (async (url: string, opts?: RequestInit) => handler(String(url), opts)) as typeof fetch;
  return run().finally(() => {
    global.fetch = original;
  });
}

test('surfaces the nested error.message/error.code from the backend envelope, not the legacy top-level field', async () => {
  const { apiPost, ApiError } = await import('./api');
  await withMockedFetch(
    () => jsonResponse(401, { success: false, requestId: 'req-1', error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } }),
    async () => {
      await assert.rejects(
        () => apiPost('/auth/login', { email: 'a@b.com', password: 'wrong' }),
        (err: unknown) => {
          assert.ok(err instanceof ApiError);
          assert.equal(err.status, 401);
          assert.equal(err.code, 'INVALID_CREDENTIALS');
          assert.equal(err.message, 'Invalid credentials');
          return true;
        },
      );
    },
  );
});

test('falls back to a safe generic message only when the backend gives no message at all', async () => {
  const { apiFetch, ApiError } = await import('./api');
  await withMockedFetch(
    () => jsonResponse(500, {}),
    async () => {
      await assert.rejects(
        () => apiFetch('/some/route'),
        (err: unknown) => {
          assert.ok(err instanceof ApiError);
          assert.equal(err.message, 'API request failed');
          return true;
        },
      );
    },
  );
});

test('a request that never reaches the server throws ApiNetworkError, not a raw fetch error', async () => {
  const { apiFetch, ApiNetworkError } = await import('./api');
  await withMockedFetch(
    () => { throw new TypeError('Failed to fetch'); },
    async () => {
      await assert.rejects(() => apiFetch('/auth/me'), ApiNetworkError);
    },
  );
});

test('never attempts a silent refresh for the login endpoint itself (would just replay bad credentials)', async () => {
  const { apiPost } = await import('./api');
  const calls: string[] = [];
  await withMockedFetch(
    (url) => {
      calls.push(url);
      return jsonResponse(401, { success: false, error: { code: 'TOKEN_EXPIRED', message: 'expired' } });
    },
    async () => {
      await assert.rejects(() => apiPost('/auth/login', { email: 'a@b.com', password: 'x' }));
    },
  );
  assert.equal(calls.filter((u) => u.includes('/auth/refresh')).length, 0);
});

test('silently refreshes and retries exactly once on a genuinely expired session, then returns the retried result', async () => {
  const { apiFetch } = await import('./api');
  const calls: string[] = [];
  await withMockedFetch(
    (url) => {
      calls.push(url);
      if (url.includes('/auth/refresh')) return jsonResponse(200, { success: true, data: {} });
      if (calls.filter((u) => u.includes('/me/pets')).length === 1) {
        return jsonResponse(401, { success: false, error: { code: 'TOKEN_EXPIRED', message: 'expired' } });
      }
      return jsonResponse(200, { success: true, data: [{ id: 'pet-1' }] });
    },
    async () => {
      const res = await apiFetch<{ id: string }[]>('/me/pets');
      assert.deepEqual(res.data, [{ id: 'pet-1' }]);
    },
  );
  assert.equal(calls.filter((u) => u.includes('/auth/refresh')).length, 1);
  assert.equal(calls.filter((u) => u.includes('/me/pets')).length, 2); // original + one retry
});

test('does not retry a second time if the refreshed request 401s again', async () => {
  const { apiFetch, ApiError } = await import('./api');
  await withMockedFetch(
    (url) => {
      if (url.includes('/auth/refresh')) return jsonResponse(200, { success: true, data: {} });
      return jsonResponse(401, { success: false, error: { code: 'TOKEN_EXPIRED', message: 'expired' } });
    },
    async () => {
      await assert.rejects(
        () => apiFetch('/me/pets'),
        (err: unknown) => {
          assert.ok(err instanceof ApiError);
          assert.equal(err.code, 'TOKEN_EXPIRED');
          return true;
        },
      );
    },
  );
});

test('does not retry when the 401 is a real invalid-credentials case (not an expired session)', async () => {
  const { apiFetch } = await import('./api');
  const calls: string[] = [];
  await withMockedFetch(
    (url) => {
      calls.push(url);
      return jsonResponse(401, { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } });
    },
    async () => {
      await assert.rejects(() => apiFetch('/me/pets'));
    },
  );
  assert.equal(calls.filter((u) => u.includes('/auth/refresh')).length, 0);
});
