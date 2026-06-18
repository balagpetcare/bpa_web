import type { Metadata } from 'next';
import { getDonationReceipt } from '@/lib/api/donations';
import { Download, ArrowLeft, Mail, Phone, Globe, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import PrintButton from './PrintButton';

export const metadata: Metadata = {
  title: 'Donation Receipt — Bangladesh Pet Association',
  robots: { index: false, follow: false },
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

  if (!receipt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">✕</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Receipt Not Available</h1>
          <p className="text-gray-500 mb-6 text-sm">
            This donation may still be pending, not yet confirmed, or the reference number is incorrect.
          </p>
          <Link href="/donate" className="inline-block bg-(--bpa-navy) text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-black transition-colors">
            Return to Donate
          </Link>
        </div>
      </div>
    );
  }

  const paidDate = receipt.paidAt || receipt.createdAt;
  const paidAtFormatted = new Date(paidDate).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const paidTimeFormatted = new Date(paidDate).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit',
  });
  const amountFormatted = `${receipt.currency} ${Number(receipt.amount).toLocaleString()}`;
  const pdfUrl = `/api/v1/public/donations/receipt/${receipt.referenceNo}/pdf`;

  // QR code URL — backend renders as PNG at this endpoint
  const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(receipt.verifyUrl)}&size=120x120&margin=4`;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      {/* Action bar — hidden when printing */}
      <div className="max-w-2xl mx-auto mb-5 flex items-center justify-between no-print">
        <Link href="/" className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-(--bpa-navy) transition-colors">
          <ArrowLeft size={15} /> Back to Home
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
            Download PDF
          </a>
        </div>
      </div>

      {/* Receipt card */}
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 print:shadow-none print:border-0 print:rounded-none">

        {/* ── Header ── */}
        <div className="bg-(--bpa-navy) px-8 py-7 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            {/* Logo placeholder — swap src when logo file is available */}
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-black text-lg">B</div>
            <span className="text-white font-bold text-xl tracking-tight">Bangladesh Pet Association</span>
          </div>
          <p className="text-blue-200 text-xs uppercase tracking-widest font-semibold mt-1">Official Donation Receipt</p>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-blue-300 text-[11px]">
            <CheckCircle size={11} className="text-green-400" />
            <span>Payment Verified</span>
          </div>
        </div>

        <div className="px-8 py-7">

          {/* ── Reference + Date row ── */}
          <div className="flex justify-between items-end pb-6 border-b border-gray-100">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Reference No</p>
              <p className="font-mono font-bold text-(--bpa-navy) text-lg">{receipt.referenceNo}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Date Paid</p>
              <p className="font-semibold text-gray-700 text-sm">{paidAtFormatted}</p>
              <p className="text-gray-400 text-xs">{paidTimeFormatted}</p>
            </div>
          </div>

          {/* ── Donor + Payment details ── */}
          <div className="grid grid-cols-2 gap-6 py-6 border-b border-gray-100">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Donor</p>
              <p className="font-bold text-(--bpa-navy) text-sm">{receipt.donorName}</p>
              {receipt.organizationName && <p className="text-xs text-gray-500 mt-0.5">{receipt.organizationName}</p>}
              {receipt.donorEmail && <p className="text-xs text-gray-500 mt-0.5">{receipt.donorEmail}</p>}
              {receipt.donorCountry && <p className="text-xs text-gray-500 mt-0.5">{receipt.donorCountry}</p>}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Payment Details</p>
              <div className="space-y-1">
                <div className="flex gap-2 text-xs">
                  <span className="text-gray-400 w-16 shrink-0">Status</span>
                  <span className="font-bold text-green-600 uppercase">Paid</span>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="text-gray-400 w-16 shrink-0">Method</span>
                  <span className="text-gray-700 font-medium">{receipt.paymentProvider || 'EPS Gateway'}</span>
                </div>
                {receipt.gatewayTransactionId && (
                  <div className="flex gap-2 text-xs">
                    <span className="text-gray-400 w-16 shrink-0">Txn Ref</span>
                    <span className="font-mono text-gray-700 text-[11px] break-all">{receipt.gatewayTransactionId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Donation details table ── */}
          <table className="w-full mt-6 mb-1">
            <thead>
              <tr className="bg-(--bpa-navy) text-white">
                <th className="py-2.5 px-3 text-left text-[10px] font-bold uppercase tracking-widest rounded-l-lg">Description</th>
                <th className="py-2.5 px-3 text-right text-[10px] font-bold uppercase tracking-widest rounded-r-lg">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-50">
                <td className="py-4 px-3">
                  <p className="font-bold text-(--bpa-navy) text-sm">Donation to Bangladesh Pet Association</p>
                  <div className="mt-1 space-y-0.5">
                    {receipt.campaignTitle && (
                      <p className="text-xs text-gray-500"><span className="font-medium">Campaign:</span> {receipt.campaignTitle}</p>
                    )}
                    {receipt.purposeTitle && (
                      <p className="text-xs text-gray-500"><span className="font-medium">Purpose:</span> {receipt.purposeTitle}</p>
                    )}
                    {!receipt.campaignTitle && !receipt.purposeTitle && (
                      <p className="text-xs text-gray-500">General Fund</p>
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
            <span className="font-bold text-(--bpa-navy) text-sm uppercase tracking-wider">Total Paid</span>
            <span className="text-2xl font-black text-(--bpa-green)">{amountFormatted}</span>
          </div>

          {/* ── QR + Thank you ── */}
          <div className="flex gap-5 items-start py-6 border-t border-gray-100">
            <div className="shrink-0 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrImgUrl}
                alt="QR verification code"
                width={100}
                height={100}
                className="border border-gray-200 rounded-lg"
              />
              <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-wide">Scan to verify</p>
            </div>
            <div>
              <p className="font-bold text-(--bpa-navy) text-sm mb-1.5">Thank you for your generous gift! 🐾</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Your contribution creates a compassionate society for animals in Bangladesh.
                Every donation directly funds veterinary care, food, rescue operations, and vaccination programs.
              </p>
            </div>
          </div>

          {/* ── Policy ── */}
          <div className="bg-gray-50 rounded-xl px-4 py-3 mb-6 border border-gray-100">
            <p className="text-[11px] text-gray-400 leading-relaxed">{receipt.policy}</p>
          </div>

          {/* ── Support contacts ── */}
          <div className="flex flex-wrap gap-4 justify-center text-xs text-gray-500 border-t border-gray-100 pt-5">
            <a href={`mailto:${receipt.supportEmail}`} className="flex items-center gap-1.5 hover:text-(--bpa-navy)">
              <Mail size={12} /> {receipt.supportEmail}
            </a>
            <a href={`tel:${receipt.supportPhone.replace(/\s/g, '')}`} className="flex items-center gap-1.5 hover:text-(--bpa-navy)">
              <Phone size={12} /> {receipt.supportPhone}
            </a>
            <a href="https://bdpetassociation.org" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-(--bpa-navy)">
              <Globe size={12} /> bdpetassociation.org
            </a>
          </div>
        </div>

        {/* ── Footer band ── */}
        <div className="bg-(--bpa-navy) px-8 py-4 text-center">
          <p className="text-blue-200 text-[10px]">
            This is a computer-generated receipt and does not require a signature.
          </p>
        </div>
      </div>
    </div>
  );
}
