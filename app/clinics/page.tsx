import type { Metadata } from 'next';
import Breadcrumb from '@/components/ui/Breadcrumb';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import ClinicCard from '@/components/clinics/ClinicCard';
import ClinicDirectoryControls from '@/components/clinics/ClinicDirectoryControls';
import ClinicMap from '@/components/clinics/ClinicMap';
import { getClinicsList, getClinicFilterOptions } from '@/lib/api/clinics';
import { parseClinicSearchParams, buildClinicPageHref, type RawClinicSearchParams } from '@/lib/clinics/query';
import { Stethoscope, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 60;

const PAGE_SIZE = 12;

interface PageProps {
  searchParams: Promise<RawClinicSearchParams>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const state = parseClinicSearchParams(params);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bpa.org.bd';

  const locationBits = [state.area, state.district, state.cityCorporation].filter(Boolean);
  const title = locationBits.length > 0
    ? `Find Clinics in ${locationBits.join(', ')} | Bangladesh Pet Association`
    : 'Find Clinics | Bangladesh Pet Association';
  const description = locationBits.length > 0
    ? `Search verified pet clinics and veterinary hospitals in ${locationBits.join(', ')} — hours, emergency and 24/7 availability, services, and directions.`
    : 'Search verified pet clinics and veterinary hospitals near you across Dhaka — hours, emergency and 24/7 availability, services, and directions.';

  return {
    title,
    description,
    // Every filtered/paginated variant canonicalizes to the base /clinics
    // URL — filters are a view of the same content, not a distinct page,
    // so this avoids indexing thin near-duplicate pages per filter combo.
    alternates: { canonical: `${siteUrl}/clinics` },
    openGraph: { title, description, url: `${siteUrl}/clinics`, type: 'website' },
    twitter: { card: 'summary', title, description },
  };
}

export default async function ClinicsPage({ searchParams }: PageProps) {
  const rawParams = await searchParams;
  const state = parseClinicSearchParams(rawParams);
  const hasLocation = state.lat !== undefined && state.lng !== undefined;

  let items: Awaited<ReturnType<typeof getClinicsList>>['items'] = [];
  let totalPages = 1;
  let totalItems = 0;
  let loadError = false;

  try {
    const res = await getClinicsList(
      {
        page: state.page,
        limit: PAGE_SIZE,
        search: state.search || undefined,
        district: state.district || undefined,
        area: state.area || undefined,
        cityCorporation: state.cityCorporation || undefined,
        service: state.service || undefined,
        animalType: state.animalType || undefined,
        facilityType: state.facilityType || undefined,
        openNow: state.openNow || undefined,
        open24Hours: state.open24Hours || undefined,
        emergencyAvailability: state.emergency || undefined,
        appointmentRequired: state.appointmentRequired || undefined,
        verifiedOnly: state.verifiedOnly || undefined,
        latitude: hasLocation ? state.lat : undefined,
        longitude: hasLocation ? state.lng : undefined,
        sortBy: (state.sortBy as 'distance' | 'name' | 'featured' | 'recentlyVerified') || undefined,
      },
      { next: { revalidate: 60, tags: ['clinics-list'] } },
    );
    items = res.items;
    totalPages = res.meta?.totalPages ?? 1;
    totalItems = res.meta?.total ?? items.length;
  } catch {
    loadError = true;
  }

  const filterOptions = await getClinicFilterOptions({ next: { revalidate: 300 } });

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BreadcrumbJsonLd items={[{ name: 'Home', url: '/' }, { name: 'Find Clinics', url: '/clinics' }]} />
        <Breadcrumb items={[{ label: 'Find Clinics' }]} />

        <div className="mt-4 mb-6">
          <h1 className="text-3xl font-bold text-(--bpa-navy)">Find Clinics</h1>
          <p className="text-gray-500 mt-1">
            Search verified pet clinics and veterinary hospitals near you.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
          <ClinicDirectoryControls filterOptions={filterOptions} current={state} />
        </div>

        {loadError ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Stethoscope size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600 font-medium">Could not load clinics right now.</p>
            <p className="text-gray-400 text-sm mt-1 mb-4">Please check your connection and try again.</p>
            <Link
              href={buildClinicPageHref(state, state.page)}
              className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-(--bpa-green) text-white hover:bg-(--bpa-green)/90 transition-colors"
            >
              <RefreshCcw size={14} /> Retry
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Stethoscope size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600 font-medium">No clinics match your filters.</p>
            <p className="text-gray-400 text-sm mt-1">Try clearing some filters or searching a different area.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{totalItems} clinic{totalItems === 1 ? '' : 's'} found</p>

            {state.view === 'map' ? (
              <ClinicMap clinics={items} userLocation={hasLocation ? { latitude: state.lat!, longitude: state.lng! } : null} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((clinic) => (
                  <ClinicCard key={clinic.id} clinic={clinic} />
                ))}
              </div>
            )}
          </>
        )}

        {totalPages > 1 && !loadError && state.view !== 'map' && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Link
              href={buildClinicPageHref(state, Math.max(1, state.page - 1))}
              aria-disabled={state.page <= 1}
              className={`px-3 py-2 rounded-lg text-sm font-semibold border ${
                state.page <= 1 ? 'pointer-events-none opacity-40 border-gray-200' : 'border-gray-300 hover:border-(--bpa-green)'
              }`}
            >
              Previous
            </Link>
            <span className="text-sm text-gray-500">
              Page {state.page} of {totalPages}
            </span>
            <Link
              href={buildClinicPageHref(state, Math.min(totalPages, state.page + 1))}
              aria-disabled={state.page >= totalPages}
              className={`px-3 py-2 rounded-lg text-sm font-semibold border ${
                state.page >= totalPages ? 'pointer-events-none opacity-40 border-gray-200' : 'border-gray-300 hover:border-(--bpa-green)'
              }`}
            >
              Next
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
