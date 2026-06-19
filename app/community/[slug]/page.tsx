import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicCommunityPostDetail } from '@/lib/api/content';
import { MessageSquare, ArrowLeft, Calendar, User, Check, ExternalLink, Megaphone, Heart, ClipboardCheck, Sparkles } from 'lucide-react';
import LikeButton from '@/components/content/LikeButton';
import ShareButton from '@/components/content/ShareButton';
import CommentSection from '@/components/content/CommentSection';
import { buildMetadata } from '@/lib/seo';
import { getSeoData } from '@/lib/api/seo';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const post = await getPublicCommunityPostDetail(slug).catch(() => null);

  if (!post) return {};

  const seo = await getSeoData(`/community/${slug}`).catch(() => null);
  return buildMetadata(
    {
      title: `${post.titleEn} — BPA Community Hub`,
      description: post.summaryEn || `Read the latest update on Bangladesh Pet Association.`,
      canonical: `/community/${slug}`,
    },
    seo
  );
}

export default async function CommunityDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const reqHeaders = await headers();
  const post = await getPublicCommunityPostDetail(slug, reqHeaders).catch(() => null);

  if (!post || post.type === 'VIDEO') {
    notFound();
  }

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

  const badge = getTypeBadge(post.type);
  const BadgeIcon = badge.icon;

  return (
    <main className="min-h-screen bg-gray-50/50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-(--bpa-green) font-bold text-sm mb-8 transition"
        >
          <ArrowLeft size={16} /> Back to Community Hub
        </Link>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Article Content */}
          <div className="lg:col-span-8 bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Header info */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 items-center">
                <span className={`inline-flex items-center gap-1.5 border px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${badge.classes}`}>
                  <BadgeIcon size={10} />
                  {badge.label}
                </span>
                
                {post.category && (
                  <span className="text-xs text-gray-400 font-bold border-l border-gray-200 pl-2">
                    {post.category.nameEn}
                  </span>
                )}
                
                {post.isPinned && (
                  <span className="bg-amber-500 text-white font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
                    Pinned
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-(--bpa-navy) tracking-tight leading-tight">
                {post.titleEn}
              </h1>
              <p className="text-sm text-gray-400 font-semibold font-sans">
                {post.titleBn}
              </p>
            </div>

            {/* Author info & Date */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-gray-400 font-bold border-y border-gray-50 py-4">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Draft'}
              </span>
              {post.createdBy && (
                <span className="flex items-center gap-1.5">
                  <User size={14} />
                  Published by {post.createdBy.name}
                </span>
              )}
            </div>

            {/* Body content */}
            <div
              className="prose prose-sm max-w-none text-gray-600 leading-relaxed font-medium"
              dangerouslySetInnerHTML={{ __html: post.bodyEn || post.summaryEn || '' }}
            />

            {post.bodyBn && (
              <div className="border-t border-gray-50 pt-6 space-y-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block">Bengali Version / বাংলা সংস্করণ</span>
                <div
                  className="prose prose-sm max-w-none text-gray-500 font-sans leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: post.bodyBn }}
                />
              </div>
            )}

            {/* Custom CTA Widget */}
            {post.ctaUrl && post.ctaLabelEn && (
              <div className="bg-green-50/50 border border-green-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                <div>
                  <h4 className="font-extrabold text-sm text-(--bpa-navy)">Take Action & Support BPA</h4>
                  <p className="text-xs text-gray-500 mt-1 font-medium">Follow the link below to get involved with this program.</p>
                </div>
                <Link
                  href={post.ctaUrl}
                  target={post.ctaUrl.startsWith('http') ? '_blank' : '_self'}
                  className="inline-flex items-center gap-2 bg-(--bpa-green) hover:bg-(--bpa-green-dark) text-white font-bold text-sm px-6 py-3 rounded-xl transition shadow-md w-full sm:w-auto justify-center"
                >
                  {post.ctaLabelEn} <ExternalLink size={14} />
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Actions Card */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-(--bpa-navy) border-b border-gray-50 pb-2">Actions</h3>
              <div className="flex gap-4">
                <LikeButton
                  postId={post.id}
                  initialLikes={post.likeCount}
                  initialLiked={!!post.liked}
                />
                <ShareButton
                  title={post.titleEn}
                  slug={post.slug}
                  type="COMMUNITY_POST"
                />
              </div>
            </div>

            {/* Comments Card */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <CommentSection
                postId={post.id}
                initialComments={post.comments}
                allowComments={post.allowComments}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
