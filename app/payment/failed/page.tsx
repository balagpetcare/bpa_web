import type { Metadata } from 'next';
import Link from 'next/link';
import { XCircle } from 'lucide-react';

export const metadata: Metadata = { title: 'Payment Failed', robots: { index: false, follow: false } };

const REASON_MESSAGES: Record<string, string> = {
  payment_failed:       'Your payment was not completed. No charge has been made to your account.',
  cancelled:            'You cancelled the payment. No charge has been made to your account.',
  verification_failed:  'We could not verify your payment status. Please contact us if you believe payment was deducted.',
  missing_txn:          'The payment reference is missing. Please try again.',
  error:                'An unexpected error occurred. Please contact support if you believe payment was deducted.',
};

interface Props {
  searchParams: Promise<{ txn?: string; reason?: string }>;
}

export default async function PaymentFailedPage({ searchParams }: Props) {
  const { txn, reason } = await searchParams;
  const message = REASON_MESSAGES[reason ?? ''] ?? 'The payment was not completed. No charge has been made to your account.';

  return (
    <section className="min-h-[60vh] flex items-center justify-center py-20">
      <div className="max-w-md w-full mx-auto px-4 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={48} className="text-red-500" />
        </div>

        <h1 className="text-3xl font-bold text-(--bpa-navy) mb-3">Payment Failed</h1>
        <p className="text-gray-500 leading-relaxed mb-8">{message}</p>

        {txn && (
          <p className="text-xs text-gray-400 mb-8 font-mono bg-gray-50 rounded-lg px-4 py-2 inline-block">
            Reference: {txn}
          </p>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800 mb-8 text-left">
          <p className="font-semibold mb-1">Need help?</p>
          <p className="text-yellow-700">
            If you believe a payment was deducted, please contact us at{' '}
            <a href="mailto:info@bpa.org.bd" className="underline font-medium">info@bpa.org.bd</a>{' '}
            with your transaction reference above.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/membership"
            className="inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors px-7 py-3.5 text-base bg-(--bpa-navy) text-white hover:bg-(--bpa-navy)"
          >
            Try Again
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
