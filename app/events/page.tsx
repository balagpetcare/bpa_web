import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/ui/Breadcrumb';
import SectionHeader from '@/components/ui/SectionHeader';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import EventCard from '@/components/events/EventCard';
import EventsSearch from '@/components/events/EventsSearch';
import { getEventsList } from '@/lib/api/events';
import { getSeoData } from '@/lib/api/seo';
import { buildMetadata } from '@/lib/seo';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData('/events');
  return buildMetadata(
    {
      title: 'Events',
      description:
        'Discover upcoming events from the Bangladesh Pet Association — workshops, meetups, adoption drives, and more.',
      canonical: '/events',
    },
    seo,
  );
}

const PAGE_SIZE = 9;

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function EventsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const search = params.search?.trim() ?? '';

  let items: Awaited<ReturnType<typeof getEventsList>>['items'] = [];
  let totalPages = 1;
  let totalItems = 0;

  try {
    const res = await getEventsList(
      { page, limit: PAGE_SIZE, search: search || undefined },
      { next: { revalidate: 300, tags: ['events-list'] } },
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
    const qs = sp.toString();
    return `/events${qs ? `?${qs}` : ''}`;
  };

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Events', url: '/events' }]} />

      {/* Page header */}
      <section className="bg-gray-50 border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Events' }]} />
          <h1 className="mt-4 text-4xl font-bold text-(--bpa-navy)">Events</h1>
          <p className="mt-3 text-lg text-gray-500 max-w-2xl">
            Workshops, meetups, adoption drives, and community events from the Bangladesh Pet Association.
          </p>
        </div>
      </section>

      {/* Search bar */}
      <section className="py-5 border-b border-gray-100 bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense>
            <EventsSearch currentSearch={search} />
          </Suspense>
        </div>
      </section>

      {/* Events grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <div className="text-center py-24">
              <CalendarDays size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium text-lg">No events found.</p>
              {search && (
                <Link href="/events" className="mt-4 inline-block text-sm text-(--bpa-green) hover:underline">
                  Clear search
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <SectionHeader
                  eyebrow="All Events"
                  title={search ? `Results for "${search}"` : 'Upcoming & Recent Events'}
                />
                <p className="text-sm text-gray-400 hidden sm:block">
                  {totalItems} event{totalItems !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              {page > 1 && (
                <Link
                  href={buildHref(page - 1)}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
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
                      <span key={`ellipsis-${i}`} className="px-2 text-gray-400">…</span>
                    ) : (
                      <Link
                        key={p}
                        href={buildHref(p as number)}
                        className={`w-9 h-9 flex items-center justify-center text-sm font-medium rounded-lg transition-colors ${
                          p === page
                            ? 'bg-(--bpa-green) text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {p}
                      </Link>
                    ),
                  )}
              </div>
              {page < totalPages && (
                <Link
                  href={buildHref(page + 1)}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
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
