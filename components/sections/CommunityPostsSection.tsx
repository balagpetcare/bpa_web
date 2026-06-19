import Link from 'next/link';
import { ArrowRight, MessageSquare, Megaphone, Heart, ClipboardCheck, Sparkles } from 'lucide-react';
import type { ContentPost } from '@/lib/api/content';

interface Props {
  posts: ContentPost[];
}

export default function CommunityPostsSection({ posts }: Props) {
  if (posts.length === 0) return null;

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
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-green-50 text-(--bpa-green) border border-green-100 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider mb-3">
              <Megaphone size={12} />
              BPA Community Hub
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-(--bpa-navy) tracking-tight">
              Community updates & pet care
            </h2>
          </div>
          <Link
            href="/community"
            className="inline-flex items-center gap-1.5 text-(--bpa-green) font-bold text-sm hover:underline"
          >
            Go to Community Hub <ArrowRight size={16} />
          </Link>
        </div>

        {/* Mobile: Horizontal scroll; Desktop: Grid */}
        <div className="flex overflow-x-auto pb-4 gap-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-x-visible snap-x snap-mandatory scrollbar-none">
          {posts.map(post => {
            const badge = getTypeBadge(post.type);
            const BadgeIcon = badge.icon;
            
            return (
              <div
                key={post.id}
                className="w-[290px] sm:w-auto shrink-0 snap-align-start bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col justify-between group p-6"
              >
                <div className="space-y-4">
                  {/* Category & Custom Badges */}
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

                  {/* Title & Language Toggle */}
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

                  {/* Body text / summary */}
                  <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed font-medium">
                    {post.summaryEn || 'No summary available.'}
                  </p>
                </div>

                {/* Footer block */}
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
      </div>
    </section>
  );
}
