import Link from 'next/link';
import { ShieldCheck, ShieldAlert, MapPin, CreditCard, CalendarDays, Info } from 'lucide-react';
import { verifyCareCard } from '@/lib/api/care-card';
import CarePartnerCardVisual from '@/components/care-partner/CarePartnerCardVisual';

interface PageProps {
  params: Promise<{ token: string }>;
}

function formatDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function CareCardVerifyResultPage({ params }: PageProps) {
  const { token } = await params;
  const decodedToken = decodeURIComponent(token);

  let result: Awaited<ReturnType<typeof verifyCareCard>>;
  try {
    result = await verifyCareCard(decodedToken, { cache: 'no-store' });
  } catch {
    result = {
      valid: false,
      cardNumber: null,
      contributorName: null,
      zoneName: null,
      planTitle: null,
      issuedAt: null,
      expiresAt: null,
      status: 'not_found',
      disclaimer:
        'Care Partner Card is a contribution recognition and service benefit card only. ' +
        'It is not ownership, share, profit-sharing, investment, or financial return. ' +
        'Product, medicine, food, accessories, and third-party cost discounts are not guaranteed.',
    };
  }

  const statusLabel: Record<string, string> = {
    active: 'Active',
    expired: 'Expired',
    revoked: 'Revoked',
    pending: 'Pending',
    not_found: 'Not Found',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        {/* Status banner */}
        <div className={`rounded-2xl border p-6 text-center mb-6 ${result.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${result.valid ? 'bg-green-100' : 'bg-red-100'}`}>
            {result.valid
              ? <ShieldCheck size={32} className="text-green-600" />
              : <ShieldAlert size={32} className="text-red-600" />
            }
          </div>
          <h1 className={`text-2xl font-bold ${result.valid ? 'text-green-800' : 'text-red-800'}`}>
            {result.valid ? 'Card Valid' : 'Card Invalid'}
          </h1>
          <p className={`text-sm mt-1 ${result.valid ? 'text-green-700' : 'text-red-700'}`}>
            {result.valid
              ? 'This is an authentic BPA Community Care Partner Card.'
              : `Status: ${statusLabel[result.status ?? ''] ?? result.status ?? 'Unknown'}`
            }
          </p>
          {result.cardNumber && (
            <p className="text-xs text-gray-500 mt-3 font-mono">{result.cardNumber}</p>
          )}
        </div>

        {/* Card visual — shown for valid cards */}
        {result.valid && result.cardNumber && (
          <div className="mb-6">
            <CarePartnerCardVisual
              cardNumber={result.cardNumber}
              contributorName={result.contributorName}
              zoneName={result.zoneName}
              planTitle={result.planTitle}
              issuedAt={result.issuedAt}
              expiresAt={result.expiresAt}
              verifyToken={decodedToken}
              disclaimer={result.disclaimer}
            />
          </div>
        )}

        {/* Card details grid (also show for valid) */}
        {result.valid && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4 mb-6">
            <h2 className="font-bold text-(--bpa-navy) text-lg">Card Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {result.contributorName && (
                <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                  <CreditCard size={18} className="text-(--bpa-green) mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Contributor</p>
                    <p className="font-medium text-(--bpa-navy)">{result.contributorName}</p>
                  </div>
                </div>
              )}
              {result.zoneName && (
                <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                  <MapPin size={18} className="text-(--bpa-green) mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Zone</p>
                    <p className="font-medium text-(--bpa-navy)">{result.zoneName}</p>
                  </div>
                </div>
              )}
              {result.planTitle && (
                <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                  <ShieldCheck size={18} className="text-(--bpa-green) mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Plan</p>
                    <p className="font-medium text-(--bpa-navy)">{result.planTitle}</p>
                  </div>
                </div>
              )}
              {result.expiresAt && (
                <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                  <CalendarDays size={18} className="text-(--bpa-green) mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Expires</p>
                    <p className="font-medium text-(--bpa-navy)">{formatDate(result.expiresAt)}</p>
                    {result.issuedAt && (
                      <p className="text-xs text-gray-400 mt-0.5">Issued {formatDate(result.issuedAt)}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Legal disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex gap-2">
          <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">{result.disclaimer}</p>
        </div>

        <div className="text-center text-sm">
          <Link href="/verify/care-card" className="text-(--bpa-green) hover:underline">
            Verify another card →
          </Link>
        </div>
      </div>
    </div>
  );
}
