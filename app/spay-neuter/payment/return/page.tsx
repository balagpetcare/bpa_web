'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { assertSafePaymentUrl } from '@/lib/utils/payment-redirect';
import { formatMoney } from '@/lib/utils/format';
import { getSpayPaymentReturnStatus, retrySpayBookingPayment, type SpayPaymentReturnStatus } from '@/lib/api/spay-neuter';
import {
  resolveSpayPaymentReturnCopy,
  shouldContinuePolling,
  PENDING_POLL_INTERVAL_MS,
} from '@/lib/spay-neuter/payment-return';

// The dedicated landing page for a Spay & Neuter EPS payment return —
// replaces the old flow where a bookingless success fell through the
// generic /payment/success page's own fallback into the Community Pet Care
// membership-purchase lookup ("Lookup Failed — Membership purchase not
// found"), even though the payment and booking had both actually
// succeeded. This page NEVER trusts its own query string for the outcome —
// `ref` (the merchantTransactionId) is only ever used as the key for an
// authenticated, server-verified status call; success/fail/status query
// params EPS or the redirect itself might carry are never read.

function SpayPaymentReturnInner() {
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const ref = searchParams.get('ref') || '';

  const [status, setStatus] = useState<SpayPaymentReturnStatus | null>(null);
  const [checking, setChecking] = useState(true);
  const [pollAttempt, setPollAttempt] = useState(0);
  const [loadError, setLoadError] = useState('');
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState('');
  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  const fetchStatus = useCallback(async () => {
    if (!ref) return;
    setChecking(true);
    setLoadError('');
    try {
      const result = await getSpayPaymentReturnStatus(ref);
      if (mountedRef.current) setStatus(result);
    } catch {
      if (mountedRef.current) setLoadError('Could not check payment status from the server. Please try again.');
    } finally {
      if (mountedRef.current) setChecking(false);
    }
  }, [ref]);

  // Initial check, once signed in and we have a ref.
  useEffect(() => {
    if (authLoading || !user || !ref) return;
    void fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, ref]);

  // Bounded auto-poll while the outcome is 'pending' — never indefinite.
  useEffect(() => {
    if (!status || !shouldContinuePolling(status.outcome, pollAttempt)) return;
    const id = setTimeout(() => {
      setPollAttempt((n) => n + 1);
      void fetchStatus();
    }, PENDING_POLL_INTERVAL_MS);
    return () => clearTimeout(id);
  }, [status, pollAttempt, fetchStatus]);

  async function handleRetryPayment() {
    if (retrying || status?.outcome === 'verified_success' || !status?.retryableBookingId) return;
    setRetryError('');
    setRetrying(true);
    try {
      const result = await retrySpayBookingPayment(status.retryableBookingId);
      if (!result.paymentUrl) {
        setRetryError('Could not start the payment. Please try again.');
        setRetrying(false);
        return;
      }
      assertSafePaymentUrl(result.paymentUrl);
      window.location.href = result.paymentUrl;
    } catch (e: unknown) {
      setRetryError(e instanceof Error ? e.message : 'Could not start the payment. Please try again.');
      setRetrying(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center pt-32">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-(--bpa-green) border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    const nextPath = `/spay-neuter/payment/return?ref=${encodeURIComponent(ref)}`;
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-10">
        <div className="max-w-md mx-auto px-4 py-10 text-center">
          <Alert variant="info" title="Sign in required" message="Please sign in to view this payment's status." />
          <Link
            href={`/auth/sign-in?next=${encodeURIComponent(nextPath)}`}
            className="mt-6 inline-flex items-center justify-center bg-(--bpa-green) text-white font-bold text-sm px-6 py-3 rounded-xl hover:opacity-90"
          >
            Sign in to continue
          </Link>
        </div>
      </div>
    );
  }

  if (!ref) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500 text-sm">
        Missing payment reference.
      </div>
    );
  }

  // First load / no status yet — a distinct "Verifying payment…" state,
  // never a bare spinner and never any assumption of success or failure.
  if (checking && !status) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3 pt-32">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-(--bpa-green) border-t-transparent" />
        <p className="text-sm text-gray-500">Verifying payment…</p>
      </div>
    );
  }

  if (loadError && !status) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-10">
        <div className="max-w-md mx-auto px-4 py-10">
          <Alert variant="error" message={loadError} />
          <button type="button" onClick={() => void fetchStatus()} className="mt-4 text-sm font-semibold text-(--bpa-green) hover:underline">
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!status) return null;

  const copy = resolveSpayPaymentReturnCopy(status.outcome);
  const b = status.booking;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-10">
      <div className="max-w-lg mx-auto px-4 py-10">
        <div
          className={`bg-white rounded-2xl border shadow-sm p-7 text-center ${
            copy.variant === 'success' ? 'border-emerald-200' : copy.variant === 'pending' ? 'border-amber-200' : 'border-red-200'
          }`}
        >
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              copy.variant === 'success' ? 'bg-green-50' : copy.variant === 'pending' ? 'bg-amber-50' : 'bg-red-50'
            }`}
          >
            {copy.variant === 'success' && <CheckCircle size={32} className="text-(--bpa-green)" />}
            {copy.variant === 'pending' && <Clock size={28} className="text-amber-600" />}
            {copy.variant === 'error' && <XCircle size={28} className="text-red-600" />}
          </div>

          <h1 className="text-xl font-bold text-(--bpa-navy) mb-1">{copy.titleEn}</h1>
          <p className="text-sm text-gray-500 mb-5">{copy.messageEn}</p>

          {status.outcome === 'verified_success' && b && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-4 mb-5 text-left space-y-1 text-sm">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Booking Reference</p>
              <p className="font-mono font-extrabold text-(--bpa-navy) text-xl tracking-wider mb-3">{b.bookingNumber}</p>
              <div className="flex justify-between"><span className="text-emerald-700">Service</span><span className="font-semibold text-emerald-900 capitalize">{b.procedure}</span></div>
              <div className="flex justify-between"><span className="text-emerald-700">Clinic</span><span className="font-semibold text-emerald-900">{b.clinicName}</span></div>
              <div className="flex justify-between pt-2 mt-2 border-t border-emerald-200"><span className="text-emerald-700">Advance paid</span><span className="font-bold text-emerald-900">{formatMoney(b.advancePaidBdt)}</span></div>
              <div className="flex justify-between"><span className="text-emerald-700">Remaining at clinic</span><span className="text-emerald-900">{formatMoney(b.balanceDueBdt)}</span></div>
            </div>
          )}

          {copy.showRefreshStatus && (
            <div className="mb-5">
              <button
                type="button"
                onClick={() => { setPollAttempt(0); void fetchStatus(); }}
                disabled={checking}
                className="inline-flex items-center justify-center bg-(--bpa-green) text-white font-bold text-sm px-6 py-3 rounded-xl hover:opacity-90 disabled:opacity-60"
              >
                {checking ? 'Checking…' : 'Refresh Status'}
              </button>
            </div>
          )}

          {copy.showRetryPayment && status.retryableBookingId && (
            <div className="mb-5 flex flex-col items-center gap-2">
              {retryError && <div className="w-full text-left"><Alert variant="error" message={retryError} /></div>}
              <Button type="button" onClick={handleRetryPayment} loading={retrying} disabled={retrying}>
                Retry Payment
              </Button>
            </div>
          )}

          <div className="flex items-center justify-center gap-4">
            <Link href="/spay-neuter" className="text-sm text-(--bpa-green) hover:underline">
              ← Spay &amp; Neuter Offers
            </Link>
            <Link href="/profile/bookings" className="text-sm text-gray-500 hover:text-(--bpa-navy) hover:underline">
              My Bookings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SpayPaymentReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex justify-center pt-32">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-(--bpa-green) border-t-transparent" />
        </div>
      }
    >
      <SpayPaymentReturnInner />
    </Suspense>
  );
}
