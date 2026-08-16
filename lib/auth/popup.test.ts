import assert from 'node:assert/strict';
import test from 'node:test';

class FakeWindow {
  closed = false;
  focused = false;
  messages: unknown[] = [];
  constructor(public name = 'popup') {}
  focus() { this.focused = true; }
  postMessage(message: unknown) { this.messages.push(message); }
}

test('openCentralAuthPopup opens a named popup and focuses it', async () => {
  const popup = new FakeWindow();
  let openCalls = 0;
  const open = () => {
    openCalls += 1;
    return popup as unknown as Window;
  };
  const globalWithWindow = global as typeof globalThis & { window?: unknown };
  const originalWindow = globalWithWindow.window;
  globalWithWindow.window = { open };
  try {
    const { openCentralAuthPopup } = await import('./popup');
    const opened = openCentralAuthPopup('https://api.example.test/start');
    assert.equal(opened, popup);
    assert.equal(openCalls, 1);
    assert.equal(popup.focused, true);
  } finally {
    globalWithWindow.window = originalWindow;
  }
});

test('openCentralAuthPopup returns null when popup is blocked', async () => {
  let openCalls = 0;
  const open = () => {
    openCalls += 1;
    return null;
  };
  const globalWithWindow = global as typeof globalThis & { window?: unknown };
  const originalWindow = globalWithWindow.window;
  globalWithWindow.window = { open };
  try {
    const { openCentralAuthPopup } = await import('./popup');
    assert.equal(openCentralAuthPopup('https://api.example.test/start'), null);
    assert.equal(openCalls, 1);
  } finally {
    globalWithWindow.window = originalWindow;
  }
});

test('isTrustedCentralAuthPopupEvent only accepts the exact origin, source, and message type', async () => {
  const popup = new FakeWindow();
  const { isTrustedCentralAuthPopupEvent, buildCentralAuthPopupMessage } = await import('./popup');
  const expectedOrigin = 'https://bangladeshpetassociation.com';
  const message = buildCentralAuthPopupMessage(true);

  assert.equal(
    isTrustedCentralAuthPopupEvent(
      { origin: expectedOrigin, source: popup as unknown as Window, data: message },
      expectedOrigin,
      popup as unknown as Window,
    ),
    true,
  );
  assert.equal(
    isTrustedCentralAuthPopupEvent(
      { origin: 'https://evil.example.com', source: popup as unknown as Window, data: message },
      expectedOrigin,
      popup as unknown as Window,
    ),
    false,
  );
  assert.equal(
    isTrustedCentralAuthPopupEvent(
      { origin: expectedOrigin, source: popup as unknown as Window, data: { type: 'OTHER', success: true } },
      expectedOrigin,
      popup as unknown as Window,
    ),
    false,
  );
  assert.equal(
    isTrustedCentralAuthPopupEvent(
      { origin: expectedOrigin, source: new FakeWindow('other') as unknown as Window, data: message },
      expectedOrigin,
      popup as unknown as Window,
    ),
    false,
  );
});

test('popup storage fallback carries only a minimal completion signal', async () => {
  const { CENTRAL_AUTH_POPUP_STORAGE_KEY, buildCentralAuthPopupMessage, parseCentralAuthPopupStorageEvent } = await import('./popup');
  const parsed = parseCentralAuthPopupStorageEvent({
    key: CENTRAL_AUTH_POPUP_STORAGE_KEY,
    newValue: JSON.stringify(buildCentralAuthPopupMessage(true)),
  } as StorageEvent);

  assert.equal(parsed?.success, true);
  assert.equal(parsed?.type, 'BPA_AUTH_COMPLETE');
  assert.equal(typeof parsed?.issuedAt, 'number');
  assert.deepEqual(Object.keys(parsed!).sort(), ['issuedAt', 'success', 'type']);
  assert.equal(parseCentralAuthPopupStorageEvent({ key: 'other', newValue: JSON.stringify(parsed) } as StorageEvent), null);
});

test('publishCentralAuthPopupResult writes a flow-scoped marker even when opener is null', async () => {
  const storage = new Map<string, string>();
  const globalWithWindow = global as typeof globalThis & { window?: unknown };
  const originalWindow = globalWithWindow.window;
  globalWithWindow.window = {
    opener: null,
    localStorage: {
      setItem(key: string, value: string) { storage.set(key, value); },
      getItem(key: string) { return storage.get(key) ?? null; },
      removeItem(key: string) { storage.delete(key); },
    },
    BroadcastChannel: class {
      close() {}
      postMessage() {}
    },
  };
  try {
    const {
      CENTRAL_AUTH_POPUP_STORAGE_KEY,
      getCentralAuthPopupStorageKey,
      publishCentralAuthPopupResult,
      readCentralAuthPopupStorageMarker,
    } = await import('./popup');
    publishCentralAuthPopupResult({
      success: true,
      targetOrigin: 'https://bangladeshpetassociation.com',
      flowId: 'flow-123',
    });

    assert.equal(storage.has(getCentralAuthPopupStorageKey('flow-123')), true);
    assert.equal(storage.has(CENTRAL_AUTH_POPUP_STORAGE_KEY), true);
    assert.equal(readCentralAuthPopupStorageMarker('flow-123')?.flowId, 'flow-123');
    assert.equal(readCentralAuthPopupStorageMarker('flow-123')?.success, true);
  } finally {
    globalWithWindow.window = originalWindow;
  }
});

test('consumeCentralAuthPopupStorageMarker supports missed storage events by reading the marker directly', async () => {
  const storage = new Map<string, string>();
  const globalWithWindow = global as typeof globalThis & { window?: unknown };
  const originalWindow = globalWithWindow.window;
  globalWithWindow.window = {
    localStorage: {
      setItem(key: string, value: string) { storage.set(key, value); },
      getItem(key: string) { return storage.get(key) ?? null; },
      removeItem(key: string) { storage.delete(key); },
    },
  };
  try {
    const {
      buildCentralAuthPopupMessage,
      consumeCentralAuthPopupStorageMarker,
      getCentralAuthPopupStorageKey,
    } = await import('./popup');
    storage.set(getCentralAuthPopupStorageKey('flow-456'), JSON.stringify(buildCentralAuthPopupMessage(true, 'flow-456')));
    const consumed = consumeCentralAuthPopupStorageMarker('flow-456');
    assert.equal(consumed?.flowId, 'flow-456');
    assert.equal(storage.has(getCentralAuthPopupStorageKey('flow-456')), false);
  } finally {
    globalWithWindow.window = originalWindow;
  }
});
