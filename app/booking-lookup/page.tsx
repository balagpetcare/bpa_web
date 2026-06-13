'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Phone, Hash } from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { getBookingByNumber } from '@/lib/api/campaigns';
import type { CampaignRegistration, CampaignRegistrationStatus } from '@/types/bpa.types';

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
  pending_payment: 'text-amber-700 bg-amber-50',
  paid: 'text-green-700 bg-green-50',
  checked_in: 'text-blue-700 bg-blue-50',
  vaccinated: 'text-purple-700 bg-purple-50',
  certificate_issued: 'text-indigo-700 bg-indigo-50',
  completed: 'text-gray-600 bg-gray-50',
  no_show: 'text-red-600 bg-red-50',
  cancelled: 'text-red-700 bg-red-50',
};

export default function BookingLookupPage() {
  const router = useRouter();
  const [bookingNumber, setBookingNumber] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<CampaignRegistration | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const bn = bookingNumber.trim().toUpperCase();
    if (!bn && !mobile.trim()) {
      setError('Please enter a booking number or mobile number.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);

    try {
      if (bn) {
        const reg = await getBookingByNumber(bn);
        // If mobile provided, validate match
        if (mobile.trim() && reg.owner.mobile.replace(/\D/g, '') !== mobile.replace(/\D/g, '')) {
          setError('Booking number and mobile number do not match.');
          setLoading(false);
          return;
        }
        setResult(reg);
      } else {
        setError('Please enter your booking number (e.g. BPA-BK-20260615-00001).');
      }
    } catch {
      setError('Booking not found. Please check your booking number and try again.');
    } finally {
      setLoading(false);
    }
  }

  function viewBooking(reg: CampaignRegistration) {
    router.push(`/campaigns/${reg.campaign.slug}/booking/${reg.bookingNumber}`);
  }

  return (
    <>
      <section className="bg-gray-50 border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Campaigns', href: '/campaigns' }, { label: 'Find My Booking' }]} />
          <h1 className="mt-4 text-4xl font-bold text-(--bpa-navy)">Find Your Booking</h1>
          <p className="mt-3 text-lg text-gray-500 max-w-xl">
            Enter your booking number to retrieve your confirmation and QR codes.
          </p>
        </div>
      </section>

      <div className="py-16">
        <div className="max-w-lg mx-auto px-4">
          <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-5">
            {error && <Alert variant="error" message={error} />}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <Hash size={14} className="text-(--bpa-green)" /> Booking Number
              </label>
              <input
                type="text"
                value={bookingNumber}
                onChange={e => setBookingNumber(e.target.value)}
                placeholder="e.g. BPA-BK-20260615-00001"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm uppercase placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-(--bpa-green)"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
              <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">and / or</span></div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <Phone size={14} className="text-(--bpa-green)" /> Mobile Number
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                inputMode="tel"
                placeholder="e.g. 01712345678"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green)"
              />
            </div>

            <Button type="submit" variant="primary" size="md" className="w-full" loading={loading}>
              <Search size={16} /> Find Booking
            </Button>
          </form>

          {/* Result */}
          {result && (
            <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Booking Found</p>
                  <p className="font-bold text-(--bpa-navy) text-lg mt-1">{result.bookingNumber}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{result.campaign.title}</p>
                  <p className="text-sm text-gray-500">{result.owner.ownerName} · {result.owner.mobile}</p>
                  <p className="text-sm text-gray-500">{result.petBookings.length} pet{result.petBookings.length !== 1 ? 's' : ''}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 ${STATUS_COLOR[result.status] ?? STATUS_COLOR.paid}`}>
                  {STATUS_LABEL[result.status]}
                </span>
              </div>
              <Button variant="primary" size="md" className="w-full mt-5" onClick={() => viewBooking(result)}>
                View Booking Details & QR Codes
              </Button>
            </div>
          )}

          <div className="mt-8 text-center text-sm text-gray-400">
            <Link href="/campaigns" className="text-(--bpa-green) hover:underline">Browse all campaigns →</Link>
          </div>
        </div>
      </div>
    </>
  );
}
