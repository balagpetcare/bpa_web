import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublicCommunityPosts } from '@/lib/api/content';
import { Megaphone, Search, ArrowRight, MessageSquare, Heart, ClipboardCheck, Sparkles } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import { getSeoData } from '@/lib/api/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData('/community').catch(() => null);
  return buildMetadata(
    {
      title: 'BPA Community Hub — Pet Care Tips & Campaign Updates',
      description: 'Stay updated with announcements, volunteer insights, animal care tips, and stories from the Bangladesh Pet Association.',
      canonical: '/community',
    },
    seo
  );
}

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string; categoryId?: string }>;
}

export default async function CommunityPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams.q || '';
  const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page, 10) : 1;
  const categoryId = resolvedSearchParams.categoryId || '';

  const result = await getPublicCommunityPosts({ q, page, limit: 12, categoryId }).catch(() => ({ data: [], meta: { total: 0, totalPages: 1 } }));
  const posts = result.data || [];
  const meta = result.meta || { total: 0, totalPages: 1 };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'ANNOUNCEMENT':
        return {
          icon: Megaphone,
          label: 'Announcement',
          classes: 'bg-blue-50 text-blue-700 border-blue-100',
        };
      case 'DONATION_STORY':
        return {
          icon: Heart,
          label: 'Donation Story',
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        };
      case 'CAMPAIGN_UPDATE':
        return {
          icon: ClipboardCheck,
          label: 'Campaign Update',
          classes: 'bg-purple-50 text-purple-700 border-purple-100',
        };
      case 'PET_CARE_TIP':
        return {
          icon: Sparkles,
          label: 'Pet Care Tip',
          classes: 'bg-amber-50 text-amber-700 border-amber-100',
        };
      default:
        return {
          icon: MessageSquare,
          label: 'Community Update',
          classes: 'bg-gray-50 text-gray-700 border-gray-150',
        };
    }
  };

  return (
    <main className="min-h-screen bg-gray-50/50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 bg-green-50 text-(--bpa-green) border border-green-100 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider mb-4">
            <MessageSquare size={12} />
            Stay Connected
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-(--bpa-navy) tracking-tight mb-4">
            BPA Community Hub
          </h1>
          <p className="text-gray-500 text-base leading-relaxed">
            Read stories of rescued animals, access quick pet-care guidelines, and check out official bulletins.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-12">
          <form method="GET" action="/community" className="relative">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search community posts & tips..."
              className="w-full rounded-2xl border border-gray-250 py-3.5 pl-12 pr-4 text-sm focus:border-(--bpa-green) focus:ring-1 focus:ring-(--bpa-green) focus:outline-none bg-white font-medium"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            {categoryId && <input type="hidden" name="categoryId" value={categoryId} />}
          </form>
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center max-w-md mx-auto shadow-sm">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 mx-auto mb-4 border border-gray-100">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-lg font-bold text-(--bpa-navy) mb-2">No updates found</h3>
            <p className="text-gray-500 text-sm mb-6">
              {q ? `We couldn't find any articles matching "${q}". Try another search term.` : 'Stay tuned for upcoming community posts!'}
            </p>
            {(q || categoryId) && (
              <Link href="/community" className="inline-block bg-(--bpa-green) hover:bg-(--bpa-green-dark) text-white font-bold text-sm px-6 py-2.5 rounded-xl transition">
                Clear Filters
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map(post => {
                const badge = getTypeBadge(post.type);
                const BadgeIcon = badge.icon;

                return (
                  <div
                    key={post.id}
                    className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col justify-between group p-6"
                  >
                    <div className="space-y-4">
                      {/* Badge and Pin Info */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-50 pb-3">
                        <span className={`inline-flex items-center gap-1.5 border px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${badge.classes}`}>
                          <BadgeIcon size={10} />
                          {badge.label}
                        </span>
                        
                        <div className="flex gap-1.5">
                          {post.isPinned && (
                            <span className="bg-amber-500 text-white font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
                              Pinned
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Header and Title */}
                      <div className="space-y-1.5">
                        <Link href={`/community/${post.slug}`} className="block">
                          <h3 className="text-lg font-extrabold text-(--bpa-navy) group-hover:text-(--bpa-green) transition leading-snug line-clamp-2">
                            {post.titleEn}
                          </h3>
                          <p className="text-xs text-gray-400 font-semibold line-clamp-1 mt-1 font-sans">
                            {post.titleBn}
                          </p>
                        </Link>
                      </div>

                      {/* Excerpt */}
                      <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed font-medium">
                        {post.summaryEn || 'No summary available.'}
                      </p>
                    </div>

                    {/* Metadata footer */}
                    <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400 font-semibold">
                      <div className="flex flex-col">
                        <span className="text-gray-700 font-extrabold">{post.createdBy?.name || 'BPA Staff'}</span>
                        <span className="text-[10px] mt-0.5">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Draft'}</span>
                      </div>
                      
                      <Link
                        href={`/community/${post.slug}`}
                        className="inline-flex items-center gap-1 text-(--bpa-green) font-bold group-hover:translate-x-0.5 transition-transform"
                      >
                        Read <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-12">
                <Link
                  href={`/community?q=${q}&categoryId=${categoryId}&page=${page - 1}`}
                  className={`px-4 py-2 text-xs font-extrabold border border-gray-200 rounded-xl bg-white text-gray-600 hover:bg-gray-50 transition ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
                >
                  Previous
                </Link>
                <span className="text-xs text-gray-500 font-bold">
                  Page {page} of {meta.totalPages}
                </span>
                <Link
                  href={`/community?q=${q}&categoryId=${categoryId}&page=${page + 1}`}
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
