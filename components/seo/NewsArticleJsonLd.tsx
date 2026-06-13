import JsonLd from './JsonLd';
import { BASE_URL } from '@/lib/seo';
import type { NewsArticle } from '@/types/bpa.types';

interface NewsArticleJsonLdProps {
  article: NewsArticle;
}

export default function NewsArticleJsonLd({ article }: NewsArticleJsonLdProps) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: article.title,
        description: article.excerpt ?? undefined,
        image: article.coverImageUrl ? [article.coverImageUrl] : undefined,
        datePublished: article.publishedAt ?? article.createdAt,
        dateModified: article.updatedAt,
        author: { '@type': 'Person', name: article.authorName },
        publisher: {
          '@type': 'Organization',
          name: 'Bangladesh Pet Association',
          logo: { '@type': 'ImageObject', url: `${BASE_URL}/logo.png` },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}/news/${article.slug}` },
      }}
    />
  );
}
