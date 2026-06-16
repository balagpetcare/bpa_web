import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/ui/Breadcrumb';
import SectionHeader from '@/components/ui/SectionHeader';
import CampaignCard from '@/components/campaigns/CampaignCard';
import CampaignFilters from '@/components/campaigns/CampaignFilters';
import { getCampaignsList } from '@/lib/api/campaigns';
import { Syringe, ChevronLeft, ChevronRight, CalendarOff } from 'lucide-react';

export const revalidate = 120;

export const metadata: Metadata = {
  title: 'Vaccination & Welfare Campaigns | Bangladesh Pet Association',
  description: 'Find BPA vaccination drives, deworming campaigns, and pet health events near you.',
};

const PAGE_SIZE = 9;

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string; status?: string; campaignType?: string }>;
}

export default async function CampaignsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const search = params.search?.trim() ?? '';
  const status = params.status ?? '';
  const campaignType = params.campaignType ?? '';

  let items: Awaited<ReturnType<typeof getCampaignsList>>['items'] = [];
  let totalPages = 1;
  let totalItems = 0;

  try {
    const res = await getCampaignsList(
      {
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        status: status || undefined,
        campaignType: campaignType || undefined,
      },
      { next: { revalidate: 120, tags: ['campaigns-list'] } },
    );
    items = res.items;
    totalPages = res.meta?.totalPages ?? 1;
    totalItems = res.meta?.total ?? items.length;
  } catch {
    // API unavailable — show empty state
  }

  const buildHref = (p: number) => {
    const sp = new URLSearchParams();
    if (p > 1) sp.set('page', String(p));
    if (search) sp.set('search', search);
    if (status) sp.set('status', status);
    if (campaignType) sp.set('campaignType', campaignType);
    const qs = sp.toString();
    return `/campaigns${qs ? `?${qs}` : ''}`;
  };

  return (
    <>
      {/* Page header */}
      <section className="bg-gray-50 border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Campaigns' }]} />
          <h1 className="mt-4 text-4xl font-bold text-(--bpa-navy)">Vaccination & Welfare Campaigns</h1>
          <p className="mt-3 text-lg text-gray-500 max-w-2xl">
            Register your pets for free and subsidised health services across Bangladesh.
          </p>
          <div className="mt-4 flex gap-3">
            <Link
              href="/booking-lookup"
              className="inline-flex items-center gap-2 text-sm font-semibold text-(--bpa-green) hover:underline"
            >
              Find your booking →
            </Link>
            <Link
              href="/verify/cert"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-(--bpa-green) hover:underline"
            >
              Verify certificate →
            </Link>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-4 border-b border-gray-100 bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense>
            <CampaignFilters currentSearch={search} currentStatus={status} currentType={campaignType} />
          </Suspense>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <div className="text-center py-24">
              {(search || status || campaignType) ? (
                <>
                  <Syringe size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 font-medium text-lg">No campaigns match your filters.</p>
                  <Link href="/campaigns" className="mt-4 inline-block text-sm text-(--bpa-green) hover:underline">
                    Clear filters
                  </Link>
                </>
              ) : (
                <>
                  <CalendarOff size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-700 font-bold text-xl mb-2">No active campaign registration right now</p>
                  <p className="text-gray-400 text-base max-w-md mx-auto mb-6">
                    You can still check your existing booking or registration status.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      href="/booking-lookup"
                      className="inline-flex items-center justify-center gap-2 bg-(--bpa-green) text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-green-600 transition-colors shadow-sm"
                    >
                      Check Booking / Registration
                    </Link>
                    <Link
                      href="/verify/cert"
                      className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-600 text-sm font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Verify Certificate
                    </Link>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <SectionHeader
                  eyebrow="All Campaigns"
                  title={search ? `Results for "${search}"` : 'Active & Upcoming Campaigns'}
                />
                <p className="text-sm text-gray-400 hidden sm:block">
                  {totalItems} campaign{totalItems !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((c) => (
                  <CampaignCard key={c.id} campaign={c} />
                ))}
              </div>
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              {page > 1 && (
                <Link href={buildHref(page - 1)} className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <ChevronLeft size={16} /> Previous
                </Link>
              )}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <span key={`e-${i}`} className="px-2 text-gray-400">…</span>
                    ) : (
                      <Link key={p} href={buildHref(p as number)}
                        className={`w-9 h-9 flex items-center justify-center text-sm font-medium rounded-lg transition-colors ${p === page ? 'bg-(--bpa-green) text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                        {p}
                      </Link>
                    ),
                  )}
              </div>
              {page < totalPages && (
                <Link href={buildHref(page + 1)} className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Next <ChevronRight size={16} />
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
