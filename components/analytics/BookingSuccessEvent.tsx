'use client';

import { useEffect } from 'react';
import { trackBookingSuccess } from '@/lib/analytics';

interface Props {
  bookingNumber: string;
  campaignTitle: string;
  status: string;
}

/**
 * Fires booking_success (GA4) + CompleteRegistration (Meta Pixel) once
 * when the booking confirmation page mounts on the client.
 */
export default function BookingSuccessEvent({ bookingNumber, campaignTitle, status }: Props) {
  useEffect(() => {
    trackBookingSuccess({ bookingNumber, campaignTitle, status });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
