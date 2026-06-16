import Link from 'next/link';
import { ShieldCheck, ShieldAlert, CreditCard, CalendarDays, Info } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';

interface PageProps {
  params: Promise<{ token: string }>;
}

function formatDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export async function generateMetadata() {
  return buildMetadata({ title: 'Verify Membership Card — BPA' });
}

interface VerifyResult {
  valid: boolean;
  status: string;
  cardNumber: string | null;
  memberName: string | null;
  tierName: string | null;
  tierNameBn: string | null;
  petLimit: number | null;
  issuedAt: string | null;
  expiresAt: string | null;
}

export default async function MembershipCardVerifyPage({ params }: PageProps) {
  const { token } = await params;

  let result: VerifyResult;
  try {
    const res = await apiFetch<VerifyResult>(`/public/community-membership/verify?token=${encodeURIComponent(token)}`, { cache: 'no-store' });
    result = res.data;
  } catch {
    result = { valid: false, status: 'not_found', cardNumber: null, memberName: null, tierName: null, tierNameBn: null, petLimit: null, issuedAt: null, expiresAt: null };
  }

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700 border-green-300',
    expired: 'bg-red-100 text-red-700 border-red-300',
    suspended: 'bg-amber-100 text-amber-700 border-amber-300',
    not_found: 'bg-gray-100 text-gray-500 border-gray-300',
    pending: 'bg-blue-100 text-blue-700 border-blue-300',
  };

  const statusColor = statusColors[result.status] ?? 'bg-gray-100 text-gray-500';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-lg mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-(--bpa-navy)">BPA Membership Card</h1>
          <p className="text-gray-500 text-sm mt-1">Community Care Partnership Program</p>
        </div>

        <div className={`rounded-2xl border-2 p-8 ${result.valid ? 'bg-white border-green-300' : 'bg-white border-gray-200'}`}>
          <div className="text-center mb-6">
            {result.valid ? (
              <ShieldCheck size={48} className="mx-auto text-green-500" />
            ) : (
              <ShieldAlert size={48} className="mx-auto text-gray-400" />
            )}
            <span className={`inline-block mt-3 px-4 py-1 rounded-full text-sm font-semibold border ${statusColor}`}>
              {result.status === 'active' ? 'ACTIVE' : result.status === 'not_found' ? 'NOT FOUND' : result.status.toUpperCase()}
            </span>
          </div>

          {result.cardNumber && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CreditCard size={16} className="text-gray-400" />
                <span className="text-gray-500">Card:</span>
                <span className="font-mono font-bold text-(--bpa-navy)">{result.cardNumber}</span>
              </div>

              {result.memberName && (
                <div className="flex items-center gap-2 text-sm">
                  <Info size={16} className="text-gray-400" />
                  <span className="text-gray-500">Member:</span>
                  <span className="font-semibold text-(--bpa-navy)">{result.memberName}</span>
                </div>
              )}

              {result.tierName && (
                <div className="flex items-center gap-2 text-sm">
                  <Info size={16} className="text-gray-400" />
                  <span className="text-gray-500">Tier:</span>
                  <span className="font-semibold text-(--bpa-green)">{result.tierName}</span>
                  {result.tierNameBn && <span className="text-gray-400">{result.tierNameBn}</span>}
                </div>
              )}

              {result.petLimit && (
                <div className="flex items-center gap-2 text-sm">
                  <Info size={16} className="text-gray-400" />
                  <span className="text-gray-500">Pet Limit:</span>
                  <span className="font-semibold text-(--bpa-navy)">{result.petLimit}</span>
                </div>
              )}

              {result.issuedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays size={16} className="text-gray-400" />
                  <span className="text-gray-500">Issued:</span>
                  <span>{formatDate(result.issuedAt)}</span>
                </div>
              )}

              {result.expiresAt && (
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays size={16} className="text-gray-400" />
                  <span className="text-gray-500">Expires:</span>
                  <span className={new Date(result.expiresAt) < new Date() ? 'text-red-600 font-semibold' : ''}>
                    {formatDate(result.expiresAt)}
                  </span>
                </div>
              )}
            </div>
          )}

          {!result.cardNumber && (
            <p className="text-center text-gray-500">
              This membership card could not be found. Please check the verification link or contact BPA support.
            </p>
          )}
        </div>

        <div className="text-center mt-6 space-y-2">
          {result.valid && (
            <p>
              <Link
                href={`/community-pet-care/membership/upgrade?token=${encodeURIComponent(token)}`}
                className="inline-block px-4 py-2 bg-(--bpa-green) text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Upgrade Membership →
              </Link>
            </p>
          )}
          <p>
            <Link href="/" className="text-(--bpa-green) text-sm hover:underline">
              Back to BPA Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
