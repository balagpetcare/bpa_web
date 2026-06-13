import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Users, ChevronRight } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import { getPublicZones } from '@/lib/api/community-care';
import { getSeoData } from '@/lib/api/seo';
import type { CommunityZonePublic } from '@/types/bpa.types';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData('/community-pet-care/zones').catch(() => null);
  return buildMetadata(
    {
      title: 'Community Pet Care Zones — 8 Dhaka Zones',
      description:
        'Browse all 8 BPA Community Pet Care zones in Dhaka. Each zone needs 10,000 contributors to establish a 24/7 Community Pet Clinic.',
      canonical: '/community-pet-care/zones',
      keywords: ['pet care zones', 'Dhaka', 'community pet clinic', 'BPA zones'],
    },
    seo,
  );
}

function ZoneStatusBadge({ status }: { status: string }) {
  if (status === 'active') return <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">Active</span>;
  if (status === 'coming_soon') return <span className="text-xs bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full font-medium">Coming Soon</span>;
  return <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-medium">Inactive</span>;
}

export default async function ZonesPage() {
  let zones: CommunityZonePublic[] = [];
  try {
    zones = await getPublicZones({ next: { revalidate: 300, tags: ['community-zones'] } } as RequestInit);
  } catch {
    // show empty state
  }

  return (
    <>
      <section className="bg-gray-50 border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-400 mb-4 flex gap-2 items-center">
            <Link href="/" className="hover:text-(--bpa-green)">Home</Link>
            <span>/</span>
            <Link href="/community-pet-care" className="hover:text-(--bpa-green)">Community Pet Care</Link>
            <span>/</span>
            <span className="text-gray-600">Zones</span>
          </nav>
          <h1 className="text-4xl font-bold text-(--bpa-navy)">8 Dhaka Zones</h1>
          <p className="mt-3 text-lg text-gray-500 max-w-2xl">
            Each zone is independently raising funds to establish a 24/7 BPA Community Pet Clinic.
            Each zone target is <strong>10,000 contributors</strong> at <strong>৳3,000</strong> each.
          </p>
        </div>
      </section>

      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {zones.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <MapPin size={48} className="mx-auto mb-4 opacity-40" />
              <p>Zones are being set up. Check back soon.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {zones.map((zone: CommunityZonePublic) => {
                const pct = Math.min(Math.round((zone.currentContributors / zone.targetContributors) * 100), 100);
                const amountCollected = Number(zone.currentAmountBdt);
                const amountTarget = Number(zone.targetAmountBdt);
                const amountPct = amountTarget > 0 ? Math.min(Math.round((amountCollected / amountTarget) * 100), 100) : 0;

                return (
                  <div key={zone.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    {zone.coverImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={zone.coverImage.url}
                        alt={zone.coverImage.altText ?? zone.name}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h2 className="text-lg font-bold text-(--bpa-navy)">{zone.name}</h2>
                        <ZoneStatusBadge status={zone.status} />
                      </div>
                      <p className="text-sm text-gray-400 flex items-center gap-1 mb-4">
                        <MapPin size={13} /> {zone.city}, {zone.district}
                      </p>
                      {zone.description && (
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-2">{zone.description}</p>
                      )}

                      {/* Contributors progress */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-gray-500 flex items-center gap-1"><Users size={11} /> Contributors</span>
                          <span className="font-semibold text-(--bpa-navy)">{pct}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-(--bpa-green) h-2 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {zone.currentContributors.toLocaleString()} / {zone.targetContributors.toLocaleString()} contributors
                        </p>
                      </div>

                      {/* Amount progress */}
                      <div className="mb-5">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-gray-500">Amount Collected</span>
                          <span className="font-semibold text-(--bpa-navy)">{amountPct}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-blue-400 h-2 rounded-full" style={{ width: `${amountPct}%` }} />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          ৳{amountCollected.toLocaleString()} / ৳{amountTarget.toLocaleString()}
                        </p>
                      </div>

                      {zone.status === 'active' && (
                        <Link
                          href={`/community-pet-care/contribute?zone=${zone.id}`}
                          className="flex items-center justify-center gap-2 w-full bg-(--bpa-green) text-white py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
                        >
                          Contribute to this zone <ChevronRight size={14} />
                        </Link>
                      )}
                      {zone.clinicAddress && (
                        <p className="text-xs text-gray-400 mt-3 flex items-start gap-1.5">
                          <MapPin size={12} className="shrink-0 mt-0.5" />
                          {zone.clinicAddress}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
