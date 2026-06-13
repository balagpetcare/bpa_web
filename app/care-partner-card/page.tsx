'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Search, Info } from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { getContributionByNumber } from '@/lib/api/contributions';
import type { ContributionStatusPublic } from '@/types/bpa.types';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  paid: { label: 'Paid', color: 'text-green-700 bg-green-100' },
  pending_payment: { label: 'Pending Payment', color: 'text-yellow-700 bg-yellow-100' },
  cancelled: { label: 'Cancelled', color: 'text-gray-600 bg-gray-100' },
  refunded: { label: 'Refunded', color: 'text-red-700 bg-red-100' },
};

function fmtDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function CarePartnerCardPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ContributionStatusPublic | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) { setError('Please enter your contribution number.'); return; }
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const data = await getContributionByNumber(q, { cache: 'no-store' });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Contribution not found. Please check your contribution number.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="bg-gray-50 border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-400 mb-4 flex gap-2 items-center">
            <Link href="/" className="hover:text-(--bpa-green)">Home</Link>
            <span>/</span>
            <span className="text-gray-600">Care Partner Card</span>
          </nav>
          <h1 className="text-4xl font-bold text-(--bpa-navy)">Care Partner Card Lookup</h1>
          <p className="mt-3 text-lg text-gray-500 max-w-xl">
            Look up your BPA Community Care Partner Card using your contribution number.
          </p>
        </div>
      </section>

      <div className="py-16">
        <div className="max-w-lg mx-auto px-4">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-(--bpa-green) rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={32} className="text-white" />
            </div>
            <p className="text-gray-500 text-sm">
              Enter your contribution number (e.g. BPA-CC-2026-000001) to look up your Care Partner Card.
            </p>
          </div>

          <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-4">
            {error && <Alert variant="error" message={error} />}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Contribution Number
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="BPA-CC-2026-000001"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-(--bpa-green)"
              />
            </div>
            <Button type="submit" variant="primary" size="md" className="w-full" loading={loading}>
              <Search size={16} /> Look Up Card
            </Button>
          </form>

          {result && (
            <div className="mt-8 space-y-4">
              <div className={`rounded-2xl border p-6 ${result.status === 'paid' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Contribution</p>
                    <p className="font-mono font-bold text-(--bpa-navy)">{result.contributionNumber}</p>
                  </div>
                  {STATUS_LABELS[result.status] && (
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_LABELS[result.status].color}`}>
                      {STATUS_LABELS[result.status].label}
                    </span>
                  )}
                </div>
                <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-gray-400">Contributor</dt>
                    <dd className="font-medium text-(--bpa-navy)">{result.isAnonymous ? 'Anonymous' : result.contributorName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-400">Plan</dt>
                    <dd className="font-medium text-(--bpa-navy)">{result.planTitle}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-400">Zone</dt>
                    <dd className="font-medium text-(--bpa-navy)">{result.zoneName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-400">Amount</dt>
                    <dd className="font-bold text-(--bpa-green)">৳{Number(result.amountBdt).toLocaleString()}</dd>
                  </div>
                </dl>
              </div>

              {result.cardNumber ? (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <h2 className="font-bold text-(--bpa-navy) mb-4">Your Care Partner Card</h2>
                  <dl className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Card Number</dt>
                      <dd className="font-mono font-bold text-(--bpa-navy)">{result.cardNumber}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Card Status</dt>
                      <dd className="font-medium capitalize">{result.cardStatus}</dd>
                    </div>
                  </dl>
                  <Link
                    href={`/verify/care-card`}
                    className="flex items-center justify-center gap-2 w-full rounded-xl border border-(--bpa-green) text-(--bpa-green) py-2.5 text-sm font-medium hover:bg-(--bpa-green-light) transition-colors"
                  >
                    <ShieldCheck size={16} /> Verify Card QR
                  </Link>
                </div>
              ) : result.status === 'paid' ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                  Your payment was received but the card is still being processed. Please check back shortly.
                </div>
              ) : null}

              {result.disclaimer && (
                <div className="flex gap-2 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">{result.disclaimer}</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 text-center text-sm text-gray-400">
            <Link href="/community-pet-care/contribute" className="text-(--bpa-green) hover:underline">
              Haven&apos;t contributed yet? Contribute ৳3,000 →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
