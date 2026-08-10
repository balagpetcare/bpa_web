'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { createPlatformQrSvg, getRenderablePlatformQrUrl } from './platform-qr-code';

export interface PlatformQrCodeClientProps {
  destinationUrl: string | null | undefined;
  isActive: boolean;
  qrEnabled: boolean;
  caption?: string | null;
  className?: string;
}

export default function PlatformQrCodeClient({
  destinationUrl,
  isActive,
  qrEnabled,
  caption,
  className = '',
}: PlatformQrCodeClientProps) {
  const renderableUrl = getRenderablePlatformQrUrl({ destinationUrl, isActive, qrEnabled });
  const [svg, setSvg] = useState<string | null>(null);

  function toDataUrl(markup: string) {
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(markup)))}`;
  }

  useEffect(() => {
    let cancelled = false;
    if (!renderableUrl) {
      setSvg(null);
      return;
    }

    createPlatformQrSvg(renderableUrl)
      .then((markup) => {
        if (!cancelled) setSvg(toDataUrl(markup));
      })
      .catch(() => {
        if (!cancelled) setSvg(null);
      });

    return () => {
      cancelled = true;
    };
  }, [renderableUrl]);

  if (!renderableUrl || !svg) return null;

  const accessibleCaption = caption?.trim() || 'Scan to open this platform link';

  return (
    <figure className={`m-0 w-full max-w-48 ${className}`.trim()}>
      <Image
        src={svg}
        alt={accessibleCaption}
        width={192}
        height={192}
        className="block aspect-square h-auto w-full rounded bg-white"
        unoptimized
      />
      <figcaption className="mt-2 text-center text-xs leading-5 text-current">
        {accessibleCaption}
      </figcaption>
    </figure>
  );
}
