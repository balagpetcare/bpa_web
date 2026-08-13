export const CENTRAL_AUTH_POPUP_MESSAGE_TYPE = 'BPA_AUTH_COMPLETE' as const;

export interface CentralAuthPopupMessage {
  type: typeof CENTRAL_AUTH_POPUP_MESSAGE_TYPE;
  success: boolean;
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
  return message.type === CENTRAL_AUTH_POPUP_MESSAGE_TYPE && typeof message.success === 'boolean';
}

export function isTrustedCentralAuthPopupEvent(
  event: Pick<MessageEvent<unknown>, 'data' | 'origin' | 'source'>,
  expectedOrigin: string,
  popupWindow: Window | null,
): event is MessageEvent<CentralAuthPopupMessage> {
  if (event.origin !== expectedOrigin) return false;
  if (popupWindow && event.source && event.source !== popupWindow) return false;
  return isCentralAuthPopupMessage(event.data);
}
