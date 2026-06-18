import type { Metadata } from 'next';
import Link from 'next/link';
import { getDonationStatus } from '@/lib/api/donations';
import { CheckCircle, XCircle, Heart, Download, AlertCircle, FileText } from 'lucide-react';
import { isBangladeshDonor } from '@/lib/constants/countries';
import { getDonationReceiptPdfUrl } from '@/lib/utils/api-url';
import ThankYouActions from './ThankYouActions';

export const metadata: Metadata = {
  title: 'Thank You for Your Donation — Bangladesh Pet Association',
  robots: { index: false, follow: false },
};

const COPY = {
  bn: {
    successTitle:   'আপনার অনুদানের জন্য আন্তরিক ধন্যবাদ',
    successSub:     'আপনার সহায়তা বাংলাদেশে প্রাণীদের উদ্ধার, চিকিৎসা, টিকাদান, খাদ্য সহায়তা এবং কল্যাণমূলক কার্যক্রমে গুরুত্বপূর্ণ ভূমিকা রাখছে।',
    pendingTitle:   'পেমেন্ট প্রক্রিয়াধীন',
    pendingSub:     'পেমেন্ট গেটওয়ে থেকে নিশ্চিতকরণের অপেক্ষা করছি। পেমেন্ট সম্পন্ন হলে রসিদ পাওয়া যাবে।',
    failTitle:      'অনুদান সফল হয়নি',
    failSub:        'দুঃখিত, আপনার অনুদান এই মুহূর্তে প্রক্রিয়া করা যায়নি। আপনার অ্যাকাউন্ট থেকে কোনো অর্থ কাটা হয়নি।',
    refLabel:       'রেফারেন্স নম্বর',
    amountLabel:    'অনুদানের পরিমাণ',
    supportFor:     'সহায়তার উদ্দেশ্য',
    donorLabel:     'দাতার নাম',
    paidAtLabel:    'পেমেন্টের তারিখ',
    downloadBtn:    'অফিসিয়াল রসিদ PDF ডাউনলোড করুন',
    viewReceiptBtn: 'অনলাইন রসিদ দেখুন',
    homeBtn:        'হোমে ফিরে যান',
    tryAgainBtn:    'আবার চেষ্টা করুন',
    heroesLine:     'আপনি ৫,০০০+ হিরোর দলে যোগ দিয়েছেন!',
  },
  en: {
    successTitle:   'Thank You for Your Generous Gift',
    successSub:     "Your support makes a meaningful difference in the lives of animals in Bangladesh through rescue, treatment, vaccination, food support, and welfare programs.",
    pendingTitle:   'Donation Processing',
    pendingSub:     'We are waiting for confirmation from the payment gateway. Your receipt will be available once the payment clears.',
    failTitle:      'Donation Unsuccessful',
    failSub:        "We're sorry, but your donation could not be processed at this time. No funds have been deducted from your account.",
    refLabel:       'Reference No',
    amountLabel:    'Amount',
    supportFor:     'Support For',
    donorLabel:     'Donor',
    paidAtLabel:    'Paid At',
    downloadBtn:    'Download Official Receipt PDF',
    viewReceiptBtn: 'View Receipt Online',
    homeBtn:        'Return to Home',
    tryAgainBtn:    'Try Again',
    heroesLine:     "You've joined 5,000+ other heroes!",
  },
};

export default async function DonationThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ donationNumber?: string; status?: string; reason?: string }>;
}) {
  const { donationNumber, status: statusParam } = await searchParams;

  let donation = null;
  if (donationNumber) {
    try {
      donation = await getDonationStatus(donationNumber);
    } catch {
      // still show page with status from query param
    }
  }

  const resolvedStatus = donation?.status || statusParam;
  const isSuccess = resolvedStatus === 'success';
  const isPending = resolvedStatus === 'pending';
  const isBn     = isBangladeshDonor(donation?.donorCountry);
  const t        = isBn ? COPY.bn : COPY.en;

  const pdfUrl = donation?.referenceNo
    ? getDonationReceiptPdfUrl(donation.referenceNo, isBn ? 'bn' : 'en')
    : null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-20 bg-gray-50">
      <div className="max-w-xl w-full mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">

          {/* Status header */}
          <div className={`p-10 text-center ${isSuccess ? 'bg-green-50' : isPending ? 'bg-amber-50' : 'bg-red-50'}`}>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 bg-white shadow-sm">
              {isSuccess ? (
                <CheckCircle size={48} className="text-(--bpa-green)" />
              ) : isPending ? (
                <AlertCircle size={48} className="text-amber-500" />
              ) : (
                <XCircle size={48} className="text-red-500" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-(--bpa-navy) mb-3">
              {isSuccess ? t.successTitle : isPending ? t.pendingTitle : t.failTitle}
            </h1>
            <p className="text-gray-600 leading-relaxed text-sm">
              {isSuccess ? t.successSub : isPending ? t.pendingSub : t.failSub}
            </p>
          </div>

          <div className="p-8 space-y-6">
            {/* Donation summary */}
            {donation && (
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-3.5">
                <Row label={t.refLabel} value={
                  <span className="font-mono font-bold text-(--bpa-navy)">{donation.referenceNo}</span>
                } />
                <Row label={t.amountLabel} value={
                  <span className="font-bold text-(--bpa-navy) text-lg">
                    {donation.currency} {donation.amount.toLocaleString()}
                  </span>
                } />
                {(donation.campaignTitle || donation.purposeTitle) && (
                  <Row label={t.supportFor} value={
                    <span className="font-semibold text-(--bpa-green)">
                      {donation.campaignTitle || donation.purposeTitle}
                    </span>
                  } />
                )}
                <Row label={t.donorLabel} value={
                  <span className="font-semibold text-(--bpa-navy)">{donation.donorName}</span>
                } />
                {isSuccess && donation.paidAt && (
                  <Row label={t.paidAtLabel} value={
                    <span className="text-gray-600">
                      {new Date(donation.paidAt).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                  } />
                )}
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex flex-col gap-3">
              {isSuccess && donation && pdfUrl ? (
                <>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-(--bpa-navy) hover:bg-black text-white font-bold rounded-xl transition-colors text-sm"
                  >
                    <Download size={16} />
                    {t.downloadBtn}
                  </a>
                  <Link
                    href={`/donation/receipt/${donation.referenceNo}`}
                    className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-(--bpa-navy) text-(--bpa-navy) font-bold rounded-xl hover:bg-(--bpa-navy) hover:text-white transition-colors text-sm"
                  >
                    <FileText size={16} />
                    {t.viewReceiptBtn}
                  </Link>
                </>
              ) : isPending ? (
                <ThankYouActions isPending />
              ) : (
                <Link
                  href="/donate"
                  className="w-full flex items-center justify-center py-3.5 bg-(--bpa-green) text-white font-bold rounded-xl hover:brightness-110 transition text-sm"
                >
                  {t.tryAgainBtn}
                </Link>
              )}

              <Link
                href="/"
                className="w-full text-center py-2 text-sm font-bold text-gray-400 hover:text-(--bpa-navy) transition-colors"
              >
                {t.homeBtn}
              </Link>
            </div>
          </div>
        </div>

        {isSuccess && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm">
              <Heart size={16} className="text-(--bpa-green) fill-current" />
              <span className="text-sm font-bold text-(--bpa-navy)">{t.heroesLine}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-400 font-medium uppercase tracking-wider text-[10px]">{label}</span>
      <span>{value}</span>
    </div>
  );
}
