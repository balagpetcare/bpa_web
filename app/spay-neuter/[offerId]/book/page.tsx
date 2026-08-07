import { notFound } from 'next/navigation';
import { getPublicSpayOffer } from '@/lib/api/spay-neuter';
import { resolveServiceSearchParam } from '@/lib/spay-neuter/offer-detail';
import BookingWizard from './BookingWizard';

interface PageProps {
  params: Promise<{ offerId: string }>;
  searchParams: Promise<{ service?: string | string[] }>;
}

// Mirrors the offer detail page's own validation
// (app/spay-neuter/[offerId]/page.tsx) exactly — same fetch, same
// notFound() on a missing/unpublished/deleted offer, same branded
// app/not-found.tsx experience — so a bad or stale link into the booking
// flow never falls through to the client wizard's own less specific
// "Campaign not found." state. offer.bookable === false (a real, published
// offer that just isn't currently open) is a DIFFERENT, non-404 case and is
// still handled inside BookingWizard, unchanged.
export default async function SpayBookingRoutePage({ params, searchParams }: PageProps) {
  const { offerId } = await params;
  const sp = await searchParams;
  // Invalid/unrecognized values (anything other than SPAY/NEUTER,
  // case-insensitive) normalize to null and are silently ignored — the
  // user just lands on Step 1 with nothing preselected, never a 404.
  const initialService = resolveServiceSearchParam(sp.service);

  let offer;
  try {
    offer = await getPublicSpayOffer(offerId);
  } catch {
    notFound();
  }
  if (!offer) notFound();

  return <BookingWizard offerId={offerId} initialOffer={offer} initialService={initialService} />;
}
