import Image from 'next/image';
import Link from 'next/link';
import { Play, ArrowRight, Video as VideoIcon, Clock } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import { Section, Container } from './Section';
import type { HomepageVideo } from '@/lib/api/public-homepage';

function formatDuration(seconds: number | null): string | null {
  if (!seconds || seconds <= 0) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function VideoThumbnail({ video, playButtonSize }: { video: HomepageVideo; playButtonSize: 'lg' | 'sm' }) {
  const duration = formatDuration(video.durationSeconds);
  return (
    <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
      {/* Thumbnail only — no video embed is ever loaded on the homepage.
          Selecting a card navigates to the existing /videos/[slug] detail
          page, which owns the actual player. */}
      {video.thumbnailUrl ? (
        <Image
          src={video.thumbnailUrl}
          alt={video.title}
          fill
          sizes={playButtonSize === 'lg' ? '(max-width: 1024px) 100vw, 60vw' : '(max-width: 1024px) 50vw, 22vw'}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-50 to-gray-100">
          <VideoIcon className="h-10 w-10 text-gray-300" aria-hidden="true" />
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-90 transition-colors group-hover:bg-black/35">
        <div
          className={`flex items-center justify-center rounded-full bg-white text-(--bpa-green) shadow-lg transition-transform duration-300 group-hover:scale-110 ${
            playButtonSize === 'lg' ? 'h-16 w-16' : 'h-11 w-11'
          }`}
        >
          <Play className={playButtonSize === 'lg' ? 'ml-1 h-6 w-6 fill-current' : 'ml-0.5 h-4 w-4 fill-current'} aria-hidden="true" />
        </div>
      </div>
      {duration && (
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-0.5 text-xs font-semibold text-white">
          <Clock className="h-3 w-3" aria-hidden="true" />
          {duration}
        </span>
      )}
    </div>
  );
}

interface Props {
  videos: HomepageVideo[];
}

export default function VideoLearningHubSection({ videos }: Props) {
  if (videos.length === 0) return null;
  const [featured, ...rest] = videos;
  const smaller = rest.slice(0, 4);

  return (
    <Section tone="white" aria-label="Video & Learning Hub">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeader
            eyebrow="Educational Center"
            title="Video & Learning Hub"
            subtitle="Watch campaign explainers, care guides, and stories from the field."
          />
          <Link
            href="/videos"
            className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-(--bpa-navy) transition-colors hover:text-(--bpa-green) md:inline-flex"
          >
            View All Videos <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Featured video — one large 16:9 thumbnail */}
        <Link
          href={`/videos/${featured.slug}`}
          className="group mt-10 grid grid-cols-1 gap-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--bpa-navy) focus-visible:ring-offset-2 lg:grid-cols-2"
        >
          <VideoThumbnail video={featured} playButtonSize="lg" />
          <div className="flex flex-col justify-center p-6 lg:pr-10">
            {featured.category && (
              <span className="w-fit rounded-full bg-(--bpa-green-light) px-3 py-1 text-xs font-bold uppercase tracking-wide text-(--bpa-green)">
                {featured.category}
              </span>
            )}
            <h3 className="mt-4 text-2xl font-bold text-(--bpa-navy) transition-colors group-hover:text-(--bpa-green) line-clamp-2">
              {featured.title}
            </h3>
            {featured.description && (
              <p className="mt-3 text-sm leading-6 text-gray-500 line-clamp-3">{featured.description}</p>
            )}
            <span className="mt-5 inline-flex w-fit items-center gap-2 text-sm font-semibold text-(--bpa-green)">
              Watch now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </div>
        </Link>

        {/* Up to 4 smaller featured videos */}
        {smaller.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {smaller.map((video) => (
              <Link
                key={video.id}
                href={`/videos/${video.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--bpa-navy) focus-visible:ring-offset-2"
              >
                <VideoThumbnail video={video} playButtonSize="sm" />
                <div className="flex flex-1 flex-col p-4">
                  {video.category && (
                    <span className="text-[11px] font-bold uppercase tracking-wide text-(--bpa-green)">{video.category}</span>
                  )}
                  <h4 className="mt-1.5 text-sm font-bold text-(--bpa-navy) transition-colors group-hover:text-(--bpa-green) line-clamp-2">
                    {video.title}
                  </h4>
                  {video.description && (
                    <p className="mt-1.5 text-xs leading-5 text-gray-500 line-clamp-2">{video.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/videos"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--bpa-navy) hover:text-(--bpa-green)"
          >
            View All Videos <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </Section>
  );
}
