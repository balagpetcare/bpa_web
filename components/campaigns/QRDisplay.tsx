'use client';

import Image from 'next/image';

interface QRDisplayProps {
  token: string;
  petName: string;
  size?: number;
}

export default function QRDisplay({ token, petName, size = 200 }: QRDisplayProps) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(token)}&format=png&margin=2`;

  function download() {
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `bpa-qr-${petName.replace(/\s+/g, '-').toLowerCase()}.png`;
    a.click();
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
        <Image
          src={qrUrl}
          alt={`QR code for ${petName}`}
          width={size}
          height={size}
          className="rounded-lg"
          unoptimized
        />
      </div>
      <button
        onClick={download}
        className="text-xs font-semibold text-(--bpa-green) hover:underline"
      >
        Download QR
      </button>
    </div>
  );
}
