import type { Metadata } from 'next';
import { getDonationReceipt } from '@/lib/api/donations';
import { isBangladeshDonor } from '@/lib/constants/countries';
import { getDonationReceiptPdfUrl } from '@/lib/utils/api-url';
import { Download, ArrowLeft, Mail, Phone, Globe, CheckCircle, MapPin } from 'lucide-react';
import Link from 'next/link';
import PrintButton from './PrintButton';
import { getPublicSiteSettings, formatAddress } from '@/lib/api/site-settings';

export const metadata: Metadata = {
  title: 'Donation Receipt — Bangladesh Pet Association',
  robots: { index: false, follow: false },
};

// ── Bilingual label sets ────────────────────────────────────────────────────────

const LABELS = {
  bn: {
    receiptTitle:     'অফিসিয়াল অনুদান রসিদ',
    paymentVerified:  'পেমেন্ট যাচাইকৃত',
    refLabel:         'রেফারেন্স নম্বর',
    datePaidLabel:    'পেমেন্টের তারিখ',
    donorLabel:       'দাতার তথ্য',
    payDetailsLabel:  'পেমেন্টের বিবরণ',
    statusLabel:      'স্ট্যাটাস',
    statusPaid:       'পরিশোধিত',
    methodLabel:      'পেমেন্ট পদ্ধতি',
    txnRefLabel:      'ট্রানজেকশন রেফ.',
    descLabel:        'বিবরণ',
    amtLabel:         'পরিমাণ',
    donationTo:       'বাংলাদেশ পেট অ্যাসোসিয়েশনে অনুদান',
    campaignLabel:    'ক্যাম্পেইন',
    purposeLabel:     'উদ্দেশ্য',
    generalFund:      'সাধারণ তহবিল',
    totalPaid:        'মোট পরিশোধিত',
    scanLabel:        'যাচাই করতে স্ক্যান করুন',
    thankYou:         'আপনার মূল্যবান অনুদানের জন্য আন্তরিক ধন্যবাদ! 🐾',
    thankYouBody:     'আপনার এই অবদান বাংলাদেশ জুড়ে প্রাণীদের উদ্ধার, চিকিৎসা, টিকাদান, খাদ্য সহায়তা এবং কল্যাণমূলক কার্যক্রমে ব্যবহৃত হবে।',
    computerGenerated:'এটি একটি কম্পিউটার-জেনারেটেড রসিদ, স্বাক্ষরের প্রয়োজন নেই।',
    downloadPdf:      'PDF ডাউনলোড',
    print:            'প্রিন্ট',
    backHome:         'হোম',
    notFoundTitle:    'রসিদ পাওয়া যায়নি',
    notFoundBody:     'এই অনুদানটি এখনো প্রক্রিয়াধীন, নিশ্চিত হয়নি, অথবা রেফারেন্স নম্বরটি ভুল।',
    returnDonate:     'ফিরে যান',
  },
  en: {
    receiptTitle:     'Official Donation Receipt',
    paymentVerified:  'Payment Verified',
    refLabel:         'Reference No',
    datePaidLabel:    'Date Paid',
    donorLabel:       'Donor',
    payDetailsLabel:  'Payment Details',
    statusLabel:      'Status',
    statusPaid:       'Paid',
    methodLabel:      'Method',
    txnRefLabel:      'Txn Ref',
    descLabel:        'Description',
    amtLabel:         'Amount',
    donationTo:       'Donation to Bangladesh Pet Association',
    campaignLabel:    'Campaign',
    purposeLabel:     'Purpose',
    generalFund:      'General Fund',
    totalPaid:        'Total Paid',
    scanLabel:        'Scan to Verify',
    thankYou:         'Thank you for your generous gift! 🐾',
    thankYouBody:     'Your contribution creates a compassionate society for animals in Bangladesh. Every donation directly funds veterinary care, food, rescue operations, and vaccination programs.',
    computerGenerated:'This is a computer-generated receipt and does not require a signature.',
    downloadPdf:      'Download PDF',
    print:            'Print',
    backHome:         'Home',
    notFoundTitle:    'Receipt Not Available',
    notFoundBody:     'This donation may still be pending, not yet confirmed, or the reference number is incorrect.',
    returnDonate:     'Return to Donate',
  },
};

