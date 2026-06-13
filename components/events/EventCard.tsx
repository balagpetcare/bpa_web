import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import type { EventListItem } from '@/types/bpa.types';

interface EventCardProps {
  event: EventListItem;
}

function formatDateRange(start: string, end?: string | null) {
  const s = new Date(start);
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  if (!end) return s.toLocaleDateString('en-GB', opts);
  const e = new Date(end);
  if (s.toDateString() === e.toDateString()) return s.toLocaleDateString('en-GB', opts);
  return `${s.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${e.toLocaleDateString('en-GB', opts)}`;
}

export default function EventCard({ event }: EventCardProps) {
  const spotsLeft = event.capacity != null ? event.capacity - event.registrationCount : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  return (
    <Link href={`/events/${event.slug}`} className="group block h-full">
      <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
        {/* Cover image */}
        <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
          {event.coverImageUrl ? (
            <Image
              src={event.coverImageUrl}
              alt={event.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-(--bpa-navy)/10 to-(--bpa-navy)/10 flex items-center justify-center">
              <CalendarDays size={32} className="text-(--bpa-green)" />
            </div>
          )}
          {isFull && (
            <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              Full
            </span>
          )}
          {!isFull && spotsLeft !== null && spotsLeft <= 10 && (
            <span className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
            </span>
          )}
        </div>

        <div className="p-5 flex flex-col flex-1">
          {/* Date */}
          <div className="flex items-center gap-1.5 text-xs text-(--bpa-green) font-semibold mb-2">
            <CalendarDays size={13} />
            <time>{formatDateRange(event.startsAt, event.endsAt)}</time>
          </div>

          {/* Title */}
          <h3 className="font-bold text-(--bpa-navy) mb-2 group-hover:text-(--bpa-green) transition-colors line-clamp-2 leading-snug">
            {event.title}
          </h3>

          {event.description && (
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4 flex-1">
              {event.description}
            </p>
          )}

          <div className="mt-auto space-y-1.5">
            {event.location && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <MapPin size={12} />
                <span className="line-clamp-1">{event.location}</span>
              </div>
            )}
            {event.capacity != null && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Users size={12} />
                <span>{event.registrationCount} / {event.capacity} registered</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
