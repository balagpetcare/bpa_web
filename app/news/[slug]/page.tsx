import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/ui/Breadcrumb';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import NewsArticleJsonLd from '@/components/seo/NewsArticleJsonLd';
import NewsCard from '@/components/news/NewsCard';
import { getNewsBySlug, getNewsList } from '@/lib/api/news';
import { getSeoData } from '@/lib/api/seo';
import { buildMetadata, BASE_URL } from '@/lib/seo';
import { CalendarDays, User, Tag, ArrowLeft } from 'lucide-react';
import DonationCTASection from '@/components/donations/DonationCTASection';
import { sanitizeCmsHtml } from '@/lib/utils/sanitize';

export const revalidate = 600;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const { items } = await getNewsList({ limit: 100 });
    return items.map((n) => ({ slug: n.slug }));
  } catch {
    return [];
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const [article, seo] = await Promise.all([
      getNewsBySlug(slug, { next: { revalidate: 600, tags: [`news-${slug}`] } }),
      getSeoData(`/news/${slug}`),
    ]);
    if (!article) return {};
    return buildMetadata(
      {
        title: article.title,
        description: article.excerpt ?? `Read ${article.title} on BPA News.`,
        ogImage: article.coverImageUrl ?? undefined,
        canonical: `/news/${slug}`,
        ogType: 'article',
        publishedTime: article.publishedAt ?? article.createdAt,
        modifiedTime: article.updatedAt,
        authors: article.authorName ? [article.authorName] : undefined,
        keywords: article.tags?.map((t) => t.name),
      },
      seo,
    );
  } catch {
    return {};
  }
}

function formatDate(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = await params;

  let article: Awaited<ReturnType<typeof getNewsBySlug>>;
  try {
    article = await getNewsBySlug(slug, { next: { revalidate: 600, tags: [`news-${slug}`] } });
  } catch {
    notFound();
  }
  if (!article) notFound();

  // Related: prefer same category, exclude current, cap at 3
  let related: Awaited<ReturnType<typeof getNewsList>>['items'] = [];
  try {
    const res = await getNewsList(
      { limit: 12 },
      { next: { revalidate: 300, tags: ['news-list'] } },
    );
    const sameCat = res.items.filter(
      (n) => n.slug !== slug && n.categoryName === article.categoryName,
    );
    related = sameCat.length >= 3
      ? sameCat.slice(0, 3)
      : [
          ...sameCat,
          ...res.items
            .filter((n) => n.slug !== slug && !sameCat.includes(n))
            .slice(0, 3 - sameCat.length),
        ];
  } catch {
    // no related — fine
  }

  const canonicalUrl = `${BASE_URL}/news/${slug}`;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'News', url: '/news' },
          { name: article.title, url: `/news/${slug}` },
        ]}
      />
      <NewsArticleJsonLd article={article} />

      {/* Page header */}
      <section className="bg-gray-50 border-b border-gray-100 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'News', href: '/news' }, { label: article.title }]} />
        </div>
      </section>

      {/* Article */}
      <article className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category + meta */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {article.categoryName && (
              <span className="bg-(--bpa-green) text-white text-xs font-semibold px-3 py-1 rounded-full">
                {article.categoryName}
              </span>
            )}
            <div className="flex items-center gap-1.5 text-sm text-gray-400">
              <CalendarDays size={14} />
              <time dateTime={article.publishedAt ?? article.createdAt}>
                {formatDate(article.publishedAt ?? article.createdAt)}
              </time>
            </div>
            {article.authorName && (
              <div className="flex items-center gap-1.5 text-sm text-gray-400">
                <User size={14} />
                <span>{article.authorName}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-(--bpa-navy) leading-tight mb-6">
            {article.title}
          </h1>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-lg text-gray-500 leading-relaxed mb-8 border-l-4 border-(--bpa-green) pl-4">
              {article.excerpt}
            </p>
          )}

          {/* Cover image */}
          {article.coverImageUrl && (
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-10 bg-gray-100">
              <Image
                src={article.coverImageUrl}
                alt={article.title}
                fill
                priority
                sizes="(max-width: 896px) 100vw, 896px"
                className="object-cover"
              />
            </div>
          )}

          {/* Body — sanitized server-side before rendering */}
          <div
            className="prose prose-lg prose-headings:text-(--bpa-navy) prose-a:text-(--bpa-green) prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(article.body) }}
          />

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap items-center gap-2">
              <Tag size={14} className="text-gray-400" />
              {article.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Share + canonical */}
          <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-sm font-medium text-(--bpa-green) hover:underline"
            >
              <ArrowLeft size={16} /> Back to News
            </Link>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-gray-500 hover:text-(--bpa-navy) transition-colors"
            >
              Share on Facebook →
            </a>
          </div>
        </div>
      </article>

      <DonationCTASection
        title="Support Animal Welfare in Bangladesh"
        subtitle="BPA's work is possible because of people like you. Make a secure donation today and help fund rescue, treatment, and care for animals across Bangladesh."
        theme="navy"
        compact
      />

      {/* Related articles */}
      {related.length > 0 && (
        <section className="py-16 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-(--bpa-navy) mb-8">More from BPA News</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((n) => (
                <NewsCard key={n.id} article={n} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
