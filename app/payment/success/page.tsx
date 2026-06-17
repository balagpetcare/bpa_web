import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { normalizePaymentParams } from '@/lib/utils/eps-params';

export const metadata: Metadata = { title: 'Payment Successful', robots: { index: false, follow: false } };

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const raw = await searchParams;
  const { txn } = normalizePaymentParams(raw);

  return (
    <section className="min-h-[60vh] flex items-center justify-center py-20">
      <div className="max-w-md w-full mx-auto px-4 text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} className="text-(--bpa-green)" />
        </div>

        <h1 className="text-3xl font-bold text-(--bpa-navy) mb-3">Payment Successful!</h1>
        <p className="text-gray-500 leading-relaxed mb-2">
          Your payment has been verified and processed successfully.
        </p>
        <p className="text-gray-400 text-sm mb-8">
          A confirmation will be sent to your email address. Please keep it for your records.
        </p>

        {txn && (
          <p className="text-xs text-gray-400 mb-8 font-mono bg-gray-50 rounded-lg px-4 py-2 inline-block">
            Transaction ref: {txn}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors px-7 py-3.5 text-base bg-(--bpa-navy) text-white hover:bg-(--bpa-navy)"
          >
            Return to Home
          </Link>
          <Link
            href="/membership"
            className="inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors px-7 py-3.5 text-base border-2 border-(--bpa-green) text-(--bpa-green) hover:bg-(--bpa-navy)"
          >
            Membership Info
          </Link>
        </div>
      </div>
    </section>
  );
}
