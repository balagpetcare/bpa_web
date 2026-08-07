'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import { formatMoney } from '@/lib/utils/format';
import { assertSafePaymentUrl } from '@/lib/utils/payment-redirect';
import { getMySpayBooking, retrySpayBookingPayment, cancelMySpayBooking, type SpayBookingRecord } from '@/lib/api/spay-neuter';
import { computeAmountDueAtClinic } from '@/lib/spay-neuter/booking-confirmation';
import { buildBookingHref } from '@/lib/spay-neuter/offer-detail';
import {
  resolveBookingStatusLabel,
  isRetryPaymentEligible,
  isOwnerCancellable,
  isSlotReleasedUnpaid,
  formatBookingDateTime,
} from '@/lib/spay-neuter/booking-status-labels';

export default function BookingDetailPage() {
  const params = useParams<{ bookingId: string }>();
  const bookingId = params.bookingId;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [booking, setBooking] = useState<SpayBookingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  // Distinguishes "belongs to someone else / doesn't exist" (never reveal
  // which) from a transient network/server error — the former shows a flat
  // not-found message with no Retry (retrying can't fix an ownership
  // mismatch), the latter offers Retry.
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    setNotFound(false);
    try {
      const result = await getMySpayBooking(bookingId);
      setBooking(result);
    } catch (e: unknown) {
      // The API returns 403 for "belongs to a different account" and 404
      // for "doesn't exist" — both are shown identically here (never
      // distinguishing them to the caller, same principle as the payment-
      // return status lookup: no existence leak for another user's data).
      if (e instanceof ApiError && (e.status === 403 || e.status === 404)) {
        setNotFound(true);
      } else {
        setError('Could not load this booking. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/sign-in?next=${encodeURIComponent(`/profile/bookings/${bookingId}`)}`);
    }
  }, [authLoading, user, bookingId, router]);

  useEffect(() => {
    if (user && bookingId) void load();
  }, [user, bookingId, load]);

  async function handleRetry() {
    if (!booking || retrying) return;
    setRetryError('');
    setRetrying(true);
    try {
      const result = await retrySpayBookingPayment(booking.id);
      if (!result.paymentUrl) {
        setRetryError('Could not start the payment. Please try again.');
        setRetrying(false);
        return;
      }
      assertSafePaymentUrl(result.paymentUrl);
      window.location.href = result.paymentUrl;
    } catch (e: unknown) {
      setRetryError(e instanceof Error ? e.message : 'Could not start the payment. Please try again.');
      setRetrying(false);
    }
  }

  async function handleCancel() {
    if (!booking || cancelling) return;
    setCancelError('');
    setCancelling(true);
    try {
      const updated = await cancelMySpayBooking(booking.id);
      setBooking(updated);
      setShowCancelConfirm(false);
    } catch (e: unknown) {
      setCancelError(e instanceof Error ? e.message : 'Could not cancel this booking. Please try again.');
    } finally {
      setCancelling(false);
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center pt-32">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-(--bpa-green) border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-lg mx-auto px-4">
        <Link href="/profile/bookings" className="inline-flex items-center gap-1 text-sm text-(--bpa-green) hover:underline mb-5">
          <ArrowLeft size={14} /> My Bookings
        </Link>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-(--bpa-green) border-t-transparent" />
          </div>
        )}

        {!loading && notFound && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <Alert variant="error" message="This booking could not be found on your account." />
            <Link href="/profile/bookings" className="mt-4 inline-block text-sm font-semibold text-(--bpa-green) hover:underline">
              Back to My Bookings
            </Link>
          </div>
        )}

        {!loading && !notFound && error && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <Alert variant="error" message={error} />
            <button type="button" onClick={() => void load()} className="mt-4 text-sm font-semibold text-(--bpa-green) hover:underline">
              Try again
            </button>
          </div>
        )}

        {!loading && !notFound && !error && booking && (() => {
          // Server-authoritative — never a client-side estimate (see
          // SpayBookingRecord.paymentDueAt's own doc comment).
          const statusLabel = resolveBookingStatusLabel(booking.status, booking.paymentDueAt);
          const retryEligible = isRetryPaymentEligible(booking.status, booking.paymentDueAt);
          const cancellable = isOwnerCancellable(booking.status);
          const slotReleasedUnpaid = isSlotReleasedUnpaid(booking.status, booking.cancellationReasonCode);
          const isConfirmed = booking.status === 'confirmed';
          const amountDue = computeAmountDueAtClinic(booking.totalPriceBdt, booking.advancePaidBdt);

          return (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-start justify-between gap-3 mb-1">
                <p className="text-xs text-gray-400 font-mono">{booking.bookingNumber}</p>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-50 border border-gray-200 text-gray-700">
                  {statusLabel.labelEn} <span className="ml-1 font-normal text-[10px] opacity-70" lang="bn">/ {statusLabel.labelBn}</span>
                </span>
              </div>
              <h1 className="text-xl font-bold text-(--bpa-navy) capitalize mb-4">{booking.procedure} Booking</h1>

              <div className="space-y-1.5 text-sm text-gray-600 mb-4">
                <p className="flex items-center gap-1.5"><MapPin size={13} className="text-(--bpa-green) shrink-0" /> {booking.clinicNameSnapshot}</p>
                {booking.clinicAddressSnapshot && <p className="text-xs text-gray-400 ml-5">{booking.clinicAddressSnapshot}</p>}
                <p className="flex items-center gap-1.5"><Calendar size={13} className="text-(--bpa-green) shrink-0" /> {formatBookingDateTime(booking.scheduledStartAt, 'en')}</p>
              </div>

              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Total price</span><span className="font-semibold text-(--bpa-navy)">{formatMoney(booking.totalPriceBdt)}</span></div>
                <div className="flex justify-between">
                  <span className="text-gray-500">BDT 500 advance</span>
                  <span className={`font-semibold ${isConfirmed ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {isConfirmed ? `${formatMoney(booking.advancePaidBdt)} paid` : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 mt-2 border-t border-gray-200"><span className="text-gray-500">Remaining at clinic</span><span className="font-bold text-(--bpa-navy)">{formatMoney(amountDue)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400 text-xs">Booked on</span><span className="text-gray-400 text-xs">{formatBookingDateTime(booking.createdAt, 'en')}</span></div>
              </div>

              {booking.cancellationPolicySnapshot && (
                <details className="mb-4 text-xs text-gray-500 bg-gray-50 rounded-lg border border-gray-200 p-3">
                  <summary className="font-semibold text-gray-600 cursor-pointer">Cancellation Policy</summary>
                  <p className="mt-2 whitespace-pre-line">{booking.cancellationPolicySnapshot}</p>
                </details>
              )}

              {retryError && <div className="mb-3"><Alert variant="error" message={retryError} /></div>}
              {cancelError && <div className="mb-3"><Alert variant="error" message={cancelError} /></div>}

              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100 mt-2">
                {retryEligible && (
                  <Button type="button" onClick={handleRetry} loading={retrying} disabled={retrying}>
                    Retry Payment
                  </Button>
                )}
                {slotReleasedUnpaid && (
                  <Link
                    href={buildBookingHref(booking.offerId)}
                    className="inline-flex items-center justify-center bg-(--bpa-green) text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:opacity-90"
                  >
                    Book a New Time
                  </Link>
                )}
                {cancellable && !showCancelConfirm && (
                  <button
                    type="button"
                    onClick={() => setShowCancelConfirm(true)}
                    className="text-sm font-semibold text-red-600 hover:underline"
                  >
                    Cancel Booking
                  </button>
                )}
                {cancellable && showCancelConfirm && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">Cancel this booking?</span>
                    <button type="button" onClick={handleCancel} disabled={cancelling} className="text-sm font-bold text-red-600 hover:underline disabled:opacity-60">
                      {cancelling ? 'Cancelling…' : 'Yes, cancel'}
                    </button>
                    <button type="button" onClick={() => setShowCancelConfirm(false)} className="text-sm text-gray-500 hover:underline">
                      No
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
