import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays } from 'lucide-react';
import type { NewsListItem } from '@/types/bpa.types';
import { resolveMediaUrl } from '@/lib/utils/media-url';

interface NewsCardProps {
  article: NewsListItem;
}

function formatDate(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function NewsCard({ article }: NewsCardProps) {
  const coverImageUrl = resolveMediaUrl(article.coverImageUrl);
  return (
    <Link href={`/news/${article.slug}`} className="group block h-full">
      <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
        <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt={article.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-(--bpa-navy)/10 to-(--bpa-navy)/10 flex items-center justify-center">
              <span className="text-4xl font-bold text-(--bpa-green)">BPA</span>
            </div>
          )}
          {article.categoryName && (
            <span className="absolute top-3 left-3 bg-(--bpa-green) text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {article.categoryName}
            </span>
          )}
        </div>
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
            <CalendarDays size={12} />
            <time>{formatDate(article.publishedAt ?? article.createdAt)}</time>
            {article.authorName && (
              <>
                <span className="mx-1">·</span>
                <span>{article.authorName}</span>
              </>
            )}
          </div>
          <h3 className="font-bold text-(--bpa-navy) mb-2 group-hover:text-(--bpa-green) transition-colors line-clamp-2 leading-snug">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 flex-1">{article.excerpt}</p>
          )}
          <span className="mt-4 text-xs font-semibold text-(--bpa-green) group-hover:underline">
            Read more →
          </span>
        </div>
      </article>
    </Link>
  );
}
