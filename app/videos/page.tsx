import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublicVideos, getPublicVideoCategories } from '@/lib/api/content';
import { Video, Search, Play } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import { getSeoData } from '@/lib/api/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData('/videos').catch(() => null);
  return buildMetadata(
    {
      title: 'BPA Video Gallery — Educational & Campaign Videos',
      description: 'Watch educational guides, training videos, and campaign highlights from the Bangladesh Pet Association.',
      canonical: '/videos',
    },
    seo
  );
}

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string; category?: string }>;
}

export default async function VideosPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams.q || '';
  const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page, 10) : 1;
  const categorySlug = resolvedSearchParams.category || '';

  const [videosResult, categoriesResult] = await Promise.all([
    getPublicVideos({ q, page, limit: 12, categorySlug: categorySlug || undefined }).catch(() => ({ data: [], meta: { total: 0, totalPages: 1 } })),
    getPublicVideoCategories().catch(() => []),
  ]);

  const videos = videosResult.data || [];
  const meta = videosResult.meta || { total: 0, totalPages: 1 };
  const categories = categoriesResult || [];

  return (
    <main className="min-h-screen bg-gray-50/50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Block */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 bg-green-50 text-(--bpa-green) border border-green-100 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider mb-4">
            <Video size={12} />
            BPA Video Hub
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-(--bpa-navy) tracking-tight mb-4">
            Educational Videos
          </h1>
          <p className="text-gray-500 text-base leading-relaxed">
            Watch our latest pet vaccination guides, care advice, rescue diaries, and community clinic updates.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-12">
          <form method="GET" action="/videos" className="relative">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search educational videos..."
              className="w-full rounded-2xl border border-gray-250 py-3.5 pl-12 pr-4 text-sm focus:border-(--bpa-green) focus:ring-1 focus:ring-(--bpa-green) focus:outline-none bg-white font-medium"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </form>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="max-w-4xl mx-auto mb-12 flex flex-wrap gap-3 justify-center">
            <Link
              href="/videos"
              className={`px-4 py-2 text-xs font-extrabold rounded-full transition ${
                !categorySlug
                  ? 'bg-(--bpa-green) text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-(--bpa-green) hover:text-(--bpa-green)'
              }`}
            >
              All Videos
            </Link>
            {categories.map(cat => (
              <Link
                key={cat.slug}
                href={`/videos?category=${cat.slug}`}
                className={`px-4 py-2 text-xs font-extrabold rounded-full transition ${
                  categorySlug === cat.slug
                    ? 'bg-(--bpa-green) text-white shadow-md'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-(--bpa-green) hover:text-(--bpa-green)'
                }`}
              >
                {cat.nameEn} ({cat.publishedVideoCount})
              </Link>
            ))}
          </div>
        )}

        {/* Videos Grid */}
        {videos.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center max-w-md mx-auto shadow-sm">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 mx-auto mb-4 border border-gray-100">
              <Video size={24} />
            </div>
            <h3 className="text-lg font-bold text-(--bpa-navy) mb-2">No videos found</h3>
            <p className="text-gray-500 text-sm mb-6">
              {q ? `We couldn't find any videos matching "${q}". Try another search term.` : 'Check back later for educational videos.'}
            </p>
            {q && (
              <Link href="/videos" className="inline-block bg-(--bpa-green) hover:bg-(--bpa-green-dark) text-white font-bold text-sm px-6 py-2.5 rounded-xl transition">
                Clear Search
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videos.map(video => (
                <div
                  key={video.id}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col justify-between group"
                >
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
                    
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-90 group-hover:bg-black/35 transition">
                      <div className="w-12 h-12 bg-white text-(--bpa-green) rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition duration-300 transform">
                        <Play size={18} className="fill-current ml-0.5" />
                      </div>
                    </div>

                    <div className="absolute top-3 left-3 flex gap-1.5">
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

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      {video.category && (
                        <span className="text-[10px] text-(--bpa-green) font-black uppercase tracking-widest block">
                          {video.category.nameEn}
                        </span>
                      )}
                      
                      <Link href={`/videos/${video.slug}`}>
                        <h3 className="text-base font-extrabold text-(--bpa-navy) line-clamp-2 hover:text-(--bpa-green) transition leading-tight">
                          {video.titleEn}
                        </h3>
                        <p className="text-xs text-gray-400 font-semibold line-clamp-1 mt-1 font-sans">
                          {video.titleBn}
                        </p>
                      </Link>
                      
                      <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed font-medium">
                        {video.summaryEn || 'No description available.'}
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

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-12">
                <Link
                  href={`/videos?q=${q}${categorySlug ? `&category=${categorySlug}` : ''}&page=${page - 1}`}
                  className={`px-4 py-2 text-xs font-extrabold border border-gray-200 rounded-xl bg-white text-gray-600 hover:bg-gray-50 transition ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
                >
                  Previous
                </Link>
                <span className="text-xs text-gray-500 font-bold">
                  Page {page} of {meta.totalPages}
                </span>
                <Link
                  href={`/videos?q=${q}${categorySlug ? `&category=${categorySlug}` : ''}&page=${page + 1}`}
                  className={`px-4 py-2 text-xs font-extrabold border border-gray-200 rounded-xl bg-white text-gray-600 hover:bg-gray-50 transition ${page >= meta.totalPages ? 'pointer-events-none opacity-50' : ''}`}
                >
                  Next
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
