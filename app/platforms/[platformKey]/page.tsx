import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Apple, ArrowLeft, ArrowUpRight, Check, Globe2, Play, Sparkles } from 'lucide-react';
import PlatformPreview from '@/components/platform-showcase/PlatformPreview';
import PlatformQrCode from '@/components/platform-showcase/PlatformQrCode';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { getPublicPlatform, type PlatformShowcaseLink } from '@/lib/api/public-homepage';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 60;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ platformKey: string }>;
}

const linkIcons = { GOOGLE_PLAY: Play, APP_STORE: Apple, WEBSITE: Globe2, OTHER: ArrowUpRight } as const;

function isDestination(link: PlatformShowcaseLink) {
  return link.type !== 'DETAILS';
}

function DestinationLink({ link }: { link: PlatformShowcaseLink }) {
  const Icon = linkIcons[link.type as keyof typeof linkIcons] || ArrowUpRight;
  return (
    <a href={link.url} {...(link.openInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="inline-flex min-h-12 items-center gap-3 rounded-xl bg-(--bpa-navy) px-5 py-3 font-semibold text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--bpa-green)">
      <Icon className="h-5 w-5" aria-hidden="true" />
      {link.label}
      {link.openInNewTab && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { platformKey } = await params;
  const result = await getPublicPlatform(platformKey, { cache: 'no-store' });
  if (!result) return buildMetadata({ title: 'Platform not found', noIndex: true });
  const { item } = result;
  return buildMetadata({
    title: item.heading || item.name,
    description: item.description || item.subheading || `Discover ${item.name} from the BPA digital ecosystem.`,
    canonical: `/platforms/${item.platformKey}`,
    ogImage: item.primaryPreview?.url || item.secondaryPreview?.url || item.logo?.url || undefined,
  });
}

export default async function PlatformDetailsPage({ params }: PageProps) {
  const { platformKey } = await params;
  const result = await getPublicPlatform(platformKey, { cache: 'no-store' });
  if (!result) notFound();

  const { showcase, item } = result;
  const destinations = item.links.filter(isDestination);
  const qrLinks = destinations.filter((link) => link.qrEnabled);
  const screenshots = [item.primaryPreview, item.secondaryPreview].filter((media): media is NonNullable<typeof media> => Boolean(media));
  const isComingSoon = destinations.length === 0;

  return (
    <>
      <section className="bg-gradient-to-br from-slate-50 via-white to-green-50/40 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Platforms', href: `/#platform-${item.platformKey}` }, { label: item.name }]} />
          <div className="mt-10 grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <div className="flex flex-wrap items-center gap-4">
                {item.logo && <Image src={item.logo.url} alt={item.logo.altText?.trim() || `${item.name} logo`} width={72} height={72} className="h-18 w-18 object-contain" priority />}
                {(item.badgeText || isComingSoon) && <span className="rounded-full bg-green-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-(--bpa-green)">{isComingSoon ? 'Coming soon' : item.badgeText}</span>}
              </div>
              {showcase.eyebrow && <p className="mt-7 text-sm font-bold uppercase tracking-[0.18em] text-(--bpa-green)">{showcase.eyebrow}</p>}
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-(--bpa-navy) sm:text-5xl lg:text-6xl">{item.heading || item.name}</h1>
              {item.subheading && <p className="mt-5 text-xl font-semibold text-(--bpa-green)">{item.subheading}</p>}
              {item.description && <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{item.description}</p>}

              {item.featureBullets.length > 0 && <ul className="mt-8 grid gap-3 sm:grid-cols-2">{item.featureBullets.map((feature, index) => <li key={`${feature}-${index}`} className="flex items-start gap-3 text-slate-700"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--bpa-green) text-white"><Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" /></span><span>{feature}</span></li>)}</ul>}

              {isComingSoon ? <div className="mt-9 inline-flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 font-semibold text-(--bpa-navy)"><Sparkles className="h-5 w-5 text-(--bpa-green)" aria-hidden="true" />This platform is coming soon.</div> : <div className="mt-9 flex flex-wrap gap-3">{destinations.map((link) => <DestinationLink key={`${link.type}-${link.url}`} link={link} />)}</div>}

              {item.ctaText && item.ctaUrl && <a href={item.ctaUrl} {...(item.ctaUrl.startsWith('/') ? {} : { target: '_blank', rel: 'noopener noreferrer' })} className="mt-8 inline-flex items-center gap-2 font-bold text-(--bpa-green) hover:underline">{item.ctaText}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>}
            </div>
            <PlatformPreview
              media={item.primaryPreview || item.secondaryPreview}
              mode={item.previewMode || 'RAW_IMAGE'}
              platformType={item.platformType}
              fallbackAlt={`${item.name} platform preview`}
              priority
            />
          </div>
        </div>
      </section>

      {(screenshots.length > 1 || qrLinks.length > 0) && <section className="bg-white py-14 sm:py-20"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {screenshots.length > 1 && <div><h2 className="text-3xl font-bold text-(--bpa-navy)">Screenshots</h2><div className="mt-8 grid gap-6 md:grid-cols-2">{screenshots.map((shot) => <div key={shot.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3"><Image src={shot.url} alt={shot.altText?.trim() || `${item.name} screenshot`} width={1000} height={750} className="h-auto w-full rounded-xl object-contain" /></div>)}</div></div>}
        {qrLinks.length > 0 && <div className={screenshots.length > 1 ? 'mt-16' : ''}><h2 className="text-3xl font-bold text-(--bpa-navy)">Scan to open</h2><div className="mt-8 flex flex-wrap gap-8">{qrLinks.map((link) => <PlatformQrCode key={`${link.type}-${link.url}`} destinationUrl={link.url} isActive qrEnabled caption={link.qrCaption || `Scan for ${link.label}`} />)}</div></div>}
      </div></section>}

      <section className="bg-(--bpa-navy) py-12"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-8"><div><p className="text-sm font-bold uppercase tracking-wider text-(--bpa-green)">BPA digital ecosystem</p><h2 className="mt-2 text-2xl font-bold text-white">Explore more ways to connect with BPA</h2></div><Link href={`/#platform-showcase-${showcase.key}`} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-(--bpa-navy)"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back to platforms</Link></div></section>
    </>
  );
}