export default async function DonationReceiptPage({
  params,
}: {
  params: Promise<{ referenceNo: string }>;
}) {
  const { referenceNo } = await params;
  let receipt = null;
  try {
    receipt = await getDonationReceipt(referenceNo);
  } catch {
    // handled below
  }

  const s = await getPublicSiteSettings().catch(() => null);
  const orgName = s?.organizationName || 'Bangladesh Pet Association';
  const logoUrl = s?.primaryLogoUrl || null;
  const websiteUrl = s?.websiteUrl ? s.websiteUrl.replace(/^https?:\/\//, '') : 'bdpetassociation.org';
  const websiteTargetUrl = s?.websiteUrl || 'https://bdpetassociation.org';
  const displayPhone = s?.primaryPhone || s?.officialPhone || s?.supportPhone || receipt?.supportPhone || '+880 1700-000000';
  const displayEmail = s?.contactEmail || s?.supportEmail || s?.generalEmail || receipt?.supportEmail || 'support@bdpetassociation.org';
  const displayAddress = s?.addressLine || (s ? formatAddress(s) : null) || 'Dhaka, Bangladesh';

  const isBn = isBangladeshDonor(receipt?.donorCountry);
  const t = {
    ...(isBn ? LABELS.bn : LABELS.en),
    donationTo: isBn ? `${orgName}-এ অনুদান` : `Donation to ${orgName}`,
  };

  if (!receipt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-sm mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">✕</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">{t.notFoundTitle}</h1>
          <p className="text-gray-500 mb-6 text-sm">{t.notFoundBody}</p>
          <Link
            href="/donate"
            className="inline-block bg-(--bpa-navy) text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-black transition-colors"
          >
            {t.returnDonate}
          </Link>
        </div>
      </div>
    );
  }

  const paidDate         = receipt.paidAt || receipt.createdAt;
  const paidAtFormatted  = new Date(paidDate).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const paidTimeFormatted = new Date(paidDate).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit',
  });
  const amountFormatted = `${receipt.currency} ${Number(receipt.amount).toLocaleString()}`;
  const pdfUrl          = getDonationReceiptPdfUrl(receipt.referenceNo, isBn ? 'bn' : 'en');
  const qrImgUrl        = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(receipt.verifyUrl)}&size=120x120&margin=4`;

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>

      <div className="min-h-screen bg-gray-100 py-10 px-4">
        {/* Action bar — hidden when printing */}
        <div className="max-w-2xl mx-auto mb-5 flex items-center justify-between no-print">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-(--bpa-navy) transition-colors"
          >
            <ArrowLeft size={15} />
            {t.backHome}
          </Link>
          <div className="flex gap-2">
            <PrintButton />
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-(--bpa-green) text-white px-4 py-2 rounded-lg text-sm font-bold hover:brightness-110 transition"
            >
              <Download size={15} />
              {t.downloadPdf}
            </a>
          </div>
        </div>

        {/* Receipt card */}
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 print:shadow-none print:border-0 print:rounded-none">

          {/* ── Header ── */}
          <div className="bg-white border-b border-gray-100 px-8 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={`${orgName} Logo`}
                  className="max-h-12 max-w-[150px] object-contain"
                />
              ) : (
                <div className="w-12 h-12 bg-(--bpa-green) rounded-full flex items-center justify-center text-white font-black text-xl shrink-0">
                  B
                </div>
              )}
              <div>
                <p className="text-(--bpa-navy) font-bold text-lg leading-tight md:text-xl">{orgName}</p>
                <a
                  href={websiteTargetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-(--bpa-green) text-xs transition-colors"
                >
                  {websiteUrl}
                </a>
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end gap-1.5">
              <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold">
                {t.receiptTitle}
              </p>
              <div className="flex items-center gap-1.5 bg-green-50 text-(--bpa-green) px-3 py-1 rounded-full text-xs font-bold border border-green-100">
                <CheckCircle size={13} className="fill-green-100" />
                {t.paymentVerified}
              </div>
            </div>
          </div>

          <div className="px-8 py-7">

            {/* ── Reference + Date ── */}
            <div className="flex justify-between items-end pb-6 border-b border-gray-100">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  {t.refLabel}
                </p>
                <p className="font-mono font-bold text-(--bpa-navy) text-lg">{receipt.referenceNo}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  {t.datePaidLabel}
                </p>
                <p className="font-semibold text-gray-700 text-sm">{paidAtFormatted}</p>
                <p className="text-gray-400 text-xs">{paidTimeFormatted}</p>
              </div>
            </div>

            {/* ── Donor + Payment ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-gray-100">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                  {t.donorLabel}
                </p>
                <p className="font-bold text-(--bpa-navy) text-sm">{receipt.donorName}</p>
                {receipt.organizationName && (
                  <p className="text-xs text-gray-500 mt-0.5">{receipt.organizationName}</p>
                )}
                {receipt.donorEmail && (
                  <p className="text-xs text-gray-500 mt-0.5">{receipt.donorEmail}</p>
                )}
                {receipt.donorCountry && (
                  <p className="text-xs text-gray-500 mt-0.5">{receipt.donorCountry}</p>
                )}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                  {t.payDetailsLabel}
                </p>
                <div className="space-y-1.5">
                  <DetailRow label={t.statusLabel} value={
                    <span className="font-bold text-green-600 uppercase text-xs">{t.statusPaid}</span>
                  } />
                  <DetailRow label={t.methodLabel} value={
                    <span className="text-gray-700 font-medium text-xs">
                      {receipt.paymentProvider || 'EPS Gateway'}
                    </span>
                  } />
                  {receipt.gatewayTransactionId && (
                    <DetailRow label={t.txnRefLabel} value={
                      <span className="font-mono text-gray-600 text-[11px] break-all">
                        {receipt.gatewayTransactionId}
                      </span>
                    } />
                  )}
                </div>
              </div>
            </div>

            {/* ── Donation table ── */}
            <table className="w-full mt-6 mb-1">
              <thead>
                <tr className="bg-(--bpa-navy) text-white">
                  <th className="py-2.5 px-3 text-left text-[10px] font-bold uppercase tracking-widest rounded-l-lg">
                    {t.descLabel}
                  </th>
                  <th className="py-2.5 px-3 text-right text-[10px] font-bold uppercase tracking-widest rounded-r-lg">
                    {t.amtLabel}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-gray-50">
                  <td className="py-4 px-3">
                    <p className="font-bold text-(--bpa-navy) text-sm">{t.donationTo}</p>
                    <div className="mt-1 space-y-0.5">
                      {receipt.campaignTitle && (
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">{t.campaignLabel}:</span> {receipt.campaignTitle}
                        </p>
                      )}
                      {receipt.purposeTitle && (
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">{t.purposeLabel}:</span> {receipt.purposeTitle}
                        </p>
                      )}
                      {!receipt.campaignTitle && !receipt.purposeTitle && (
                        <p className="text-xs text-gray-500">{t.generalFund}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-3 text-right font-bold text-(--bpa-navy) text-base align-top">
                    {amountFormatted}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* ── Total ── */}
            <div className="flex justify-between items-center bg-green-50 border border-green-100 rounded-xl px-4 py-3.5 mb-6">
              <span className="font-bold text-(--bpa-navy) text-sm uppercase tracking-wider">
                {t.totalPaid}
              </span>
              <span className="text-2xl font-black text-(--bpa-green)">{amountFormatted}</span>
            </div>

            {/* ── QR + Thank you ── */}
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start py-6 border-t border-gray-100">
              <div className="shrink-0 text-center flex flex-col items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrImgUrl}
                  alt="QR verification code"
                  width={100}
                  height={100}
                  className="border border-gray-200 rounded-xl bg-white shadow-sm"
                />
                <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-wide">{t.scanLabel}</p>
              </div>
              <div className="text-center md:text-left">
                <p className="font-bold text-(--bpa-navy) text-base mb-2">{t.thankYou}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{t.thankYouBody}</p>
              </div>
            </div>

            {/* ── Policy ── */}
            <div className="bg-gray-50 rounded-xl px-4 py-3 mb-5 border border-gray-100">
              <p className="text-[11px] text-gray-400 leading-relaxed">{receipt.policy}</p>
            </div>

            {/* ── Contact info ── */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 justify-center text-xs text-gray-500 border-t border-gray-100 pt-6">
              <a
                href={`mailto:${displayEmail}`}
                className="flex items-center gap-1.5 hover:text-(--bpa-navy) transition-colors"
              >
                <Mail size={14} className="text-gray-400" />
                {displayEmail}
              </a>
              <a
                href={`tel:${displayPhone.replace(/\s/g, '')}`}
                className="flex items-center gap-1.5 hover:text-(--bpa-navy) transition-colors"
              >
                <Phone size={14} className="text-gray-400" />
                {displayPhone}
              </a>
              <a
                href={websiteTargetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-(--bpa-navy) transition-colors"
              >
                <Globe size={14} className="text-gray-400" />
                {websiteUrl}
              </a>
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-gray-400" />
                {displayAddress}
              </span>
            </div>
          </div>

          {/* ── Footer band ── */}
          <div className="bg-gray-50 border-t border-gray-100 px-8 py-4 text-center">
            <p className="text-gray-400 text-[11px] leading-relaxed">{t.computerGenerated}</p>
          </div>
        </div>
      </div>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2 items-start">
      <span className="text-gray-400 text-xs w-20 shrink-0">{label}</span>
      <span>{value}</span>
    </div>
  );
}
