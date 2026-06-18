import { QrCode, ExternalLink, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface Props {
  /** Slug used in ?qr= URL param so the backend can attribute the donation */
  qrSlug?: string;
  campaignId?: string;
  title?: string;
  description?: string;
  className?: string;
}

export default function DonationQRCodeBlock({
  qrSlug,
  campaignId,
  title = 'Scan to Donate',
  description = 'Point your phone camera at the code to go directly to our secure donation page.',
  className = '',
}: Props) {
  const params = new URLSearchParams();
  if (qrSlug) params.set('qr', qrSlug);
  if (campaignId) params.set('campaign', campaignId);
  const donateUrl = `/donate${params.size ? `?${params}` : ''}#donate-form`;

  return (
    <div className={`bg-(--bpa-navy) rounded-2xl p-6 text-white text-center ${className}`}>
      <div className="flex justify-center mb-4">
        <div className="bg-white rounded-xl p-4 inline-block">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <QrCode size={80} className="text-gray-300" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow">
                <span className="text-[10px] font-black text-(--bpa-green) leading-none">BPA</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-base font-bold mb-1">{title}</h3>
      <p className="text-xs text-gray-300 leading-relaxed mb-4 max-w-[200px] mx-auto">{description}</p>

      <Link
        href={donateUrl}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-(--bpa-green) hover:underline"
      >
        Open Donate Page <ExternalLink size={12} />
      </Link>

      <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-gray-500">
        <ShieldCheck size={11} className="text-(--bpa-green)" />
        Official BPA Donation QR
      </div>
    </div>
  );
}
