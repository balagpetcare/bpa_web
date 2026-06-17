import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, Download } from 'lucide-react';
import { normalizePaymentParams } from '@/lib/utils/eps-params';
import { AutoDownloadFile } from '@/components/common/AutoDownloadFile';

export const metadata: Metadata = { title: 'Payment Successful', robots: { index: false, follow: false } };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const raw = await searchParams;
  const { txn, booking } = normalizePaymentParams(raw);

  const pdfUrl = booking
    ? `${API_URL}/api/v1/public/campaign-registrations/booking/${encodeURIComponent(booking)}/slip.pdf`
    : null;

  return (
    <section className="min-h-[60vh] flex items-center justify-center py-20">
      <div className="max-w-md w-full mx-auto px-4 text-center">

        {pdfUrl && booking && (
          <AutoDownloadFile
            url={pdfUrl}
            filename={`BPA-Booking-Slip-${booking}.pdf`}
            storageKey={`bpa_booking_slip_downloaded_${booking}`}
            delayMs={700}
          />
        )}

        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} className="text-(--bpa-green)" />
        </div>

        <h1 className="text-3xl font-bold text-(--bpa-navy) mb-3">Payment Successful!</h1>
        <p className="text-gray-500 leading-relaxed mb-2">
          Your payment has been verified and processed successfully.
        </p>
        <p className="text-gray-400 text-sm mb-6">
          A confirmation will be sent to your email address. Please keep your booking slip for your records.
        </p>

        {booking && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 mb-6 text-left">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Booking Reference</p>
            <p className="font-mono font-extrabold text-(--bpa-navy) text-xl tracking-wider">{booking}</p>
            <p className="text-xs text-gray-500 mt-1">
              Please bring this booking slip or reference to the vaccination center.
            </p>
          </div>
        )}

        {txn && !booking && (
          <p className="text-xs text-gray-400 mb-6 font-mono bg-gray-50 rounded-lg px-4 py-2 inline-block">
            Transaction ref: {txn}
          </p>
        )}

        {pdfUrl && (
          <div className="mb-5">
            <p className="text-xs text-gray-400 mb-2 text-center">
              Your booking slip download should start automatically. If it does not, tap the button below.
            </p>
            <p className="text-xs text-gray-400 mb-3 text-center">
              আপনার বুকিং স্লিপ স্বয়ংক্রিয়ভাবে ডাউনলোড শুরু হবে। না হলে নিচের বাটনে চাপ দিন।
            </p>
            <a
              href={pdfUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-(--bpa-green) text-white font-bold px-6 py-3.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
            >
              <Download size={16} />
              Download Booking Slip PDF
            </a>
          </div>
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
