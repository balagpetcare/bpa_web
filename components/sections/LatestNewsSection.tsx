import Link from 'next/link';
import Image from 'next/image';
import SectionHeader from '@/components/ui/SectionHeader';
import LinkButton from '@/components/ui/LinkButton';
import type { HomepageSection, NewsListItem } from '@/types/bpa.types';

interface LatestNewsSectionProps {
  items: NewsListItem[];
  section?: HomepageSection | null;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function LatestNewsSection({ items, section }: LatestNewsSectionProps) {
  if (!items.length) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <SectionHeader eyebrow={section?.eyebrow || 'Latest News'} title={section?.title || 'Stay Informed'} subtitle={section?.subtitle ?? undefined} />
          <LinkButton href={section?.ctaHref || '/news'} variant="outline" size="sm">{section?.ctaLabel || 'View All News'}</LinkButton>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.slice(0, 3).map((article) => (
            <Link key={article.id} href={`/news/${article.slug}`} className="group block">
              <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                <div className="relative aspect-[16/9] bg-gray-100">
                  {article.coverImageUrl ? (
                    <Image src={article.coverImageUrl} alt={article.title} fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-(--bpa-green-light) flex items-center justify-center">
                      <span className="text-(--bpa-green) text-xs font-medium">BPA News</span>
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  {article.categoryName && (
                    <span className="text-xs font-medium text-(--bpa-green) uppercase tracking-wide mb-2">
                      {article.categoryName}
                    </span>
                  )}
                  <h3 className="font-bold text-(--bpa-navy) mb-2 group-hover:text-(--bpa-green) transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4 flex-1">{article.excerpt}</p>
                  )}
                  <time className="text-xs text-gray-400 mt-auto">{formatDate(article.publishedAt)}</time>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
