'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ShieldAlert, Search, CalendarDays, PawPrint, Download, CreditCard } from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import {
  lookupMembership,
  getPurchaseStatus,
  type MembershipLookupResult,
  type PurchaseStatusResponse,
} from '@/lib/api/community-membership';

const STATUS_COLORS: Record<string, string> = {
  paid: 'text-green-700 bg-green-100',
  pending_payment: 'text-yellow-700 bg-yellow-100',
  cancelled: 'text-gray-600 bg-gray-100',
  refunded: 'text-red-700 bg-red-100',
};

const CARD_STATUS_COLORS: Record<string, string> = {
  active: 'text-green-700 bg-green-100',
  expired: 'text-orange-700 bg-orange-100',
  suspended: 'text-red-700 bg-red-100',
};

function fmtDate(s: string | null | undefined) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function MembershipLookupPage() {
  return (
    <Suspense fallback={null}>
      <MembershipLookupContent />
    </Suspense>
  );
}

function MembershipLookupContent() {
  const searchParams = useSearchParams();
  const initialPurchaseId = searchParams.get('purchaseId');

  const [cardNumber, setCardNumber] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lookupResult, setLookupResult] = useState<MembershipLookupResult | null>(null);
  const [statusResult, setStatusResult] = useState<PurchaseStatusResponse | null>(null);

  // If purchaseId is in URL (came from payment success), load status directly
  useEffect(() => {
    if (!initialPurchaseId) return;
    setLoading(true);
    getPurchaseStatus(initialPurchaseId)
      .then((data) => { if (data) setStatusResult(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [initialPurchaseId]);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    const cn = cardNumber.trim();
    const mob = mobile.trim();
    if (!cn || !mob) { setError('Please enter both card number and mobile.'); return; }
    setError('');
    setLookupResult(null);
    setStatusResult(null);
    setLoading(true);
    try {
      const result = await lookupMembership({ cardNumber: cn, mobile: mob });
      setLookupResult(result);
      // Also fetch full status
      const status = await getPurchaseStatus(result.purchaseId).catch(() => null);
      if (status) setStatusResult(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No matching membership found.');
    } finally {
      setLoading(false);
    }
  }

  const purchaseId = statusResult?.id ?? lookupResult?.purchaseId;
  const cardStatus = statusResult?.card?.status ?? lookupResult?.cardStatus;
  const cardNumber_ = statusResult?.card?.cardNumber ?? lookupResult?.cardNumber;
  const qrToken = statusResult?.card?.qrToken;
  const isPaid = (statusResult?.status === 'paid') || (cardStatus === 'active');
  const apiOrigin = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace('/api/v1', '');
  const receiptPdfUrl = purchaseId ? `${apiOrigin}/api/v1/public/memberships/${purchaseId}/receipt.pdf` : null;
  const cardPdfUrl = purchaseId ? `${apiOrigin}/api/v1/public/memberships/${purchaseId}/card.pdf` : null;

  return (
    <>
      <section className="bg-gray-50 border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-400 mb-4 flex gap-2 items-center">
            <Link href="/" className="hover:text-(--bpa-green)">Home</Link>
            <span>/</span>
            <span className="text-gray-600">Membership Lookup</span>
          </nav>
          <h1 className="text-4xl font-bold text-(--bpa-navy)">Membership Card Lookup</h1>
          <p className="mt-3 text-lg text-gray-500 max-w-xl">
            Check the status of your BPA Community Care Partner Card membership.
          </p>
        </div>
      </section>

      <div className="py-16">
        <div className="max-w-lg mx-auto px-4 space-y-6">

          {/* Lookup form */}
          <form onSubmit={handleLookup} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-4">
            <h2 className="font-bold text-(--bpa-navy) text-lg mb-2">Look up by Card Number</h2>
            {error && <Alert variant="error" message={error} />}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Card Number</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="BPA-MC-2026-000001"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-(--bpa-green)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Registered Mobile</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="01xxxxxxxxx"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green)"
              />
            </div>
            <Button type="submit" variant="primary" size="md" className="w-full" loading={loading}>
              <Search size={16} /> Look Up Card
            </Button>
          </form>

          {/* Loading for direct purchaseId */}
          {loading && !lookupResult && !statusResult && (
            <div className="text-center py-8 text-gray-400 text-sm">Loading membership status…</div>
          )}

          {/* Results */}
          {(lookupResult || statusResult) && (
            <div className="space-y-4">

              {/* Card status header */}
              <div className={`rounded-2xl border p-6 ${cardStatus === 'active' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${cardStatus === 'active' ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {cardStatus === 'active'
                      ? <ShieldCheck size={28} className="text-green-600" />
                      : <ShieldAlert size={28} className="text-gray-400" />
                    }
                  </div>
                  <div>
                    <p className="text-lg font-black text-(--bpa-navy)">
                      {lookupResult?.tierName ?? statusResult?.tierName ?? 'Membership'}
                    </p>
                    {cardStatus && (
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${CARD_STATUS_COLORS[cardStatus] ?? 'text-gray-600 bg-gray-100'}`}>
                        {cardStatus.charAt(0).toUpperCase() + cardStatus.slice(1)}
                      </span>
                    )}
                  </div>
                </div>

                {cardNumber_ && (
                  <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Card Number</p>
                    <p className="font-mono font-extrabold text-(--bpa-navy) text-xl">{cardNumber_}</p>
                  </div>
                )}

                <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                  {(lookupResult?.memberName ?? statusResult?.memberName) && (
                    <div className="flex items-start gap-2">
                      <CreditCard size={14} className="text-(--bpa-green) mt-0.5 shrink-0" />
                      <div>
                        <dt className="text-xs text-gray-400">Member</dt>
                        <dd className="font-medium text-(--bpa-navy)">{lookupResult?.memberName ?? statusResult?.memberName}</dd>
                      </div>
                    </div>
                  )}
                  {(lookupResult?.petLimit ?? statusResult?.petLimit) != null && (
                    <div className="flex items-start gap-2">
                      <PawPrint size={14} className="text-(--bpa-green) mt-0.5 shrink-0" />
                      <div>
                        <dt className="text-xs text-gray-400">Pet Limit</dt>
                        <dd className="font-medium text-(--bpa-navy)">Up to {lookupResult?.petLimit ?? statusResult?.petLimit} pets</dd>
                      </div>
                    </div>
                  )}
                  {(lookupResult?.startsAt ?? statusResult?.startsAt) && (
                    <div className="flex items-start gap-2">
                      <CalendarDays size={14} className="text-(--bpa-green) mt-0.5 shrink-0" />
                      <div>
                        <dt className="text-xs text-gray-400">Valid From</dt>
                        <dd className="font-medium text-(--bpa-navy)">{fmtDate(lookupResult?.startsAt ?? statusResult?.startsAt)}</dd>
                      </div>
                    </div>
                  )}
                  {(lookupResult?.expiresAt ?? statusResult?.expiresAt) && (
                    <div className="flex items-start gap-2">
                      <CalendarDays size={14} className="text-(--bpa-green) mt-0.5 shrink-0" />
                      <div>
                        <dt className="text-xs text-gray-400">Expires</dt>
                        <dd className="font-medium text-(--bpa-navy)">{fmtDate(lookupResult?.expiresAt ?? statusResult?.expiresAt)}</dd>
                      </div>
                    </div>
                  )}
                </dl>
              </div>

              {/* Purchase status */}
              {statusResult && statusResult.status !== 'paid' && (
                <div className={`rounded-xl border px-4 py-3 text-sm ${STATUS_COLORS[statusResult.status] ?? 'text-gray-700 bg-gray-50 border-gray-200'}`}>
                  <strong>Purchase Status:</strong>{' '}
                  {statusResult.status === 'pending_payment'
                    ? 'Payment pending. If you have already paid via MFS, please wait for verification or contact support.'
                    : statusResult.status}
                </div>
              )}

              {/* Download card and receipt */}
              {isPaid && purchaseId && (
                <div className="flex flex-col gap-3 w-full">
                  <a
                    href={receiptPdfUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-(--bpa-green) text-white font-bold px-6 py-3.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
                  >
                    <Download size={16} /> Download Official Receipt (PDF)
                  </a>
                  <a
                    href={cardPdfUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-(--bpa-navy) text-white font-bold px-6 py-3.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
                  >
                    <Download size={16} /> Download Digital Card (PDF)
                  </a>
                </div>
              )}

              {/* Verify QR */}
              {qrToken && cardStatus === 'active' && (
                <Link
                  href={`/verify/membership-card/${encodeURIComponent(qrToken)}`}
                  className="flex items-center justify-center gap-2 w-full border-2 border-(--bpa-green) text-(--bpa-green) font-bold px-6 py-3.5 rounded-xl hover:bg-(--bpa-green-light) transition-colors text-sm"
                >
                  <ShieldCheck size={16} /> Verify Card QR
                </Link>
              )}
            </div>
          )}

          <div className="text-center text-sm text-gray-400 space-y-1 pt-4">
            <p>
              <Link href="/community-pet-care#tiers" className="text-(--bpa-green) hover:underline">
                Don&apos;t have a card yet? Get yours →
              </Link>
            </p>
            <p>
              <Link href="/verify/membership-card" className="hover:text-(--bpa-green) hover:underline">
                Verify a card by QR token →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
