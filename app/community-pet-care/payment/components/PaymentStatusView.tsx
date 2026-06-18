'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, AlertTriangle, XCircle, FileText, CreditCard, ExternalLink, ArrowLeft, RefreshCw } from 'lucide-react';
import { getPublicMembershipStatus, type MembershipPublicStatus } from '@/lib/api/community-membership';
import { BASE_URL } from '@/lib/api';

interface Props {
  reference: string;
  initialType?: 'success' | 'failed' | 'cancelled' | 'status';
}

export default function PaymentStatusView({ reference: ref, initialType = 'status' }: Props) {
  const [membership, setMembership] = useState<MembershipPublicStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!ref) {
      setLoading(false);
      setError('No reference ID provided.');
      return;
    }

    let active = true;
    let timerId: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const data = await getPublicMembershipStatus(ref);
        if (!active) return;
        setMembership(data);
        setError(null);
        setLoading(false);

        // Keep polling only if it is still pending
        if (data.status === 'pending_payment' && data.paymentStatus === 'pending') {
          timerId = setTimeout(checkStatus, 3000);
        }
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to retrieve membership status');
        setLoading(false);
      }
    };

    checkStatus();

    return () => {
      active = false;
      clearTimeout(timerId);
    };
  }, [ref, retryCount]);

  if (loading && !membership) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-12">
        <RefreshCw className="animate-spin h-10 w-10 text-(--bpa-green) mb-4" />
        <p className="text-gray-600 font-medium">Fetching payment status...</p>
        <p className="text-xs text-gray-400 mt-1">Please wait a moment while we locate your record.</p>
      </div>
    );
  }

  if (error && !membership) {
    return (
      <div className="max-w-md w-full mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={36} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-(--bpa-navy) mb-3">Lookup Failed</h1>
        <p className="text-gray-500 mb-6 text-sm leading-relaxed">{error}</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => { setLoading(true); setRetryCount(c => c + 1); }}
            className="flex items-center justify-center gap-2 bg-(--bpa-green) text-white font-bold px-6 py-3 rounded-xl hover:opacity-95 transition-opacity text-sm w-full"
          >
            Retry Verification
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors px-6 py-3 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const status = membership?.status || 'pending_payment';
  const paymentStatus = membership?.paymentStatus || 'pending';
  const cardIssued = membership?.cardIssued || false;

  const isVerifying = status === 'pending_payment' && paymentStatus === 'pending';
  const isPaid = status === 'paid' || cardIssued;
  const isCancelled = status === 'cancelled' || initialType === 'cancelled';
  const isFailed = status === 'failed' || initialType === 'failed';

  const cleanBaseUrl = BASE_URL.replace(/\/$/, '');
  const receiptUrl = `${cleanBaseUrl}/api/v1/public/memberships/${ref}/receipt.pdf`;
  const cardUrl = `${cleanBaseUrl}/api/v1/public/memberships/${ref}/card.pdf`;

  return (
    <div className="max-w-xl w-full mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 sm:p-10 text-center">
        
        {/* Paid / Success View */}
        {isPaid && (
          <>
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-200">
              <CheckCircle size={44} className="text-(--bpa-green)" />
            </div>
            <h1 className="text-3xl font-extrabold text-(--bpa-navy) mb-2">Payment Successful!</h1>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              Thank you for becoming a BPA Care Partner. Your contribution funds community clinic access in your zone.
            </p>

            {/* Details Card */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-8 text-left space-y-4">
              <div className="border-b border-gray-200/60 pb-3 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Reference ID</span>
                  <span className="font-mono font-bold text-sm text-(--bpa-navy)">{membership?.reference}</span>
                </div>
                {membership?.cardNumber && (
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Card Number</span>
                    <span className="font-mono font-bold text-sm text-(--bpa-green)">{membership?.cardNumber}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Member Name</span>
                  <span className="font-semibold text-(--bpa-navy)">{membership?.fullName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Membership Tier</span>
                  <span className="font-semibold text-(--bpa-navy)">{membership?.tierName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Amount Paid</span>
                  <span className="font-semibold text-(--bpa-navy)">৳{membership?.amount.toLocaleString()} BDT</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Clinic Zone</span>
                  <span className="font-semibold text-(--bpa-navy)">{membership?.preferredZone || 'N/A'}</span>
                </div>
                {membership?.validUntil && (
                  <div className="col-span-2 border-t border-gray-100 pt-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Validity Period</span>
                    <span className="text-gray-600 font-medium">
                      Until {new Date(membership.validUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} (5 Years)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Document Download Options */}
            <div className="flex flex-col gap-3 mb-6">
              <a
                href={receiptUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-(--bpa-green) text-white font-bold px-6 py-3.5 rounded-2xl hover:opacity-95 transition-opacity text-sm"
              >
                <FileText size={16} />
                Download Official Receipt PDF
              </a>
              <a
                href={cardUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-(--bpa-navy) text-white font-bold px-6 py-3.5 rounded-2xl hover:opacity-95 transition-opacity text-sm"
              >
                <CreditCard size={16} />
                Download Digital Card PDF
              </a>
              {membership?.verificationUrl && (
                <a
                  href={membership.verificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 text-xs text-(--bpa-green) font-bold py-2 hover:underline"
                >
                  <ExternalLink size={12} />
                  View/Verify Digital Card
                </a>
              )}
            </div>
          </>
        )}

        {/* Verifying / Pending View */}
        {isVerifying && (
          <>
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-200">
              <RefreshCw size={44} className="text-amber-500 animate-spin" />
            </div>
            <h1 className="text-2xl font-extrabold text-(--bpa-navy) mb-3">Payment received, verification in progress</h1>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed max-w-sm mx-auto">
              We have received your payment request and are checking with the gateway. This page will update automatically when verified.
            </p>
            <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 text-left mb-6">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest block mb-1">Purchase Reference</span>
              <span className="font-mono font-bold text-sm text-amber-800">{ref}</span>
              <span className="text-xs text-gray-500 block mt-2">
                If you made a manual transaction, it might take a few hours for our team to verify it.
              </span>
            </div>
          </>
        )}

        {/* Cancelled View */}
        {isCancelled && (
          <>
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-200">
              <AlertTriangle size={44} className="text-amber-500" />
            </div>
            <h1 className="text-2xl font-extrabold text-(--bpa-navy) mb-3">Payment Cancelled</h1>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
              You cancelled the payment process. If you want to try again, you can return to the membership page.
            </p>
          </>
        )}

        {/* Failed View */}
        {isFailed && !isPaid && !isVerifying && (
          <>
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-200">
              <XCircle size={44} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-extrabold text-(--bpa-navy) mb-3">Payment Failed</h1>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
              The payment gateway returned a failed transaction status. Please check your card/account balance or try a different payment method.
            </p>
          </>
        )}

        {/* Return / Navigation links */}
        <div className="border-t border-gray-100 pt-6 mt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors px-6 py-3.5 text-sm bg-(--bpa-navy) text-white hover:opacity-95"
          >
            Return to Home
          </Link>
          <Link
            href="/community-pet-care/contribute"
            className="inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors px-6 py-3.5 text-sm border-2 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
          >
            <ArrowLeft size={16} />
            Back to Card Purchase
          </Link>
        </div>
      </div>
    </div>
  );
}
