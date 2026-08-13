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
  const originalWindow = (global as unknown as { window?: any }).window;
  (global as unknown as { window: any }).window = { open };
  try {
    const { openCentralAuthPopup } = await import('./popup');
    const opened = openCentralAuthPopup('https://api.example.test/start');
    assert.equal(opened, popup);
    assert.equal(openCalls, 1);
    assert.equal(popup.focused, true);
  } finally {
    (global as unknown as { window?: any }).window = originalWindow;
  }
});

test('openCentralAuthPopup returns null when popup is blocked', async () => {
  let openCalls = 0;
  const open = () => {
    openCalls += 1;
    return null;
  };
  const originalWindow = (global as unknown as { window?: any }).window;
  (global as unknown as { window: any }).window = { open };
  try {
    const { openCentralAuthPopup } = await import('./popup');
    assert.equal(openCentralAuthPopup('https://api.example.test/start'), null);
    assert.equal(openCalls, 1);
  } finally {
    (global as unknown as { window?: any }).window = originalWindow;
  }
});

test('isTrustedCentralAuthPopupEvent only accepts the exact origin, source, and message type', async () => {
  const popup = new FakeWindow();
  const { isTrustedCentralAuthPopupEvent, CENTRAL_AUTH_POPUP_MESSAGE_TYPE } = await import('./popup');
  const expectedOrigin = 'https://bangladeshpetassociation.com';

  assert.equal(
    isTrustedCentralAuthPopupEvent(
      { origin: expectedOrigin, source: popup as unknown as Window, data: { type: CENTRAL_AUTH_POPUP_MESSAGE_TYPE, success: true } },
      expectedOrigin,
      popup as unknown as Window,
    ),
    true,
  );
  assert.equal(
    isTrustedCentralAuthPopupEvent(
      { origin: 'https://evil.example.com', source: popup as unknown as Window, data: { type: CENTRAL_AUTH_POPUP_MESSAGE_TYPE, success: true } },
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
      { origin: expectedOrigin, source: new FakeWindow('other') as unknown as Window, data: { type: CENTRAL_AUTH_POPUP_MESSAGE_TYPE, success: true } },
      expectedOrigin,
      popup as unknown as Window,
    ),
    false,
  );
});
