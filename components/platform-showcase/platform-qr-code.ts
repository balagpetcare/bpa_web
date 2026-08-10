import QRCode from 'qrcode';

export interface PlatformQrCodeInput {
  destinationUrl: string | null | undefined;
  isActive: boolean;
  qrEnabled: boolean;
}

/**
 * The public API already removes inactive links, but this guard intentionally
 * remains at the rendering boundary so the component is safe to reuse with
 * admin previews or other platform-link responses.
 */
export function getRenderablePlatformQrUrl({
  destinationUrl,
  isActive,
  qrEnabled,
}: PlatformQrCodeInput): string | null {
  if (!isActive || !qrEnabled || !destinationUrl || destinationUrl.length > 2048) return null;

  try {
    const parsed = new URL(destinationUrl);
    if (
      (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') ||
      !parsed.hostname ||
      parsed.username ||
      parsed.password
    ) {
      return null;
    }
  } catch {
    return null;
  }

  // Do not return parsed.href here: the QR must contain the canonical string
  // supplied by the backend exactly, without client-side normalization.
  return destinationUrl;
}

export async function createPlatformQrSvg(destinationUrl: string): Promise<string> {
  return QRCode.toString(destinationUrl, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 4,
    width: 192,
    color: { dark: '#000000ff', light: '#ffffffff' },
  });
}
