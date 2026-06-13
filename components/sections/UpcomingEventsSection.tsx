import Link from 'next/link';
import SectionHeader from '@/components/ui/SectionHeader';
import LinkButton from '@/components/ui/LinkButton';
import { CalendarDays, MapPin } from 'lucide-react';
import type { EventListItem, HomepageSection } from '@/types/bpa.types';

interface UpcomingEventsSectionProps {
  items: EventListItem[];
  section?: HomepageSection | null;
}

function formatEventDate(start: string, end?: string | null) {
  const s = new Date(start);
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  if (!end) return s.toLocaleDateString('en-GB', opts);
  const e = new Date(end);
  if (s.toDateString() === e.toDateString()) return s.toLocaleDateString('en-GB', opts);
  return `${s.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${e.toLocaleDateString('en-GB', opts)}`;
}

export default function UpcomingEventsSection({ items, section }: UpcomingEventsSectionProps) {
  if (!items.length) return null;

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <SectionHeader eyebrow={section?.eyebrow || 'Upcoming Events'} title={section?.title || 'Join Us in Person'} subtitle={section?.subtitle ?? undefined} />
          <LinkButton href={section?.ctaHref || '/events'} variant="outline" size="sm">{section?.ctaLabel || 'View All Events'}</LinkButton>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.slice(0, 3).map((event) => (
            <Link key={event.id} href={`/events/${event.slug}`} className="group block">
              <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                {/* Date badge */}
                <div className="bg-(--bpa-navy) px-5 py-4 flex items-center gap-3">
                  <CalendarDays size={18} className="text-(--bpa-green) shrink-0" />
                  <time className="text-white text-sm font-medium">
                    {formatEventDate(event.startsAt, event.endsAt)}
                  </time>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-(--bpa-navy) mb-2 group-hover:text-(--bpa-green) transition-colors line-clamp-2">
                    {event.title}
                  </h3>
                  {event.description && (
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4 flex-1">{event.description}</p>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-auto">
                      <MapPin size={12} />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  )}
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
