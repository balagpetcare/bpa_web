import type { Metadata } from 'next';
import Link from 'next/link';
import { getDonationStatus } from '@/lib/api/donations';
import { CheckCircle, XCircle, Heart, Download, AlertCircle, FileText } from 'lucide-react';
import ThankYouActions from './ThankYouActions';

export const metadata: Metadata = {
  title: 'Thank You for Your Donation — Bangladesh Pet Association',
  robots: { index: false, follow: false },
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
      // ignore — we still show the page with status from query param
    }
  }

  const resolvedStatus = donation?.status || statusParam;
  const isSuccess = resolvedStatus === 'success';
  const isPending = resolvedStatus === 'pending';

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
              {isSuccess ? 'Thank You for Your Gift!' : isPending ? 'Donation Processing' : 'Donation Unsuccessful'}
            </h1>
            <p className="text-gray-600 leading-relaxed text-sm">
              {isSuccess
                ? 'Your generous contribution has been securely received. You\'re making a real difference in the lives of animals in Bangladesh.'
                : isPending
                ? 'We are waiting for confirmation from the payment gateway. Your receipt will be available once the payment clears.'
                : 'We\'re sorry, but your donation could not be processed at this time. No funds have been deducted from your account.'}
            </p>
          </div>

          <div className="p-8 space-y-6">
            {/* Donation summary */}
            {donation && (
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-3.5">
                <Row label="Reference No" value={
                  <span className="font-mono font-bold text-(--bpa-navy)">{donation.referenceNo}</span>
                } />
                <Row label="Amount" value={
                  <span className="font-bold text-(--bpa-navy) text-lg">
                    {donation.currency} {donation.amount.toLocaleString()}
                  </span>
                } />
                {(donation.campaignTitle || donation.purposeTitle) && (
                  <Row label="Support For" value={
                    <span className="font-semibold text-(--bpa-green)">
                      {donation.campaignTitle || donation.purposeTitle}
                    </span>
                  } />
                )}
                <Row label="Donor" value={
                  <span className="font-semibold text-(--bpa-navy)">{donation.donorName}</span>
                } />
                {isSuccess && donation.paidAt && (
                  <Row label="Paid At" value={
                    <span className="text-gray-600">
                      {new Date(donation.paidAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  } />
                )}
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex flex-col gap-3">
              {isSuccess && donation ? (
                <>
                  <a
                    href={`/api/v1/public/donations/receipt/${donation.referenceNo}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-(--bpa-navy) hover:bg-black text-white font-bold rounded-xl transition-colors text-sm"
                  >
                    <Download size={16} />
                    Download Official Receipt (PDF)
                  </a>
                  <Link
                    href={`/donation/receipt/${donation.referenceNo}`}
                    className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-(--bpa-navy) text-(--bpa-navy) font-bold rounded-xl hover:bg-(--bpa-navy) hover:text-white transition-colors text-sm"
                  >
                    <FileText size={16} />
                    View Receipt Online
                  </Link>
                </>
              ) : isPending ? (
                <ThankYouActions isPending />
              ) : (
                <Link href="/donate" className="w-full flex items-center justify-center py-3.5 bg-(--bpa-green) text-white font-bold rounded-xl hover:brightness-110 transition text-sm">
                  Try Again
                </Link>
              )}

              <Link href="/" className="w-full text-center py-2 text-sm font-bold text-gray-400 hover:text-(--bpa-navy) transition-colors">
                Return to Home
              </Link>
            </div>
          </div>
        </div>

        {isSuccess && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm">
              <Heart size={16} className="text-(--bpa-green) fill-current" />
              <span className="text-sm font-bold text-(--bpa-navy)">You've joined 5,000+ other heroes!</span>
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
