import type { Metadata } from 'next';
import Link from 'next/link';
import { XCircle, AlertCircle, Download } from 'lucide-react';
import { normalizePaymentParams } from '@/lib/utils/eps-params';

export const metadata: Metadata = { title: 'Payment Failed', robots: { index: false, follow: false } };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

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
  const { txn, ref, reason, booking } = normalizePaymentParams(raw);

  // Display reference: prefer the 17-digit txn, fall back to any order ref found
  const displayRef = txn ?? ref;

  const isMissingTxn = reason === 'missing_txn';
  const hasAnyRef = !!displayRef;
  const canVisitCenter = reason === 'payment_failed' || reason === 'cancelled' || isMissingTxn;

  let message: string;
  if (isMissingTxn && hasAnyRef) {
    message = 'We received your payment attempt but could not confirm the transaction. Please contact support with your reference number below.';
  } else if (isMissingTxn) {
    message = 'We could not identify your payment transaction. If a payment was deducted, please contact BPA support immediately.';
  } else {
    message = REASON_MESSAGES[reason ?? ''] ?? 'The payment was not completed. No charge has been made to your account.';
  }

  const isUnknownOutcome = isMissingTxn || reason === 'verification_failed';

  const pdfUrl = booking
    ? `${API_URL}/api/v1/public/campaign-registrations/${encodeURIComponent(booking)}/slip.pdf`
    : null;

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
        <p className="text-gray-500 leading-relaxed mb-6">{message}</p>

        {/* Booking reference — shown prominently when we have one */}
        {booking && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 mb-6 text-left">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Booking Reference</p>
            <p className="font-mono font-extrabold text-(--bpa-navy) text-xl tracking-wider">{booking}</p>
          </div>
        )}

        {displayRef && !booking && (
          <p className="text-xs text-gray-400 mb-6 font-mono bg-gray-50 rounded-lg px-4 py-2 inline-block">
            Reference: {displayRef}
          </p>
        )}

        {/* Pay at center message — shown for failed/cancelled/unknown when we have a booking */}
        {canVisitCenter && booking && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800 mb-6 text-left">
            <p className="font-bold mb-1">Your booking is still saved</p>
            <p className="text-emerald-700 mb-2">
              You can visit the vaccination center on your selected date and pay at the venue.
              Show your booking reference <span className="font-mono font-bold">{booking}</span> at the entrance.
            </p>
            <p className="text-emerald-600 text-xs">
              আপনার বুকিং সংরক্ষিত হয়েছে। আপনি নির্ধারিত তারিখে টিকাদান কেন্দ্রে গিয়ে সরাসরি পেমেন্ট করতে পারবেন।
            </p>
          </div>
        )}

        {/* PDF download */}
        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-(--bpa-green) text-white font-bold px-6 py-3.5 rounded-xl hover:opacity-90 transition-opacity text-sm mb-4"
          >
            <Download size={16} />
            Download Booking Slip (PDF)
          </a>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800 mb-6 text-left">
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
