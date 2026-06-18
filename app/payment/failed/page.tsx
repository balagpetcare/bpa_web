import type { Metadata } from 'next';
import Link from 'next/link';
import { XCircle, AlertCircle, Download, Phone, Mail, Search } from 'lucide-react';
import { normalizePaymentParams } from '@/lib/utils/eps-params';
import { AutoDownloadFile } from '@/components/common/AutoDownloadFile';
import { getValidationSlipUrl } from '@/lib/utils/api-url';
import { getPublicSiteSettings, type PublicSiteSettings } from '@/lib/api/site-settings';

export const metadata: Metadata = { title: 'Payment Failed', robots: { index: false, follow: false } };

const REASON_MESSAGES: Record<string, string> = {
  payment_failed:      'Your payment was not completed. No charge has been made to your account.',
  cancelled:           'You cancelled the payment. No charge has been made to your account.',
  verification_failed: 'We could not verify your payment status. Please contact us if you believe payment was deducted.',
  error:               'An unexpected error occurred. Please contact support if you believe payment was deducted.',
};

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// ─── Contact block — shared between both views ────────────────────

function ContactBlock({ settings, urgent }: { settings: PublicSiteSettings | null; urgent?: boolean }) {
  const displayEmail = settings?.contactEmail || settings?.supportEmail || settings?.generalEmail || 'info@bpa.org.bd';
  const displayPhone = settings?.primaryPhone || settings?.supportPhone || settings?.officialPhone || '01575008300';
  const displayPhone2 = settings?.secondaryPhone || settings?.emergencyPhone || null;

  return (
    <div className={`rounded-xl p-5 text-left mb-5 ${urgent ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
      <p className={`font-bold mb-1 ${urgent ? 'text-red-900' : 'text-yellow-900'}`}>
        সহায়তা প্রয়োজন? / Need help?
      </p>
      <p className={`text-sm mb-3 ${urgent ? 'text-red-800' : 'text-yellow-800'}`}>
        {urgent
          ? 'আপনার পেমেন্ট কেটে গেলে অনুগ্রহ করে আবার পেমেন্ট করবেন না। বুকিং রেফারেন্সসহ যোগাযোগ করুন।'
          : 'If you believe a payment was deducted, please contact us with your booking reference.'}
      </p>
      <div className={`space-y-2 text-sm ${urgent ? 'text-red-900' : 'text-yellow-900'}`}>
        <a
          href={`mailto:${displayEmail}`}
          className="flex items-center gap-2 font-medium hover:underline"
        >
          <Mail size={14} />
          {displayEmail}
        </a>
        <a
          href={`tel:${displayPhone.replace(/\s/g, '')}`}
          className="flex items-center gap-2 font-medium hover:underline"
        >
          <Phone size={14} />
          {displayPhone}
        </a>
        {displayPhone2 && (
          <a
            href={`tel:${displayPhone2.replace(/\s/g, '')}`}
            className="flex items-center gap-2 font-medium hover:underline"
          >
            <Phone size={14} />
            {displayPhone2}
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Missing-txn / payment-under-review view ──────────────────────

function PaymentUnderReviewView({
  slipRef,
  displayRef,
  settings,
}: {
  slipRef: string | null;
  displayRef: string | null;
  settings: PublicSiteSettings | null;
}) {
  const slipUrl = slipRef ? getValidationSlipUrl(slipRef) : null;
  const displayEmail = settings?.contactEmail || settings?.supportEmail || settings?.generalEmail || 'info@bpa.org.bd';

  return (
    <section className="min-h-[60vh] flex items-center justify-center py-20">
      <div className="max-w-md w-full mx-auto px-4 text-center">

        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={48} className="text-amber-500" />
        </div>

        <h1 className="text-3xl font-bold text-(--bpa-navy) mb-2">
          Payment Under Review
        </h1>
        <p className="text-sm font-semibold text-amber-600 mb-4">
          Manual Payment Verification Required
        </p>

        {/* Bilingual warning — do not pay again */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 text-left">
          <p className="text-sm font-bold text-red-800 mb-1">
            ⚠ আপনার পেমেন্ট কেটে গেলে অনুগ্রহ করে আবার পেমেন্ট করবেন না।
          </p>
          <p className="text-sm font-bold text-red-800">
            ⚠ If your payment was deducted, please do not pay again.
          </p>
        </div>

        <p className="text-gray-500 text-sm leading-relaxed mb-5">
          আপনার বুকিং রেফারেন্সসহ BPA সাপোর্টে যোগাযোগ করুন অথবা ডাউনলোড করা স্লিপটি ভ্যাকসিনেশন ভেন্যুতে নিয়ে আসুন।
          <br />
          <span className="text-gray-400">
            Download your review slip and contact BPA support, or bring the slip to the vaccination venue. BPA will manually verify your payment.
          </span>
        </p>

        {/* Reference display */}
        {displayRef && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-5 text-left">
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">
              Reference
            </p>
            <p className="font-mono font-extrabold text-(--bpa-navy) text-xl tracking-wider">
              {displayRef}
            </p>
          </div>
        )}

        {/* What happens next */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 mb-5 text-left">
          <p className="font-bold mb-2">What happens next?</p>
          <ul className="space-y-1 text-blue-700 text-xs list-disc list-inside">
            <li>BPA will check the payment with the gateway and bank.</li>
            <li>If payment is confirmed, vaccination will proceed.</li>
            <li>If payment was not received, you can pay at the venue.</li>
            <li>Bring this slip or your reference number to the venue.</li>
          </ul>
        </div>

        {/* Primary CTA — Download slip */}
        {slipUrl ? (
          <div className="mb-4">
            <a
              href={slipUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-amber-500 text-white font-bold px-6 py-3.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
            >
              <Download size={16} />
              Download Payment Review Slip
            </a>
            <p className="text-xs text-gray-400 mt-2">
              এই স্লিপটি ভ্যাকসিনেশন ভেন্যুতে দেখান।
            </p>
          </div>
        ) : (
          /* No ref — show booking lookup CTA */
          <Link
            href="/campaigns"
            className="flex items-center justify-center gap-2 w-full bg-(--bpa-navy) text-white font-bold px-6 py-3.5 rounded-xl hover:opacity-90 transition-opacity text-sm mb-4"
          >
            <Search size={16} />
            Find My Booking
          </Link>
        )}

        <ContactBlock settings={settings} urgent />

        {/* Secondary actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={`mailto:${displayEmail}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors px-6 py-3 text-sm bg-amber-100 text-amber-900 hover:bg-amber-200"
          >
            <Mail size={15} />
            Contact BPA Support
          </a>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors px-6 py-3 text-sm border-2 border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Return to Home
          </Link>
        </div>

      </div>
    </section>
  );
}

// ─── Main page ────────────────────────────────────────────────────

export default async function PaymentFailedPage({ searchParams }: Props) {
  const raw = await searchParams;
  const { txn, ref, reason, booking } = normalizePaymentParams(raw);

  const settings = await getPublicSiteSettings().catch(() => null);
  const displayEmail = settings?.contactEmail || settings?.supportEmail || settings?.generalEmail || 'info@bpa.org.bd';

  const displayRef = booking ?? txn ?? ref;
  const isMissingTxn = reason === 'missing_txn';

  // For missing_txn: show the review UI — any available ref can resolve the slip
  if (isMissingTxn) {
    const slipRef = booking ?? ref ?? txn;
    return <PaymentUnderReviewView slipRef={slipRef} displayRef={displayRef} settings={settings} />;
  }

  // ── Normal failure/cancellation UI ───────────────────────────────
  const isUnknownOutcome = reason === 'verification_failed';
  const canVisitCenter = reason === 'payment_failed' || reason === 'cancelled';
  const message = REASON_MESSAGES[reason ?? ''] ?? 'The payment was not completed. No charge has been made to your account.';
  const pdfUrl = booking ? getValidationSlipUrl(booking) : null;

  return (
    <section className="min-h-[60vh] flex items-center justify-center py-20">
      <div className="max-w-md w-full mx-auto px-4 text-center">

        {pdfUrl && booking && (
          <AutoDownloadFile
            url={pdfUrl}
            filename={`BPA-Validation-Slip-${booking}.pdf`}
            storageKey={`bpa_validation_slip_downloaded_${booking}`}
            delayMs={700}
          />
        )}

        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isUnknownOutcome ? 'bg-amber-50' : 'bg-red-50'}`}>
          {isUnknownOutcome
            ? <AlertCircle size={48} className="text-amber-500" />
            : <XCircle size={48} className="text-red-500" />
          }
        </div>

        <h1 className="text-3xl font-bold text-(--bpa-navy) mb-3">
          {reason === 'cancelled' ? 'Payment Cancelled' : isUnknownOutcome ? 'Payment Needs Review' : 'Payment Failed'}
        </h1>
        <p className="text-gray-500 leading-relaxed mb-6">{message}</p>

        {booking && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 mb-5 text-left">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Booking Reference</p>
            <p className="font-mono font-extrabold text-(--bpa-navy) text-xl tracking-wider">{booking}</p>
          </div>
        )}

        {displayRef && !booking && (
          <p className="text-xs text-gray-400 mb-6 font-mono bg-gray-50 rounded-lg px-4 py-2 inline-block">
            Reference: {displayRef}
          </p>
        )}

        {canVisitCenter && booking && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800 mb-5 text-left">
            <p className="font-bold mb-1">Your booking is still saved</p>
            <p className="text-emerald-700 mb-2">
              Your booking has been received. You can still visit our vaccination center with this booking reference and complete payment at the center.
            </p>
            <p className="text-emerald-600 text-xs">
              আপনার বুকিং গ্রহণ করা হয়েছে। এই বুকিং রেফারেন্স নিয়ে আমাদের ভ্যাকসিনেশন সেন্টারে এসে সরাসরি পেমেন্ট করে সেবা নিতে পারবেন।
            </p>
          </div>
        )}

        {pdfUrl && (
          <div className="mb-5">
            <p className="text-xs text-gray-400 mb-3 text-center">
              This slip shows your booking details and current payment status.
            </p>
            <a
              href={pdfUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-gray-800 text-white font-bold px-6 py-3.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
            >
              <Download size={16} />
              Download Validation Slip PDF
            </a>
          </div>
        )}

        <ContactBlock settings={settings} />

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {booking && isUnknownOutcome ? (
            <Link
              href={`/payment/status?bookingRef=${encodeURIComponent(booking)}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors px-7 py-3.5 text-base bg-amber-500 text-white hover:opacity-90"
            >
              Check Payment Status
            </Link>
          ) : (
            <Link
              href="/campaigns"
              className="inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors px-7 py-3.5 text-base bg-(--bpa-navy) text-white hover:bg-(--bpa-navy)"
            >
              {reason === 'cancelled' ? 'Back to Campaigns' : 'Try Again'}
            </Link>
          )}
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
