import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, XCircle, AlertCircle, Clock, Download, RefreshCw } from 'lucide-react';

export const metadata: Metadata = { title: 'Payment Status', robots: { index: false, follow: false } };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

interface PaymentStatusData {
  bookingRef: string;
  paymentRef: string | null;
  paymentStatus: string;
  bookingStatus: string;
  amount: number;
  currency: string;
  ownerPhoneMasked: string | null;
  campaignTitle: string | null;
  petCount: number;
  downloadSlipUrl: string | null;
  verifyUrl: string | null;
  createdAt: string;
}

interface StatusDisplay {
  icon: React.ReactNode;
  iconBg: string;
  heading: string;
  message: string;
  bannerBg: string;
  bannerText: string;
  badgeBg: string;
  badgeText: string;
}

function getStatusDisplay(ps: string, reason?: string | null): StatusDisplay {
  const s = ps.toLowerCase();

  if (s === 'success') {
    return {
      icon: <CheckCircle size={48} className="text-green-600" />,
      iconBg: 'bg-green-50',
      heading: 'Payment Confirmed',
      message: 'Your payment has been verified and processed. Your booking is confirmed.',
      bannerBg: 'bg-green-50 border-green-200',
      bannerText: 'text-green-800',
      badgeBg: 'bg-green-100',
      badgeText: 'text-green-700',
    };
  }
  if (s === 'cancelled' || reason === 'cancelled') {
    return {
      icon: <XCircle size={48} className="text-red-500" />,
      iconBg: 'bg-red-50',
      heading: 'Payment Cancelled',
      message: 'You cancelled the payment. No charge was made. You can complete payment at the center.',
      bannerBg: 'bg-red-50 border-red-200',
      bannerText: 'text-red-800',
      badgeBg: 'bg-red-100',
      badgeText: 'text-red-700',
    };
  }
  if (s === 'failed') {
    return {
      icon: <XCircle size={48} className="text-red-600" />,
      iconBg: 'bg-red-50',
      heading: 'Payment Failed',
      message: 'Your payment was not completed. No charge was made. Please try again or pay at the center.',
      bannerBg: 'bg-red-50 border-red-200',
      bannerText: 'text-red-800',
      badgeBg: 'bg-red-100',
      badgeText: 'text-red-700',
    };
  }
  if (s === 'pending_review') {
    return {
      icon: <AlertCircle size={48} className="text-amber-500" />,
      iconBg: 'bg-amber-50',
      heading: 'Payment Under Review',
      message: 'Your payment is being reviewed. If you believe a deduction occurred, please contact us with your booking reference.',
      bannerBg: 'bg-amber-50 border-amber-200',
      bannerText: 'text-amber-800',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-700',
    };
  }
  if (s === 'refunded') {
    return {
      icon: <CheckCircle size={48} className="text-blue-500" />,
      iconBg: 'bg-blue-50',
      heading: 'Payment Refunded',
      message: 'Your payment has been refunded. Please allow 3–5 business days for the amount to reflect in your account.',
      bannerBg: 'bg-blue-50 border-blue-200',
      bannerText: 'text-blue-800',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-700',
    };
  }
  // pending / unknown
  return {
    icon: <Clock size={48} className="text-amber-400" />,
    iconBg: 'bg-amber-50',
    heading: 'Payment Pending',
    message: 'Your booking is saved but payment has not been completed online. You can pay at the vaccination center.',
    bannerBg: 'bg-amber-50 border-amber-200',
    bannerText: 'text-amber-800',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
  };
}

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(v: string | string[] | undefined): string | undefined {
  if (!v) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

export default async function PaymentStatusPage({ searchParams }: Props) {
  const raw = await searchParams;
  const bookingRef = first(raw.bookingRef)?.trim();
  const txn = first(raw.txn)?.trim();
  const reason = first(raw.reason)?.trim();

  let data: PaymentStatusData | null = null;
  let fetchError = false;

  if (bookingRef) {
    try {
      const r = await fetch(
        `${API_URL}/public/payments/status?bookingRef=${encodeURIComponent(bookingRef)}`,
        { cache: 'no-store' },
      );
      if (r.ok) {
        const json = await r.json() as { data?: PaymentStatusData };
        data = json.data ?? null;
      }
    } catch { fetchError = true; }
  } else if (txn) {
    try {
      const r = await fetch(
        `${API_URL}/public/payments/status?paymentRef=${encodeURIComponent(txn)}`,
        { cache: 'no-store' },
      );
      if (r.ok) {
        const json = await r.json() as { data?: PaymentStatusData };
        data = json.data ?? null;
      }
    } catch { fetchError = true; }
  }

  const effectiveBookingRef = data?.bookingRef ?? bookingRef;
  const paymentStatus = data?.paymentStatus ?? (reason === 'cancelled' ? 'cancelled' : 'pending');
  const sd = getStatusDisplay(paymentStatus, reason);

  const validationSlipUrl = effectiveBookingRef
    ? `${API_URL}/public/bookings/${encodeURIComponent(effectiveBookingRef)}/validation-slip.pdf`
    : null;

  const isPaid = paymentStatus === 'success';
  const canPayAtCenter = !isPaid && paymentStatus !== 'refunded' && effectiveBookingRef;

  return (
    <section className="min-h-[60vh] flex items-center justify-center py-16">
      <div className="max-w-md w-full mx-auto px-4 text-center">

        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${sd.iconBg}`}>
          {sd.icon}
        </div>

        <h1 className="text-3xl font-bold text-(--bpa-navy) mb-3">{sd.heading}</h1>
        <p className="text-gray-500 leading-relaxed mb-6">{sd.message}</p>

        {/* Status badge */}
        <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase mb-6 ${sd.badgeBg} ${sd.badgeText}`}>
          {paymentStatus.replace(/_/g, ' ')}
        </div>

        {/* Booking reference box */}
        {effectiveBookingRef && (
          <div className={`border rounded-xl px-5 py-4 mb-5 text-left ${sd.bannerBg}`}>
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${sd.bannerText} opacity-70`}>
              Booking Reference
            </p>
            <p className={`font-mono font-extrabold text-xl tracking-wider ${sd.bannerText}`}>
              {effectiveBookingRef}
            </p>
            {data?.campaignTitle && (
              <p className="text-sm text-gray-500 mt-1">{data.campaignTitle}</p>
            )}
            {data?.petCount != null && data.petCount > 0 && (
              <p className="text-xs text-gray-400 mt-0.5">{data.petCount} pet{data.petCount !== 1 ? 's' : ''}</p>
            )}
          </div>
        )}

        {/* Amount */}
        {data?.amount != null && data.amount > 0 && (
          <p className="text-sm text-gray-500 mb-5">
            Amount: <span className="font-bold text-(--bpa-navy)">BDT {data.amount.toLocaleString('en-BD')} /-</span>
          </p>
        )}

        {/* Validation slip download */}
        {validationSlipUrl && (
          <div className="mb-5">
            <a
              href={validationSlipUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 w-full font-bold px-6 py-3.5 rounded-xl hover:opacity-90 transition-opacity text-sm ${
                isPaid
                  ? 'bg-(--bpa-green) text-white'
                  : 'bg-gray-800 text-white'
              }`}
            >
              <Download size={16} />
              Download Validation Slip PDF
            </a>
            <p className="text-xs text-gray-400 mt-2">
              {isPaid
                ? 'This slip confirms your payment. Bring it to the vaccination center.'
                : 'This slip shows your booking details and current payment status.'}
            </p>
          </div>
        )}

        {/* Pay at center info for non-paid states */}
        {canPayAtCenter && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800 mb-5 text-left">
            <p className="font-bold mb-1">Your booking is saved</p>
            <p className="text-emerald-700 mb-2">
              You can visit our vaccination center with this booking reference and complete payment there.
            </p>
            <p className="text-emerald-600 text-xs">
              এই বুকিং রেফারেন্স নিয়ে ভ্যাকসিনেশন সেন্টারে এসে পেমেন্ট করে সেবা নিতে পারবেন।
            </p>
          </div>
        )}

        {/* Error or no data fallback */}
        {fetchError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800 mb-5 text-left">
            <p className="font-semibold mb-1">Could not load booking details</p>
            <p className="text-yellow-700">
              Unable to fetch current status. If you need help, contact us at{' '}
              <a href="mailto:info@bpa.org.bd" className="underline font-medium">info@bpa.org.bd</a>.
            </p>
          </div>
        )}

        {/* Pending review contact help */}
        {paymentStatus === 'pending_review' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800 mb-6 text-left">
            <p className="font-semibold mb-1">Need help?</p>
            <p className="text-yellow-700">
              Contact us at{' '}
              <a href="mailto:info@bpa.org.bd" className="underline font-medium">info@bpa.org.bd</a>
              {effectiveBookingRef && (
                <> with booking reference <span className="font-mono font-bold">{effectiveBookingRef}</span></>
              )}.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isPaid ? (
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors px-7 py-3.5 text-base bg-(--bpa-navy) text-white hover:bg-(--bpa-navy)"
            >
              Return to Home
            </Link>
          ) : (
            <Link
              href="/campaigns"
              className="inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors px-7 py-3.5 text-base bg-(--bpa-navy) text-white hover:bg-(--bpa-navy)"
            >
              View Campaigns
            </Link>
          )}
          {/* Check again button for pending/review states */}
          {(paymentStatus === 'pending' || paymentStatus === 'pending_review') && effectiveBookingRef && (
            <Link
              href={`/payment/status?bookingRef=${encodeURIComponent(effectiveBookingRef)}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors px-7 py-3.5 text-base border-2 border-amber-400 text-amber-700 hover:bg-amber-50"
            >
              <RefreshCw size={16} />
              Check Again
            </Link>
          )}
        </div>

      </div>
    </section>
  );
}
