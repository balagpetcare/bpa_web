'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, ArrowLeft, RefreshCw } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import { useAuth } from '@/context/AuthContext';
import { formatMoney } from '@/lib/utils/format';
import { listMySpayBookings, retrySpayBookingPayment, type SpayBookingRecord } from '@/lib/api/spay-neuter';
import { assertSafePaymentUrl } from '@/lib/utils/payment-redirect';
import { computeAmountDueAtClinic } from '@/lib/spay-neuter/booking-confirmation';
import { buildBookingHref } from '@/lib/spay-neuter/offer-detail';
import {
  resolveBookingStatusLabel,
  isRetryPaymentEligible,
  isSlotReleasedUnpaid,
  formatBookingDateTime,
  type BookingStatusLabel,
} from '@/lib/spay-neuter/booking-status-labels';

// Owner-facing booking dashboard — GAP FIX: the "My Bookings" links on the
// Spay & Neuter booking/payment-pending/payment-return pages have always
// pointed at /profile/bookings, but this page never existed (404). This is
// the canonical booking-history route those links now resolve to.
//
// Deliberately module-shaped rather than Spay-Neuter-specific at the top
// level: BOOKING_MODULES below is the seam where a future booking type
// (e.g. campaign registrations, which already have their own list/detail
// API and UI elsewhere — see app/profile/components/BookingsSection.tsx —
// or event registrations) would register its own fetch + card renderer,
// each rendered in its own clearly-labeled section, so records from
// different booking systems are never merged into one undifferentiated
// list. Only the Spay & Neuter module is implemented for now.

const RETURN_PATH = '/profile/bookings';

function StatusPill({ label }: { label: BookingStatusLabel }) {
  const toneClass: Record<BookingStatusLabel['tone'], string> = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    neutral: 'bg-gray-50 text-gray-600 border-gray-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${toneClass[label.tone]}`}>
      {label.labelEn} <span className="ml-1 font-normal text-[10px] opacity-70" lang="bn">/ {label.labelBn}</span>
    </span>
  );
}

function BookingCard({ booking }: { booking: SpayBookingRecord }) {
  // Server-authoritative — never a client-side estimate (see
  // SpayBookingRecord.paymentDueAt's own doc comment).
  const statusLabel = resolveBookingStatusLabel(booking.status, booking.paymentDueAt);
  const retryEligible = isRetryPaymentEligible(booking.status, booking.paymentDueAt);
  const slotReleasedUnpaid = isSlotReleasedUnpaid(booking.status, booking.cancellationReasonCode);
  const isConfirmed = booking.status === 'confirmed';
  const amountDue = computeAmountDueAtClinic(booking.totalPriceBdt, booking.advancePaidBdt);

  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState('');

  async function handleRetry() {
    if (retrying) return;
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

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-xs text-gray-400 font-mono">{booking.bookingNumber}</p>
          <p className="font-bold text-(--bpa-navy) capitalize mt-0.5">{booking.procedure}</p>
        </div>
        <StatusPill label={statusLabel} />
      </div>

      <div className="space-y-1.5 text-sm text-gray-600 mb-4">
        <p className="flex items-center gap-1.5"><MapPin size={13} className="text-(--bpa-green) shrink-0" /> {booking.clinicNameSnapshot}</p>
        <p className="flex items-center gap-1.5"><Calendar size={13} className="text-(--bpa-green) shrink-0" /> {formatBookingDateTime(booking.scheduledStartAt, 'en')}</p>
      </div>

      <div className="bg-gray-50 rounded-xl border border-gray-100 p-3 mb-4 space-y-1 text-sm">
        <div className="flex justify-between"><span className="text-gray-500">Total price</span><span className="font-semibold text-(--bpa-navy)">{formatMoney(booking.totalPriceBdt)}</span></div>
        <div className="flex justify-between">
          <span className="text-gray-500">BDT 500 advance</span>
          <span className={`font-semibold ${isConfirmed ? 'text-emerald-600' : 'text-amber-600'}`}>
            {isConfirmed ? `${formatMoney(booking.advancePaidBdt)} paid` : 'Pending'}
          </span>
        </div>
        <div className="flex justify-between"><span className="text-gray-500">Remaining at clinic</span><span className="text-gray-700">{formatMoney(amountDue)}</span></div>
        <div className="flex justify-between pt-1 mt-1 border-t border-gray-200"><span className="text-gray-400 text-xs">Booked on</span><span className="text-gray-400 text-xs">{formatBookingDateTime(booking.createdAt, 'en')}</span></div>
      </div>

      {retryError && <div className="mb-3"><Alert variant="error" message={retryError} /></div>}

      <div className="flex items-center justify-between gap-2">
        <Link href={`/profile/bookings/${booking.id}`} className="text-sm font-semibold text-(--bpa-green) hover:underline">
          View Details
        </Link>
        {retryEligible && (
          <button
            type="button"
            onClick={handleRetry}
            disabled={retrying}
            className="text-sm font-bold px-4 py-2 rounded-lg bg-(--bpa-green) text-white hover:opacity-90 disabled:opacity-60"
          >
            {retrying ? 'Starting…' : 'Retry Payment'}
          </button>
        )}
        {slotReleasedUnpaid && (
          <Link
            href={buildBookingHref(booking.offerId)}
            className="text-sm font-bold px-4 py-2 rounded-lg bg-(--bpa-green) text-white hover:opacity-90"
          >
            Book a New Time
          </Link>
        )}
      </div>
    </div>
  );
}

export default function MyBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [bookings, setBookings] = useState<SpayBookingRecord[] | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setDataLoading(true);
    setError('');
    try {
      const result = await listMySpayBookings();
      setBookings(result);
    } catch {
      setError('Could not load your bookings. Please try again.');
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/sign-in?next=${encodeURIComponent(RETURN_PATH)}`);
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center pt-32">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-(--bpa-green) border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-5">
          <Link href="/profile" className="inline-flex items-center gap-1 text-sm text-(--bpa-green) hover:underline mb-3">
            <ArrowLeft size={14} /> Back to Profile
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-(--bpa-navy)">My Bookings</h1>
        </div>

        {/* ─── Spay & Neuter module ─────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Spay &amp; Neuter</h2>

          {dataLoading && (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-7 w-7 border-2 border-(--bpa-green) border-t-transparent" />
            </div>
          )}

          {!dataLoading && error && (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <Alert variant="error" message={error} />
              <button
                type="button"
                onClick={() => void load()}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-(--bpa-green) hover:underline"
              >
                <RefreshCw size={13} /> Retry
              </button>
            </div>
          )}

          {!dataLoading && !error && bookings && bookings.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
              <Calendar size={28} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500 mb-4">You don&apos;t have any Spay &amp; Neuter bookings yet.</p>
              <Link
                href="/spay-neuter"
                className="inline-flex items-center justify-center bg-(--bpa-green) text-white font-bold text-sm px-6 py-3 rounded-xl hover:opacity-90"
              >
                Browse Spay &amp; Neuter Offers
              </Link>
            </div>
          )}

          {!dataLoading && !error && bookings && bookings.length > 0 && (
            <div className="space-y-4">
              {bookings.map((b) => (
                <BookingCard key={b.id} booking={b} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
