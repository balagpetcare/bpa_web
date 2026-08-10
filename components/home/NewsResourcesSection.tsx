import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Newspaper } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import { Section, Container, Grid12 } from './Section';
import type { HomepageNewsItem } from '@/lib/api/public-homepage';

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface Props {
  news: HomepageNewsItem[];
}

export default function NewsResourcesSection({ news }: Props) {
  if (news.length === 0) return null;

  return (
    <Section tone="muted" aria-label="News & Resources">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeader
            eyebrow="Stay informed"
            title="News & Resources"
            subtitle="The latest updates, awareness posts, and stories from across the BPA network."
          />
          <Link
            href="/news"
            className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-(--bpa-navy) transition-colors hover:text-(--bpa-green) md:inline-flex"
          >
            All news <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <Grid12 className="mt-10">
          {news.map((item) => {
            const dateLabel = formatDate(item.publishedAt);
            return (
              <Link
                key={item.id}
                href={`/news/${item.slug}`}
                className="group col-span-1 sm:col-span-6 lg:col-span-4 flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--bpa-navy) focus-visible:ring-offset-2"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
                  {item.coverImageUrl ? (
                    <Image
                      src={item.coverImageUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-(--bpa-green-light)">
                      <Newspaper className="h-8 w-8 text-(--bpa-green)/50" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base font-bold text-(--bpa-navy) transition-colors group-hover:text-(--bpa-green) line-clamp-2">
                    {item.title}
                  </h3>
                  {item.excerpt && <p className="mt-2 flex-1 text-sm leading-6 text-gray-500 line-clamp-2">{item.excerpt}</p>}
                  {dateLabel && (
                    <span className="mt-4 inline-flex items-center gap-1.5 text-xs text-gray-400">
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                      {dateLabel}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </Grid12>
        <div className="mt-8 text-center md:hidden">
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--bpa-navy) hover:text-(--bpa-green)"
          >
            All news <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </Section>
  );
}
