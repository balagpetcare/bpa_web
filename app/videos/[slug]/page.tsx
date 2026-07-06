import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicVideoDetail } from '@/lib/api/content';
import { ArrowLeft, Calendar, Eye, CalendarCheck, ExternalLink } from 'lucide-react';
import LikeButton from '@/components/content/LikeButton';
import ShareButton from '@/components/content/ShareButton';
import CommentSection from '@/components/content/CommentSection';
import BPAVideoPlayer from '@/components/content/BPAVideoPlayer';
import { buildMetadata } from '@/lib/seo';
import { getSeoData } from '@/lib/api/seo';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

// Youtube parser logic moved into BPAVideoPlayer

type VideoSourceType = 'youtube' | 'upload';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const video = await getPublicVideoDetail(slug).catch(() => null);
  
  if (!video) return {};

  const seo = await getSeoData(`/videos/${slug}`).catch(() => null);
  return buildMetadata(
    {
      title: `${video.titleEn} — BPA Videos`,
      description: video.summaryEn || `Watch ${video.titleEn} on Bangladesh Pet Association video portal.`,
      canonical: `/videos/${slug}`,
    },
    seo
  );
}

export default async function VideoDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  const reqHeaders = await headers();
  const video = await getPublicVideoDetail(slug, reqHeaders).catch(() => null);

  if (!video || video.type !== 'VIDEO') {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50/50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link
          href="/videos"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-(--bpa-green) font-bold text-sm mb-8 transition"
        >
          <ArrowLeft size={16} /> Back to Gallery
        </Link>

        {/* Custom Video Player */}
        <BPAVideoPlayer
          videoSourceType={(video.videoSourceType ?? undefined) as VideoSourceType | undefined}
          videoUrl={video.videoUrl}
          videoFileUrl={video.videoFileUrl}
          videoPosterUrl={video.videoPosterUrl}
          title={video.titleEn}
        />

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-8 bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Header info */}
            <div className="space-y-3">
              {video.category && (
                <span className="text-xs text-(--bpa-green) font-black uppercase tracking-widest block">
                  {video.category.nameEn}
                </span>
              )}
              
              <h1 className="text-2xl sm:text-3xl font-extrabold text-(--bpa-navy) tracking-tight leading-tight">
                {video.titleEn}
              </h1>
              <p className="text-sm text-gray-400 font-semibold font-sans">
                {video.titleBn}
              </p>
            </div>

            {/* Meta facts */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-gray-400 font-bold border-y border-gray-50 py-4">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {video.publishedAt ? new Date(video.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Draft'}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye size={14} />
                {video.viewCount.toLocaleString()} views
              </span>
              {video.createdBy && (
                <span className="flex items-center gap-1.5">
                  <CalendarCheck size={14} />
                  Published by {video.createdBy.name}
                </span>
              )}
            </div>

            {/* Body Rich Text */}
            <div
              className="prose prose-sm max-w-none text-gray-600 leading-relaxed font-medium"
              dangerouslySetInnerHTML={{ __html: video.bodyEn || video.summaryEn || '' }}
            />

            {video.bodyBn && (
              <div className="border-t border-gray-50 pt-6 space-y-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block">Bengali Version / বাংলা সংস্করণ</span>
                <div
                  className="prose prose-sm max-w-none text-gray-500 font-sans leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: video.bodyBn }}
                />
              </div>
            )}

            {/* Custom CTA Widget */}
            {video.ctaUrl && video.ctaLabelEn && (
              <div className="bg-green-50/50 border border-green-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                <div>
                  <h4 className="font-extrabold text-sm text-(--bpa-navy)">Take Action & Support BPA</h4>
                  <p className="text-xs text-gray-500 mt-1 font-medium">Follow the link below to get involved with this program.</p>
                </div>
                <Link
                  href={video.ctaUrl}
                  target={video.ctaUrl.startsWith('http') ? '_blank' : '_self'}
                  className="inline-flex items-center gap-2 bg-(--bpa-green) hover:bg-(--bpa-green-dark) text-white font-bold text-sm px-6 py-3 rounded-xl transition shadow-md w-full sm:w-auto justify-center"
                >
                  {video.ctaLabelEn} <ExternalLink size={14} />
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
                  postId={video.id}
                  initialLikes={video.likeCount}
                  initialLiked={!!video.liked}
                />
                <ShareButton
                  title={video.titleEn}
                  slug={video.slug}
                  type="VIDEO"
                />
              </div>
            </div>

            {/* Comments block */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <CommentSection
                postId={video.id}
                initialComments={video.comments}
                allowComments={video.allowComments}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
