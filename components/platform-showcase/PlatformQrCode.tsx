import { createPlatformQrSvg, getRenderablePlatformQrUrl } from './platform-qr-code';

export interface PlatformQrCodeProps {
  destinationUrl: string | null | undefined;
  isActive: boolean;
  qrEnabled: boolean;
  caption?: string | null;
  className?: string;
}

/** Generates a QR locally during server rendering; no destination is sent to a third party. */
export default async function PlatformQrCode({
  destinationUrl,
  isActive,
  qrEnabled,
  caption,
  className = '',
}: PlatformQrCodeProps) {
  const renderableUrl = getRenderablePlatformQrUrl({ destinationUrl, isActive, qrEnabled });
  if (!renderableUrl) return null;

  const accessibleCaption = caption?.trim() || 'Scan to open this platform link';
  const svg = await createPlatformQrSvg(renderableUrl);
  const source = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

  return (
    <figure className={`m-0 w-full max-w-48 ${className}`.trim()}>
      <img
        src={source}
        alt={accessibleCaption}
        width={192}
        height={192}
        className="block aspect-square h-auto w-full rounded bg-white"
      />
      <figcaption className="mt-2 text-center text-xs leading-5 text-current">
        {accessibleCaption}
      </figcaption>
    </figure>
  );
}
