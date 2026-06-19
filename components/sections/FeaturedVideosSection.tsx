import Link from 'next/link';
import { Play, ArrowRight, Video } from 'lucide-react';
import type { ContentPost } from '@/lib/api/content';

interface Props {
  videos: ContentPost[];
}

export default function FeaturedVideosSection({ videos }: Props) {
  if (videos.length === 0) return null;

  return (
    <section className="py-20 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-green-50 text-(--bpa-green) border border-green-100 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider mb-3">
              <Video size={12} />
              Educational Center
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-(--bpa-navy) tracking-tight">
              Featured Videos
            </h2>
          </div>
          <Link
            href="/videos"
            className="inline-flex items-center gap-1.5 text-(--bpa-green) font-bold text-sm hover:underline"
          >
            View All Videos <ArrowRight size={16} />
          </Link>
        </div>

        {/* Mobile: Horizontal scroll; Desktop: Grid */}
        <div className="flex overflow-x-auto pb-4 gap-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-x-visible snap-x snap-mandatory scrollbar-none">
          {videos.map(video => (
            <div
              key={video.id}
              className="w-[280px] sm:w-auto shrink-0 snap-align-start bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col group"
            >
              {/* Media Container with play button overlay */}
              <Link href={`/videos/${video.slug}`} className="relative block aspect-video w-full bg-gray-150 overflow-hidden">
                {video.coverImageUrl || video.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={video.coverImageUrl || video.thumbnailUrl || ''}
                    alt={video.titleEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-50 to-gray-100 flex items-center justify-center">
                    <Video size={36} className="text-gray-300" />
                  </div>
                )}
                
                {/* Play button overlay */}
                <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-90 group-hover:bg-black/35 transition">
                  <div className="w-12 h-12 bg-white text-(--bpa-green) rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition duration-300 transform">
                    <Play size={18} className="fill-current ml-0.5" />
                  </div>
                </div>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  {video.isPinned && (
                    <span className="bg-amber-500 text-white font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
                      Pinned
                    </span>
                  )}
                  {video.isFeatured && (
                    <span className="bg-(--bpa-green) text-white font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
                      Featured
                    </span>
                  )}
                </div>
              </Link>

              {/* Card Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  {video.category && (
                    <span className="text-[10px] text-(--bpa-green) font-black uppercase tracking-widest block">
                      {video.category.nameEn}
                    </span>
                  )}
                  
                  <Link href={`/videos/${video.slug}`} className="block">
                    <h3 className="text-base font-extrabold text-(--bpa-navy) line-clamp-2 hover:text-(--bpa-green) transition leading-tight">
                      {video.titleEn}
                    </h3>
                    <p className="text-xs text-gray-400 font-semibold line-clamp-1 mt-1 font-sans">
                      {video.titleBn}
                    </p>
                  </Link>
                  
                  <p className="text-gray-500 text-xs line-clamp-2 font-medium leading-relaxed">
                    {video.summaryEn || 'No summary available.'}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-400 font-bold border-t border-gray-50 pt-3">
                  <span>{video.publishedAt ? new Date(video.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Draft'}</span>
                  <span>{video.viewCount} views</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
