import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, CalendarDays, MapPin, User, Clock, Syringe } from 'lucide-react';
import QRDisplay from '@/components/campaigns/QRDisplay';
import { getBookingByNumber } from '@/lib/api/campaigns';
import type { CampaignRegistrationStatus } from '@/types/bpa.types';

const STATUS_LABEL: Record<CampaignRegistrationStatus, string> = {
  pending_payment: 'Pending Payment',
  paid: 'Confirmed',
  checked_in: 'Checked In',
  vaccinated: 'Vaccinated',
  certificate_issued: 'Certificate Issued',
  completed: 'Completed',
  no_show: 'No Show',
  cancelled: 'Cancelled',
};

const STATUS_COLOR: Record<CampaignRegistrationStatus, string> = {
  pending_payment: 'text-amber-700 bg-amber-50 border-amber-200',
  paid: 'text-green-700 bg-green-50 border-green-200',
  checked_in: 'text-blue-700 bg-blue-50 border-blue-200',
  vaccinated: 'text-purple-700 bg-purple-50 border-purple-200',
  certificate_issued: 'text-indigo-700 bg-indigo-50 border-indigo-200',
  completed: 'text-gray-600 bg-gray-50 border-gray-200',
  no_show: 'text-red-600 bg-red-50 border-red-200',
  cancelled: 'text-red-700 bg-red-50 border-red-200',
};

interface PageProps {
  params: Promise<{ slug: string; bookingNumber: string }>;
}

export default async function BookingConfirmationPage({ params }: PageProps) {
  const { bookingNumber } = await params;

  let registration: Awaited<ReturnType<typeof getBookingByNumber>>;
  try {
    registration = await getBookingByNumber(bookingNumber, { cache: 'no-store' });
  } catch {
    notFound();
  }
  if (!registration) notFound();

  const session = registration.session;
  const owner = registration.owner;
  const isConfirmed = ['paid', 'checked_in', 'vaccinated', 'certificate_issued', 'completed'].includes(registration.status);
  const statusColor = STATUS_COLOR[registration.status] ?? STATUS_COLOR.paid;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isConfirmed ? 'bg-(--bpa-green-light)' : 'bg-amber-50'}`}>
            <CheckCircle size={32} className={isConfirmed ? 'text-(--bpa-green)' : 'text-amber-500'} />
          </div>
          <h1 className="text-2xl font-bold text-(--bpa-navy)">
            {isConfirmed ? 'Booking Confirmed!' : 'Booking Received'}
          </h1>
          <p className="text-gray-500 mt-1">Booking Number: <span className="font-bold text-(--bpa-navy)">{registration.bookingNumber}</span></p>
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border mt-3 ${statusColor}`}>
            {STATUS_LABEL[registration.status]}
          </span>
        </div>

        {/* Booking summary */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6 space-y-4">
          <h2 className="font-bold text-(--bpa-navy) text-sm uppercase tracking-wide">Booking Summary</h2>

          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2 bg-gray-50 rounded-xl p-3">
              <CalendarDays size={15} className="text-(--bpa-green) mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Campaign</p>
                <p className="font-medium text-(--bpa-navy)">{registration.campaign.title}</p>
              </div>
            </div>

            {session && (
              <>
                <div className="flex items-start gap-2 bg-gray-50 rounded-xl p-3">
                  <MapPin size={15} className="text-(--bpa-green) mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Venue</p>
                    <p className="font-medium text-(--bpa-navy)">{session.venue?.name ?? 'TBC'}</p>
                    {session.venue?.zone && <p className="text-xs text-gray-400">{session.venue.zone.name}</p>}
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-gray-50 rounded-xl p-3">
                  <CalendarDays size={15} className="text-(--bpa-green) mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Date</p>
                    <p className="font-medium text-(--bpa-navy)">
                      {new Date(session.sessionDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-gray-50 rounded-xl p-3">
                  <Clock size={15} className="text-(--bpa-green) mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Time</p>
                    <p className="font-medium text-(--bpa-navy)">{session.startTime} – {session.endTime}</p>
                  </div>
                </div>
              </>
            )}

            <div className="flex items-start gap-2 bg-gray-50 rounded-xl p-3">
              <User size={15} className="text-(--bpa-green) mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Owner</p>
                <p className="font-medium text-(--bpa-navy)">{owner.ownerName}</p>
                <p className="text-xs text-gray-400">{owner.mobile}</p>
              </div>
            </div>
          </div>
        </div>

        {/* QR codes per pet */}
        {isConfirmed && registration.petBookings.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-bold text-(--bpa-navy)">Your Pet QR Codes</h2>
            <p className="text-sm text-gray-500">Bring these QR codes to the venue. The volunteer will scan them at check-in.</p>

            {registration.petBookings.map((pb) => (
              <div key={pb.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {pb.qrToken ? (
                    <QRDisplay token={pb.qrToken} petName={pb.pet?.name ?? 'Pet'} size={180} />
                  ) : (
                    <div className="w-[180px] h-[180px] bg-gray-100 rounded-xl flex items-center justify-center">
                      <p className="text-xs text-gray-400 text-center px-4">QR not yet generated</p>
                    </div>
                  )}
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <h3 className="font-bold text-(--bpa-navy) text-lg">{pb.pet?.name ?? 'Pet'}</h3>
                    <p className="text-sm text-gray-500 capitalize">{pb.pet?.petType} · {pb.pet?.gender} {pb.pet?.breed ? `· ${pb.pet.breed}` : ''}</p>
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Services</p>
                      <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                        {pb.services?.map(svc => (
                          <span key={svc.id} className="inline-flex items-center gap-1 text-xs bg-(--bpa-green-light) text-(--bpa-green) font-medium px-2 py-0.5 rounded-full">
                            <Syringe size={10} />{svc.campaignService?.name ?? 'Service'}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLOR[pb.status] ?? STATUS_COLOR.paid}`}>
                        {STATUS_LABEL[pb.status]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pending payment notice */}
        {registration.status === 'pending_payment' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
            <p className="font-semibold text-amber-800">Payment Pending</p>
            <p className="text-sm text-amber-700 mt-1">Your booking is reserved. Complete the payment to confirm your spot.</p>
          </div>
        )}

        {/* Instructions */}
        {isConfirmed && (
          <div className="bg-(--bpa-green-light) rounded-2xl p-6 mt-6">
            <h3 className="font-bold text-(--bpa-navy) mb-3">What to Bring</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-center gap-2"><CheckCircle size={14} className="text-(--bpa-green) shrink-0" /> Screenshot or download your pet&apos;s QR code(s)</li>
              <li className="flex items-center gap-2"><CheckCircle size={14} className="text-(--bpa-green) shrink-0" /> Arrive 10 minutes before your session time</li>
              <li className="flex items-center gap-2"><CheckCircle size={14} className="text-(--bpa-green) shrink-0" /> Keep your pet on a leash or in a carrier</li>
            </ul>
          </div>
        )}

        <div className="mt-6 text-center space-x-4">
          <Link href="/campaigns" className="text-sm font-medium text-(--bpa-green) hover:underline">
            ← Browse Campaigns
          </Link>
          <Link href="/booking-lookup" className="text-sm font-medium text-gray-500 hover:text-(--bpa-navy) hover:underline">
            Look up another booking
          </Link>
        </div>
      </div>
    </div>
  );
}
