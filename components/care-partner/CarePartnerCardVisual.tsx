import QRCode from 'qrcode';

interface Props {
  cardNumber: string;
  contributorName: string | null;
  zoneName: string | null;
  planTitle: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  verifyToken: string;
  disclaimer: string;
}

function fmt(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function CarePartnerCardVisual({
  cardNumber,
  contributorName,
  zoneName,
  planTitle,
  issuedAt,
  expiresAt,
  verifyToken,
  disclaimer,
}: Props) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/verify/care-card/${verifyToken}`;
  const qrSvg = await QRCode.toString(verifyUrl, { type: 'svg', width: 100, margin: 1 });

  return (
    <div className="bg-(--bpa-navy) rounded-2xl overflow-hidden shadow-xl max-w-md mx-auto text-white">
      {/* Header bar */}
      <div className="bg-(--bpa-green) px-6 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/80">Bangladesh Pet Association</p>
          <p className="text-sm font-bold">Community Care Partner Card</p>
        </div>
        <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded">ACTIVE</span>
      </div>

      {/* Body */}
      <div className="px-6 py-5 flex gap-5">
        {/* Details */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-white/50 uppercase tracking-widest mb-0.5">Card Holder</p>
          <p className="font-bold text-lg leading-tight mb-4 truncate">
            {contributorName ?? 'Anonymous Contributor'}
          </p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {zoneName && (
              <div>
                <p className="text-xs text-white/50 mb-0.5">Zone</p>
                <p className="font-medium truncate">{zoneName}</p>
              </div>
            )}
            {planTitle && (
              <div>
                <p className="text-xs text-white/50 mb-0.5">Plan</p>
                <p className="font-medium truncate">{planTitle}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-white/50 mb-0.5">Issued</p>
              <p className="font-medium">{fmt(issuedAt)}</p>
            </div>
            <div>
              <p className="text-xs text-white/50 mb-0.5">Expires</p>
              <p className="font-medium">{fmt(expiresAt)}</p>
            </div>
          </div>

          <p className="font-mono text-xs text-(--bpa-green) mt-4 tracking-wider">{cardNumber}</p>
        </div>

        {/* QR Code */}
        <div className="shrink-0 flex flex-col items-center gap-1">
          <div
            className="bg-white rounded-lg p-1"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
            style={{ width: 88, height: 88 }}
          />
          <p className="text-xs text-white/40 text-center">Scan to verify</p>
        </div>
      </div>

      {/* Disclaimer footer */}
      <div className="border-t border-white/10 px-6 py-3">
        <p className="text-xs text-white/40 leading-relaxed">{disclaimer}</p>
      </div>
    </div>
  );
}
