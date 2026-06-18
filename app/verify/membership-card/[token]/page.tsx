import Link from 'next/link';
import { ShieldCheck, ShieldAlert, CreditCard, CalendarDays, PawPrint, Info } from 'lucide-react';
import { verifyMembershipCard } from '@/lib/api/community-membership';

interface PageProps {
  params: Promise<{ token: string }>;
}

function formatDate(s: string | Date | null) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  expired: 'Expired',
  suspended: 'Suspended',
  not_found: 'Not Found',
};

export default async function MembershipCardVerifyResultPage({ params }: PageProps) {
  const { token } = await params;
  const decodedToken = decodeURIComponent(token);

  let result;
  try {
    result = await verifyMembershipCard(decodedToken, { cache: 'no-store' });
  } catch {
    result = {
      valid: false,
      cardNumber: null,
      status: 'not_found',
      memberName: null,
      tierName: null,
      tierNameBn: null,
      petLimit: null,
      issuedAt: null,
      expiresAt: null,
    };
  }

  const disclaimer =
    'BPA Community Care Partner Card is a service benefit card only. It does not represent ownership, equity, ' +
    'profit-sharing, investment, or financial return. Service discounts are subject to availability and partner terms.';

  const isExpired = result.expiresAt ? new Date(result.expiresAt) < new Date() : false;
  const effectiveValid = result.valid && !isExpired;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">

        {/* Status banner */}
        <div className={`rounded-2xl border p-6 text-center mb-6 ${effectiveValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${effectiveValid ? 'bg-green-100' : 'bg-red-100'}`}>
            {effectiveValid
              ? <ShieldCheck size={32} className="text-green-600" />
              : <ShieldAlert size={32} className="text-red-600" />
            }
          </div>
          <h1 className={`text-2xl font-bold ${effectiveValid ? 'text-green-800' : 'text-red-800'}`}>
            {effectiveValid ? 'Card Valid' : 'Card Invalid'}
          </h1>
          <p className={`text-sm mt-1 ${effectiveValid ? 'text-green-700' : 'text-red-700'}`}>
            {effectiveValid
              ? 'This is an authentic BPA Community Care Partner Card.'
              : `Status: ${STATUS_LABELS[result.status] ?? result.status ?? 'Unknown'}`
            }
          </p>
          {result.cardNumber && (
            <p className="text-xs text-gray-500 mt-3 font-mono bg-white px-3 py-1.5 rounded-lg inline-block border border-gray-200">
              {result.cardNumber}
            </p>
          )}
        </div>

        {/* Tier badge */}
        {effectiveValid && result.tierName && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Membership Tier</p>
                <p className="text-2xl font-black text-(--bpa-navy)">{result.tierName}</p>
                {result.tierNameBn && (
                  <p className="text-sm text-gray-400 mt-0.5">{result.tierNameBn}</p>
                )}
              </div>
              <div className="w-16 h-16 bg-(--bpa-green) rounded-2xl flex items-center justify-center shrink-0">
                <ShieldCheck size={28} className="text-white" />
              </div>
            </div>
          </div>
        )}

        {/* Card details */}
        {effectiveValid && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4 mb-6">
            <h2 className="font-bold text-(--bpa-navy) text-lg">Card Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {result.memberName && (
                <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                  <CreditCard size={18} className="text-(--bpa-green) mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Member</p>
                    <p className="font-medium text-(--bpa-navy)">{result.memberName}</p>
                  </div>
                </div>
              )}
              {result.petLimit != null && (
                <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                  <PawPrint size={18} className="text-(--bpa-green) mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Pet Limit</p>
                    <p className="font-medium text-(--bpa-navy)">Up to {result.petLimit} pets</p>
                  </div>
                </div>
              )}
              {result.issuedAt && (
                <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                  <CalendarDays size={18} className="text-(--bpa-green) mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Issued</p>
                    <p className="font-medium text-(--bpa-navy)">{formatDate(result.issuedAt)}</p>
                  </div>
                </div>
              )}
              {result.expiresAt && (
                <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                  <CalendarDays size={18} className={`mt-0.5 shrink-0 ${isExpired ? 'text-red-500' : 'text-(--bpa-green)'}`} />
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Expires</p>
                    <p className={`font-medium ${isExpired ? 'text-red-600' : 'text-(--bpa-navy)'}`}>
                      {formatDate(result.expiresAt)}
                    </p>
                    {isExpired && <p className="text-xs text-red-500 mt-0.5">Expired</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Legal disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-2">
          <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">{disclaimer}</p>
        </div>

        <div className="text-center text-sm space-y-2">
          <p>
            <Link href="/verify/membership-card" className="text-(--bpa-green) hover:underline">
              Verify another card →
            </Link>
          </p>
          <p>
            <Link href="/membership/lookup" className="text-gray-400 hover:text-(--bpa-green) hover:underline">
              Look up membership by card number →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
