import Link from 'next/link';
import { Calendar, FileText, ChevronRight, Syringe, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import SectionCard from './SectionCard';
import EmptyState from './EmptyState';
import type { DashboardBooking, BookingStatus } from '../types';

interface Props {
  bookings: DashboardBooking[];
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function BookingStatusPill({ status }: { status: BookingStatus }) {
  const map: Record<BookingStatus, { label: string; cls: string; icon: React.ReactNode }> = {
    pending_payment: { label: 'Pending Payment', cls: 'bg-amber-50 text-amber-700', icon: <Clock className="w-3 h-3" /> },
    paid: { label: 'Paid', cls: 'bg-blue-50 text-blue-700', icon: <CheckCircle className="w-3 h-3" /> },
    checked_in: { label: 'Checked In', cls: 'bg-purple-50 text-purple-700', icon: <CheckCircle className="w-3 h-3" /> },
    vaccinated: { label: 'Vaccinated', cls: 'bg-emerald-50 text-emerald-700', icon: <Syringe className="w-3 h-3" /> },
    certificate_issued: { label: 'Certificate Ready', cls: 'bg-(--bpa-green-light) text-(--bpa-green)', icon: <FileText className="w-3 h-3" /> },
    completed: { label: 'Completed', cls: 'bg-gray-50 text-gray-600', icon: <CheckCircle className="w-3 h-3" /> },
    no_show: { label: 'No Show', cls: 'bg-red-50 text-red-600', icon: <XCircle className="w-3 h-3" /> },
    cancelled: { label: 'Cancelled', cls: 'bg-red-50 text-red-600', icon: <XCircle className="w-3 h-3" /> },
  };
  const { label, cls, icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cls}`}>
      {icon} {label}
    </span>
  );
}

function PaymentPill({ status }: { status: DashboardBooking['paymentStatus'] }) {
  if (status === 'paid')
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700"><CheckCircle className="w-3 h-3" /> Paid</span>;
  if (status === 'pending')
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700"><AlertCircle className="w-3 h-3" /> Pending</span>;
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-600"><XCircle className="w-3 h-3" /> Failed</span>;
}

function BookingCard({ booking }: { booking: DashboardBooking }) {
  return (
    <div className="border border-gray-100 rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-(--bpa-navy) text-sm leading-tight">{booking.campaignTitle}</p>
          <p className="text-xs text-gray-400 font-mono mt-0.5">{booking.bookingNumber}</p>
        </div>
        <BookingStatusPill status={booking.status} />
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(booking.sessionDate)}</span>
        <span>{booking.petCount} pet{booking.petCount !== 1 ? 's' : ''}</span>
        {booking.totalAmountBdt > 0 && <span>৳{booking.totalAmountBdt.toLocaleString('en-IN')}</span>}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <PaymentPill status={booking.paymentStatus} />
        {booking.hasCertificate && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-(--bpa-green-light) text-(--bpa-green)">
            <FileText className="w-3 h-3" /> Certificate Available
          </span>
        )}
      </div>

      {(booking.hasCertificate || booking.status === 'pending_payment') && (
        <div className="flex gap-2 pt-1">
          {booking.hasCertificate && (
            <Link
              href={`/campaigns/${booking.campaignSlug}/booking/${booking.bookingNumber}`}
              className="flex-1 text-center px-3 py-1.5 bg-(--bpa-green-light) text-(--bpa-green) text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              View Certificate
            </Link>
          )}
          <Link
            href={`/campaigns/${booking.campaignSlug}/booking/${booking.bookingNumber}`}
            className="flex-1 text-center px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            View Details
          </Link>
        </div>
      )}
    </div>
  );
}

export default function BookingsSection({ bookings }: Props) {
  return (
    <SectionCard
      title="Campaign Bookings"
      subtitle="Vaccination &amp; campaign registrations"
      icon={<Syringe className="w-4 h-4" />}
      action={
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1 text-xs font-semibold text-(--bpa-green) hover:underline"
        >
          Browse <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      {bookings.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-6 h-6" />}
          title="No bookings yet"
          description="Register for a BPA vaccination or welfare campaign to see your bookings here."
          action={
            <Link
              href="/campaigns"
              className="inline-flex items-center px-4 py-2 bg-(--bpa-green) text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Browse Campaigns
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {bookings.slice(0, 3).map((b) => (
            <BookingCard key={b.id} booking={b} />
          ))}
          {bookings.length > 3 && (
            <Link
              href="/profile/bookings"
              className="flex items-center justify-center gap-1 w-full py-2.5 text-xs font-semibold text-(--bpa-green) border border-(--bpa-green)/20 rounded-xl hover:bg-(--bpa-green-light) transition-colors"
            >
              View all {bookings.length} bookings <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}
    </SectionCard>
  );
}
