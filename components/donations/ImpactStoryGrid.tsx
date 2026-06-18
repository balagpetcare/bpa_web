import Link from 'next/link';
import { Heart, ArrowRight } from 'lucide-react';
import type { DonationImpactStory } from '@/lib/api/donations';

interface Props {
  stories: DonationImpactStory[];
  title?: string;
  subtitle?: string;
  limit?: number;
  className?: string;
}

export default function ImpactStoryGrid({
  stories,
  title = 'Stories of Survival',
  subtitle = 'See the direct result of your generosity — animals rescued, healed, and given a second chance.',
  limit = 3,
  className = '',
}: Props) {
  const visible = stories.slice(0, limit);
  if (visible.length === 0) return null;

  return (
    <div className={className}>
      {(title || subtitle) && (
        <div className="mb-8 text-center">
          {title && (
            <h2 className="text-2xl font-extrabold text-(--bpa-navy) sm:text-3xl">{title}</h2>
          )}
          {subtitle && (
            <p className="mt-2 text-sm text-gray-500 max-w-xl mx-auto">{subtitle}</p>
          )}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((story) => (
          <Link
            key={story.id}
            href={`/donations/impact-stories/${story.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
          >
            {story.afterImageUrl || story.beforeImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={story.afterImageUrl || story.beforeImageUrl || ''}
                alt={story.titleEn}
                className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="aspect-video flex items-center justify-center bg-(--bpa-green-light)">
                <Heart size={36} className="text-(--bpa-green)/30" />
              </div>
            )}
            <div className="flex flex-1 flex-col p-5">
              <span className="mb-2 text-[10px] font-bold uppercase tracking-wider text-(--bpa-green)">
                {story.storyType}
                {story.animalType ? ` · ${story.animalType}` : ''}
              </span>
              <h3 className="mb-2 text-sm font-bold leading-snug text-(--bpa-navy) line-clamp-2">
                {story.titleEn}
              </h3>
              {story.shortDescriptionEn && (
                <p className="flex-1 text-xs text-gray-500 line-clamp-3 mb-3">
                  {story.shortDescriptionEn}
                </p>
              )}
              <span className="inline-flex items-center gap-1 text-xs font-bold text-(--bpa-green)">
                Read Story <ArrowRight size={11} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {stories.length > limit && (
        <div className="mt-8 text-center">
          <Link
            href="/donations/impact-stories"
            className="inline-flex items-center gap-2 text-sm font-bold text-(--bpa-green) hover:underline"
          >
            View All Stories <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
