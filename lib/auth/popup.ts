export const CENTRAL_AUTH_POPUP_MESSAGE_TYPE = 'BPA_AUTH_COMPLETE' as const;
export const CENTRAL_AUTH_POPUP_ACK_TYPE = 'BPA_AUTH_COMPLETE_ACK' as const;
export const CENTRAL_AUTH_POPUP_STORAGE_KEY = 'bpa_auth_popup_complete';
export const CENTRAL_AUTH_POPUP_STORAGE_TTL_MS = 30_000;
export const CENTRAL_AUTH_POPUP_BROADCAST_PREFIX = 'bpa-auth-popup';

export interface CentralAuthPopupMessage {
  type: typeof CENTRAL_AUTH_POPUP_MESSAGE_TYPE;
  success: boolean;
  issuedAt: number;
  flowId?: string;
}

export interface PublishCentralAuthPopupResultOptions {
  success: boolean;
  targetOrigin: string;
  flowId?: string;
}

export function buildCentralAuthPopupMessage(success: boolean, flowId?: string): CentralAuthPopupMessage {
  return {
    type: CENTRAL_AUTH_POPUP_MESSAGE_TYPE,
    success,
    issuedAt: Date.now(),
    ...(flowId ? { flowId } : {}),
  };
}

export interface CentralAuthPopupAck {
  type: typeof CENTRAL_AUTH_POPUP_ACK_TYPE;
  flowId?: string;
}

export function buildCentralAuthPopupFeatures(): string {
  return [
    'popup=yes',
    'width=560',
    'height=720',
    'menubar=no',
    'toolbar=no',
    'location=yes',
    'status=no',
    'resizable=yes',
    'scrollbars=yes',
  ].join(',');
}

export function openCentralAuthPopup(startUrl: string): Window | null {
  if (typeof window === 'undefined') return null;
  const popup = window.open(startUrl, 'bpa-central-auth', buildCentralAuthPopupFeatures());
  popup?.focus?.();
  return popup;
}

export function isCentralAuthPopupMessage(data: unknown): data is CentralAuthPopupMessage {
  if (!data || typeof data !== 'object') return false;
  const message = data as Record<string, unknown>;
  return (
    message.type === CENTRAL_AUTH_POPUP_MESSAGE_TYPE
    && typeof message.success === 'boolean'
    && typeof message.issuedAt === 'number'
  );
}

export function isCentralAuthPopupAck(data: unknown, flowId?: string): data is CentralAuthPopupAck {
  if (!data || typeof data !== 'object') return false;
  const message = data as Record<string, unknown>;
  if (message.type !== CENTRAL_AUTH_POPUP_ACK_TYPE) return false;
  if (flowId && message.flowId !== flowId) return false;
  return !message.flowId || typeof message.flowId === 'string';
}

export function getCentralAuthPopupEventRejectionReason(
  event: Pick<MessageEvent<unknown>, 'data' | 'origin' | 'source'>,
  expectedOrigin: string,
  popupWindow: Window | null,
  expectedFlowId?: string,
): string | null {
  if (event.origin !== expectedOrigin) return 'origin';
  if (popupWindow && event.source && event.source !== popupWindow) return 'source';
  if (!isCentralAuthPopupMessage(event.data)) return 'message_shape';
  if (expectedFlowId && event.data.flowId && event.data.flowId !== expectedFlowId) return 'flow';
  return null;
}

export function isTrustedCentralAuthPopupEvent(
  event: Pick<MessageEvent<unknown>, 'data' | 'origin' | 'source'>,
  expectedOrigin: string,
  popupWindow: Window | null,
  expectedFlowId?: string,
): event is MessageEvent<CentralAuthPopupMessage> {
  return getCentralAuthPopupEventRejectionReason(event, expectedOrigin, popupWindow, expectedFlowId) === null;
}

export function parseCentralAuthPopupStorageEvent(
  event: Pick<StorageEvent, 'key' | 'newValue'>,
): CentralAuthPopupMessage | null {
  if (!event.newValue) return null;
  if (typeof event.key !== 'string') return null;
  if (event.key === CENTRAL_AUTH_POPUP_STORAGE_KEY) {
    try {
      const data = JSON.parse(event.newValue);
      return isCentralAuthPopupMessage(data) ? data : null;
    } catch {
      return null;
    }
  }
  if (!event.key.startsWith(`${CENTRAL_AUTH_POPUP_STORAGE_KEY}:`)) return null;
  try {
    const data = JSON.parse(event.newValue);
    return isCentralAuthPopupMessage(data) ? data : null;
  } catch {
    return null;
  }
}

