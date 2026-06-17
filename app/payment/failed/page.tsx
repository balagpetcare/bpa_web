import type { Metadata } from 'next';
import Link from 'next/link';
import { XCircle, AlertCircle } from 'lucide-react';
import { normalizePaymentParams } from '@/lib/utils/eps-params';

export const metadata: Metadata = { title: 'Payment Failed', robots: { index: false, follow: false } };

const REASON_MESSAGES: Record<string, string> = {
  payment_failed:      'Your payment was not completed. No charge has been made to your account.',
  cancelled:           'You cancelled the payment. No charge has been made to your account.',
  verification_failed: 'We could not verify your payment status. Please contact us if you believe payment was deducted.',
  error:               'An unexpected error occurred. Please contact support if you believe payment was deducted.',
  // missing_txn is handled separately below — message depends on whether a ref ID was found
};

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PaymentFailedPage({ searchParams }: Props) {
  const raw = await searchParams;
  const { txn, ref, reason } = normalizePaymentParams(raw);

  // Display reference: prefer the 17-digit txn, fall back to any order ref found
  const displayRef = txn ?? ref;

  // When the transaction ID was missing but we received some other reference,
  // this likely means EPS sent the callback with a non-standard param name and
  // the backend couldn't normalise it — the payment outcome is unknown.
  const isMissingTxn = reason === 'missing_txn';
  const hasAnyRef = !!displayRef;

  let message: string;
  if (isMissingTxn && hasAnyRef) {
    message = 'We received your payment attempt but could not confirm the transaction. Please contact support with your reference number below.';
  } else if (isMissingTxn) {
    message = 'We could not identify your payment transaction. If a payment was deducted, please contact BPA support immediately.';
  } else {
    message = REASON_MESSAGES[reason ?? ''] ?? 'The payment was not completed. No charge has been made to your account.';
  }

  // Choose icon/colour based on whether the outcome is "definitely failed" or "unknown"
  const isUnknownOutcome = isMissingTxn || reason === 'verification_failed';

  return (
    <section className="min-h-[60vh] flex items-center justify-center py-20">
      <div className="max-w-md w-full mx-auto px-4 text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isUnknownOutcome ? 'bg-amber-50' : 'bg-red-50'}`}>
          {isUnknownOutcome
            ? <AlertCircle size={48} className="text-amber-500" />
            : <XCircle size={48} className="text-red-500" />
          }
        </div>

        <h1 className="text-3xl font-bold text-(--bpa-navy) mb-3">
          {isUnknownOutcome ? 'Payment Status Unknown' : 'Payment Failed'}
        </h1>
        <p className="text-gray-500 leading-relaxed mb-8">{message}</p>

        {displayRef && (
          <p className="text-xs text-gray-400 mb-8 font-mono bg-gray-50 rounded-lg px-4 py-2 inline-block">
            Reference: {displayRef}
          </p>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800 mb-8 text-left">
          <p className="font-semibold mb-1">Need help?</p>
          <p className="text-yellow-700">
            If you believe a payment was deducted, please contact us at{' '}
            <a href="mailto:info@bpa.org.bd" className="underline font-medium">info@bpa.org.bd</a>
            {displayRef && (
              <> with reference <span className="font-mono font-bold">{displayRef}</span></>
            )}
            .
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/campaigns"
            className="inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors px-7 py-3.5 text-base bg-(--bpa-navy) text-white hover:bg-(--bpa-navy)"
          >
            {reason === 'cancelled' ? 'Back to Campaigns' : 'Try Again'}
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors px-7 py-3.5 text-base border-2 border-(--bpa-green) text-(--bpa-green) hover:bg-(--bpa-navy)"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
