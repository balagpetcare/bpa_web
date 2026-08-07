'use client';

import { Play, Video } from 'lucide-react';
import Link from 'next/link';
import type { SpayOfferVideo } from '@/lib/api/spay-neuter';

interface Props {
  offerId: string;
  videos: SpayOfferVideo[];
}

export default function SpayOfferVideos({ offerId, videos }: Props) {
  if (!videos || videos.length === 0) return null;

  return (
    <section aria-labelledby="videos-heading" className="mt-12 relative">
      <div className="flex items-center justify-between mb-6">
        <h2 id="videos-heading" className="text-xl font-bold text-(--bpa-navy) flex items-center gap-2 m-0">
          <Video size={22} className="text-(--bpa-green)" /> Videos / ভিডিও
          <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full ml-2">{videos.length}</span>
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {videos.map((video) => (
          <Link
            key={video.id}
            href={`/spay-neuter/${offerId}/videos/${video.id}`}
            className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden focus:outline-none focus:ring-2 focus:ring-(--bpa-green) focus:ring-offset-2"
          >
            {/* Media Container with play button overlay */}
            <div className="relative block aspect-video w-full bg-gray-100 overflow-hidden">
              {video.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center">
                  <Video size={48} className="text-gray-300" />
                </div>
              )}
              
              {/* Play button overlay */}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-300 group-hover:bg-black/40">
                <div className="w-16 h-16 bg-white text-(--bpa-green) rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-transform duration-300 group-hover:scale-110 group-active:scale-95">
                  <Play size={24} className="fill-current ml-1" />
                </div>
              </div>
            </div>

            {/* Card Details */}
            <div className="p-5 flex-1 flex flex-col justify-start">
              <h3 className="text-lg font-bold text-(--bpa-navy) line-clamp-2 transition-colors duration-200 group-hover:text-(--bpa-green) leading-tight">
                {video.title}
              </h3>
              {video.description && (
                <p className="text-sm text-gray-500 line-clamp-3 mt-2 leading-relaxed">
                  {video.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