export function getCentralAuthPopupStorageKey(flowId?: string): string {
  return flowId ? `${CENTRAL_AUTH_POPUP_STORAGE_KEY}:${flowId}` : CENTRAL_AUTH_POPUP_STORAGE_KEY;
}

export function getCentralAuthPopupBroadcastChannelName(flowId?: string): string {
  return flowId ? `${CENTRAL_AUTH_POPUP_BROADCAST_PREFIX}:${flowId}` : CENTRAL_AUTH_POPUP_BROADCAST_PREFIX;
}

export function readCentralAuthPopupStorageMarker(flowId?: string): CentralAuthPopupMessage | null {
  if (typeof window === 'undefined') return null;
  const keys = flowId ? [getCentralAuthPopupStorageKey(flowId)] : [CENTRAL_AUTH_POPUP_STORAGE_KEY];
  for (const key of keys) {
    const value = window.localStorage.getItem(key);
    if (!value) continue;
    try {
      const parsed = JSON.parse(value);
      if (!isCentralAuthPopupMessage(parsed)) continue;
      if (flowId && parsed.flowId !== flowId) continue;
      if (Date.now() - parsed.issuedAt > CENTRAL_AUTH_POPUP_STORAGE_TTL_MS) {
        window.localStorage.removeItem(key);
        continue;
      }
      return parsed;
    } catch {
      window.localStorage.removeItem(key);
    }
  }
  return null;
}

export function consumeCentralAuthPopupStorageMarker(flowId?: string): CentralAuthPopupMessage | null {
  const marker = readCentralAuthPopupStorageMarker(flowId);
  if (!marker || typeof window === 'undefined') return marker;
  try {
    window.localStorage.removeItem(getCentralAuthPopupStorageKey(flowId));
    if (!flowId) {
      window.localStorage.removeItem(CENTRAL_AUTH_POPUP_STORAGE_KEY);
    }
  } catch {
    // Best-effort cleanup only.
  }
  return marker;
}

export function clearCentralAuthPopupStorageMarker(flowId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(getCentralAuthPopupStorageKey(flowId));
    if (!flowId) {
      window.localStorage.removeItem(CENTRAL_AUTH_POPUP_STORAGE_KEY);
    }
  } catch {
    // Best-effort cleanup only.
  }
}

export function openCentralAuthPopupBroadcastChannel(flowId?: string): BroadcastChannel | null {
  if (typeof window === 'undefined' || typeof window.BroadcastChannel === 'undefined') return null;
  return new window.BroadcastChannel(getCentralAuthPopupBroadcastChannelName(flowId));
}

export function publishCentralAuthPopupResult({ success, targetOrigin, flowId }: PublishCentralAuthPopupResultOptions): void {
  if (typeof window === 'undefined') return;
  const message = buildCentralAuthPopupMessage(success, flowId);

  try {
    window.opener?.postMessage(message, targetOrigin);
  } catch {
    // The same-origin storage event below gives the opener a second delivery path.
  }

  try {
    window.localStorage.setItem(getCentralAuthPopupStorageKey(flowId), JSON.stringify(message));
    window.localStorage.setItem(CENTRAL_AUTH_POPUP_STORAGE_KEY, JSON.stringify(message));
  } catch {
    // Some privacy modes disable storage; postMessage remains the primary path.
  }

  try {
    const channel = openCentralAuthPopupBroadcastChannel(flowId);
    channel?.postMessage(message);
    channel?.close();
  } catch {
    // BroadcastChannel is best-effort only.
  }
}

export function traceBpaAuthPopup(event: string, details: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return;
  const body = JSON.stringify({
    event,
    details,
    page: {
      origin: window.location.origin,
      path: window.location.pathname,
      search: window.location.search ? '[present]' : '',
    },
    at: new Date().toISOString(),
  });

  try {
    if (navigator.sendBeacon) {
      const sent = navigator.sendBeacon('/api/auth-popup-trace', new Blob([body], { type: 'application/json' }));
      if (sent) return;
    }
  } catch {
    // fall through to fetch
  }

  try {
    void fetch('/api/auth-popup-trace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    });
  } catch {
    // Diagnostics must never break authentication.
  }
}
