import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/ui/Breadcrumb';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import EventJsonLd from '@/components/seo/EventJsonLd';
import EventCard from '@/components/events/EventCard';
import EventRegistrationForm from '@/components/events/EventRegistrationForm';
import { getEventBySlug, getEventsList } from '@/lib/api/events';
import { getSeoData } from '@/lib/api/seo';
import { buildMetadata, BASE_URL } from '@/lib/seo';
import { CalendarDays, MapPin, Users, BanknoteIcon, ArrowLeft, Clock } from 'lucide-react';

export const revalidate = 600;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const { items } = await getEventsList({ limit: 100 });
    return items.map((e) => ({ slug: e.slug }));
  } catch {
    return [];
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const [event, seo] = await Promise.all([
      getEventBySlug(slug, { next: { revalidate: 600, tags: [`event-${slug}`] } }),
      getSeoData(`/events/${slug}`),
    ]);
    if (!event) return {};
    return buildMetadata(
      {
        title: event.title,
        description: event.description ?? `Join BPA for ${event.title}.`,
        ogImage: event.coverImageUrl ?? undefined,
        canonical: `/events/${slug}`,
      },
      seo,
    );
  } catch {
    return {};
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatDateRange(start: string, end: string | null) {
  const s = new Date(start);
  if (!end) return formatDate(start);
  const e = new Date(end);
  if (s.toDateString() === e.toDateString()) return formatDate(start);
  return `${s.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${e.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`;
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let event: Awaited<ReturnType<typeof getEventBySlug>>;
  try {
    event = await getEventBySlug(slug, { next: { revalidate: 600, tags: [`event-${slug}`] } });
  } catch {
    notFound();
  }
  if (!event) notFound();

  const spotsLeft = event.capacity != null ? event.capacity - event.registrationCount : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;
  const isSoldOut = isFull;
  const isLowCapacity = spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 10;

  // Related events — exclude current, cap at 3
  let related: Awaited<ReturnType<typeof getEventsList>>['items'] = [];
  try {
    const res = await getEventsList(
      { limit: 6 },
      { next: { revalidate: 300, tags: ['events-list'] } },
    );
    related = res.items.filter((e) => e.slug !== slug).slice(0, 3);
  } catch {
    // no related — fine
  }

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Events', url: '/events' },
          { name: event.title, url: `/events/${slug}` },
        ]}
      />
      <EventJsonLd event={event} />

      {/* Page header */}
      <section className="bg-gray-50 border-b border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Events', href: '/events' }, { label: event.title }]} />
        </div>
      </section>

      {/* Main content */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left — event detail */}
            <div className="lg:col-span-2 space-y-8">
              {/* Cover image */}
              {event.coverImageUrl ? (
                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100">
                  <Image
                    src={event.coverImageUrl}
                    alt={event.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover"
                  />
                  {isSoldOut && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold tracking-widest uppercase">Sold Out</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-[16/9] rounded-2xl bg-gradient-to-br from-(--bpa-navy)/10 to-(--bpa-navy)/5 flex items-center justify-center">
                  <CalendarDays size={48} className="text-(--bpa-navy)/20" />
                </div>
              )}

              {/* Title & badges */}
              <div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {event.isPaid && (
                    <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
                      Paid Event {event.fee ? `· ৳${event.fee}` : ''}
                    </span>
                  )}
                  {!event.isPaid && (
                    <span className="bg-(--bpa-green-light) text-(--bpa-green) text-xs font-semibold px-3 py-1 rounded-full">
                      Free Event
                    </span>
                  )}
                  {isSoldOut && (
                    <span className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">
                      Sold Out
                    </span>
                  )}
                  {isLowCapacity && (
                    <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
                      {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
                    </span>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-(--bpa-navy) leading-tight">
                  {event.title}
                </h1>
              </div>

              {/* Event meta */}
              <dl className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                  <CalendarDays size={18} className="text-(--bpa-green) shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</dt>
                    <dd className="text-sm font-medium text-(--bpa-navy) mt-0.5">
                      {formatDateRange(event.startsAt, event.endsAt)}
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                  <Clock size={18} className="text-(--bpa-green) shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Time</dt>
                    <dd className="text-sm font-medium text-(--bpa-navy) mt-0.5">
                      {formatTime(event.startsAt)}
                      {event.endsAt && ` – ${formatTime(event.endsAt)}`}
                    </dd>
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                    <MapPin size={18} className="text-(--bpa-green) shrink-0 mt-0.5" />
                    <div>
                      <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Location</dt>
                      <dd className="text-sm font-medium text-(--bpa-navy) mt-0.5">{event.location}</dd>
                    </div>
                  </div>
                )}

                {event.capacity != null && (
                  <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                    <Users size={18} className="text-(--bpa-green) shrink-0 mt-0.5" />
                    <div>
                      <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Capacity</dt>
                      <dd className="text-sm font-medium text-(--bpa-navy) mt-0.5">
                        {event.registrationCount} / {event.capacity} registered
                      </dd>
                      {/* Capacity bar */}
                      <div className="mt-1.5 h-1.5 w-24 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isSoldOut ? 'bg-red-500' : isLowCapacity ? 'bg-amber-500' : 'bg-(--bpa-green)'}`}
                          style={{ width: `${Math.min(100, (event.registrationCount / event.capacity) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {event.isPaid && event.fee && (
                  <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                    <BanknoteIcon size={18} className="text-(--bpa-green) shrink-0 mt-0.5" />
                    <div>
                      <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Entry Fee</dt>
                      <dd className="text-sm font-medium text-(--bpa-navy) mt-0.5">৳{event.fee}</dd>
                    </div>
                  </div>
                )}
              </dl>

              {/* Description */}
              {event.description && (
                <div>
                  <h2 className="text-xl font-bold text-(--bpa-navy) mb-4">About this Event</h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">{event.description}</p>
                </div>
              )}

              {/* Back link */}
              <div className="pt-4 border-t border-gray-100">
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 text-sm font-medium text-(--bpa-green) hover:underline"
                >
                  <ArrowLeft size={16} /> Back to Events
                </Link>
              </div>
            </div>

            {/* Right — registration sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <h2 className="text-lg font-bold text-(--bpa-navy) mb-1">
                    {isSoldOut ? 'Event Full' : 'Register for this Event'}
                  </h2>
                  {!isSoldOut && spotsLeft !== null && (
                    <p className="text-xs text-gray-400 mb-5">
                      {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} remaining
                    </p>
                  )}
                  {isSoldOut && (
                    <p className="text-xs text-gray-400 mb-5">
                      This event has reached full capacity.
                    </p>
                  )}
                  <EventRegistrationForm
                    eventId={event.id}
                    capacity={event.capacity}
                    registrationCount={event.registrationCount}
                    isPaid={event.isPaid}
                    fee={event.fee}
                  />
                </div>

                {/* Organiser */}
                <div className="mt-4 bg-(--bpa-green-light) rounded-2xl p-5 text-sm text-(--bpa-navy)">
                  <p className="font-semibold mb-1">Organised by</p>
                  <p className="text-(--bpa-green) font-bold">Bangladesh Pet Association</p>
                  <Link
                    href="/contact"
                    className="mt-2 inline-block text-xs text-gray-500 hover:text-(--bpa-green) transition-colors"
                  >
                    Contact us about this event →
                  </Link>
                </div>

                {/* Share */}
                <div className="mt-4 text-center">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${BASE_URL}/events/${slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-gray-500 hover:text-(--bpa-navy) transition-colors"
                  >
                    Share on Facebook →
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Related events */}
      {related.length > 0 && (
        <section className="py-16 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-(--bpa-navy) mb-8">More Events</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
