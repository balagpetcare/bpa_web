import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumb from '@/components/ui/Breadcrumb';
import SectionHeader from '@/components/ui/SectionHeader';
import { getPublicSpayOffers, type SpayOfferPublic } from '@/lib/api/spay-neuter';
import { formatMoney } from '@/lib/utils/format';
import { Stethoscope, CalendarDays, MapPin } from 'lucide-react';

export const revalidate = 120;

export const metadata: Metadata = {
  title: 'Spay & Neuter Campaigns | Bangladesh Pet Association',
  description: 'Book a discounted spay or neuter appointment for your pet at a participating BPA clinic.',
};

function fmtDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const LIFECYCLE_LABEL: Record<SpayOfferPublic['lifecycleState'], { label: string; cls: string }> = {
  active: { label: 'Booking Open', cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  scheduled: { label: 'Starting Soon', cls: 'text-blue-700 bg-blue-50 border-blue-200' },
  expired: { label: 'Ended', cls: 'text-gray-600 bg-gray-100 border-gray-200' },
  closed: { label: 'Closed', cls: 'text-gray-600 bg-gray-100 border-gray-200' },
};

function OfferCard({ offer }: { offer: SpayOfferPublic }) {
  const status = LIFECYCLE_LABEL[offer.lifecycleState];
  const clinics = offer.clinics.filter((c) => c.clinicBranch.published);
  const imageUrl = offer.webImage?.url;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {imageUrl ? (
        <img src={imageUrl} alt={offer.webImage?.altText ?? offer.title} className="h-40 w-full object-cover" />
      ) : (
        <div className="h-40 w-full bg-(--bpa-green-light) flex items-center justify-center">
          <Stethoscope size={32} className="text-(--bpa-green)" />
        </div>
      )}
      <div className="p-5">
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${status.cls}`}>
          {status.label}
        </span>
        <h3 className="mt-2 font-bold text-(--bpa-navy) text-lg leading-snug">{offer.title}</h3>
        {offer.summary && <p className="mt-1 text-sm text-gray-500 line-clamp-2">{offer.summary}</p>}

        <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
          {offer.startsAt && offer.endsAt && (
            <span className="flex items-center gap-1.5">
              <CalendarDays size={13} className="text-(--bpa-green)" />
              {fmtDate(offer.startsAt)} – {fmtDate(offer.endsAt)}
            </span>
          )}
        </div>
        {clinics.length > 0 && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin size={13} className="text-(--bpa-green)" />
            {clinics.length} participating clinic{clinics.length !== 1 ? 's' : ''}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">From</p>
            <p className="font-extrabold text-(--bpa-navy)">{formatMoney(offer.neuterTotalPriceBdt)}</p>
          </div>
          <Link
            href={`/spay-neuter/${offer.id}`}
            className="inline-flex items-center justify-center bg-(--bpa-green) text-white text-sm font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function SpayNeuterOffersPage() {
  let offers: SpayOfferPublic[] = [];
  try {
    offers = await getPublicSpayOffers({ next: { revalidate: 120, tags: ['spay-neuter-offers'] } });
  } catch {
    // API unavailable — show empty state
  }

  return (
    <>
      <section className="bg-gray-50 border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Spay & Neuter' }]} />
          <h1 className="mt-4 text-4xl font-bold text-(--bpa-navy)">Spay &amp; Neuter Campaigns</h1>
          <p className="mt-3 text-lg text-gray-500 max-w-2xl">
            Book a discounted spay or neuter appointment for your pet at a participating clinic near you.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {offers.length === 0 ? (
            <div className="text-center py-24">
              <Stethoscope size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium text-lg">No spay &amp; neuter campaigns available right now.</p>
              <p className="text-gray-400 text-sm mt-1">Check back soon, or explore our other campaigns.</p>
              <Link href="/campaigns" className="mt-4 inline-block text-sm text-(--bpa-green) hover:underline">
                View all campaigns →
              </Link>
            </div>
          ) : (
            <>
              <SectionHeader eyebrow="Available Now" title="Active & Upcoming Campaigns" />
              <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {offers.map((o) => (
                  <OfferCard key={o.id} offer={o} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
