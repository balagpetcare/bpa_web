import Image from 'next/image';
import Link from 'next/link';
import { Apple, ArrowUpRight, Check, Globe2, Play } from 'lucide-react';
import PlatformPreview from '@/components/platform-showcase/PlatformPreview';
import PlatformQrCode from '@/components/platform-showcase/PlatformQrCode';
import type {
  PlatformShowcase,
  PlatformShowcaseItem,
  PlatformShowcaseLink,
  PlatformShowcaseLayout,
} from '@/lib/api/public-homepage';
import { selectCanonicalPlatformShowcase } from '@/lib/api/public-homepage';
import { Container, Section } from './Section';

interface Props {
  showcases: PlatformShowcase[];
}

const linkIcon = {
  GOOGLE_PLAY: Play,
  APP_STORE: Apple,
  WEBSITE: Globe2,
  DETAILS: ArrowUpRight,
  OTHER: ArrowUpRight,
} as const;

function linkProps(link: PlatformShowcaseLink) {
  return link.openInNewTab ? { target: '_blank' as const, rel: 'noopener noreferrer' } : {};
}

function platformTone(index: number, dark: boolean) {
  if (dark) return 'navy' as const;
  return index % 2 === 0 ? 'white' : 'green-tint';
}

function destinationStyle(type: PlatformShowcaseLink['type'], dark: boolean) {
  if (type === 'GOOGLE_PLAY' || type === 'APP_STORE') {
    return dark
      ? 'border-white/20 bg-white text-(--bpa-navy) hover:bg-gray-100 focus-visible:ring-white focus-visible:ring-offset-(--bpa-navy)'
      : 'border-(--bpa-navy) bg-(--bpa-navy) text-white hover:bg-slate-700 focus-visible:ring-(--bpa-green)';
  }

  return dark
    ? 'border-white/20 bg-transparent text-white hover:bg-white/10 focus-visible:ring-white focus-visible:ring-offset-(--bpa-navy)'
    : 'border-slate-200 bg-white text-(--bpa-navy) hover:border-(--bpa-green) focus-visible:ring-(--bpa-green)';
}

function PlatformActionButton({ link, dark }: { link: PlatformShowcaseLink; dark: boolean }) {
  const Icon = linkIcon[link.type];
  const label = link.type === 'GOOGLE_PLAY' ? 'Google Play' : link.type === 'APP_STORE' ? 'App Store' : link.label;

  return (
    <a
      href={link.url}
      {...linkProps(link)}
      aria-label={label ? `${label} (opens destination)` : undefined}
      className={`inline-flex min-h-12 items-center gap-3 rounded-lg border px-4 py-2.5 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${destinationStyle(
        link.type,
        dark,
      )}`}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span>
        {(link.type === 'GOOGLE_PLAY' || link.type === 'APP_STORE') && (
          <span className="block text-[10px] font-medium uppercase leading-none opacity-70">Download on</span>
        )}
        <span className={link.type === 'GOOGLE_PLAY' || link.type === 'APP_STORE' ? 'mt-1 block leading-none' : ''}>
          {label}
        </span>
      </span>
      {link.openInNewTab && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  );
}

function PlatformSection({
  showcase,
  item,
  dark,
  index,
}: {
  showcase: PlatformShowcase;
  item: PlatformShowcaseItem;
  dark: boolean;
  index: number;
}) {
  const layout: PlatformShowcaseLayout = item.layoutOverride || showcase.layout;
  const destinations = item.links.filter((link) => link.type !== 'DETAILS' && link.isActive);
  const details = item.links.find((link) => link.type === 'DETAILS' && link.isActive);
  const qrLinks = item.links.filter((link) => link.qrEnabled && link.isActive);
  const previewFirst = layout === 'PREVIEW_LEFT';
  const sectionTone = platformTone(index, dark);
  return (
    <Section
      id={`platform-${item.platformKey}`}
      tone={sectionTone}
      aria-labelledby={`platform-${item.platformKey}-title`}
      className="overflow-hidden border-t border-black/5"
    >
      <Container>
        <article className="grid min-w-0 grid-cols-1 items-center gap-10 overflow-hidden lg:grid-cols-2 lg:gap-16">
          <div className={previewFirst ? 'lg:order-1' : 'lg:order-2'}>
            <div className="flex min-w-0 items-center justify-center">
              <PlatformPreview
                media={item.primaryPreview || item.secondaryPreview}
                mode={item.previewMode || 'RAW_IMAGE'}
                platformType={item.platformType}
                fallbackAlt={`${item.name} platform preview`}
                priority={index === 0 || item.featured}
              />
            </div>
          </div>

          <div className={`min-w-0 ${previewFirst ? 'lg:order-2' : 'lg:order-1'}`}>
            <div className="flex flex-wrap items-center gap-3">
              {item.logo && (
                <Image
                  src={item.logo.url}
                  alt={item.logo.altText?.trim() || `${item.name} logo`}
                  width={48}
                  height={48}
                  className="h-12 w-12 object-contain"
                />
              )}
              {item.badgeText && (
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${dark ? 'bg-white/10 text-green-200' : 'bg-green-50 text-(--bpa-green)'}`}>
                  {item.badgeText}
                </span>
              )}
            </div>

            <p className={`mt-5 text-sm font-bold uppercase tracking-[0.18em] ${dark ? 'text-green-200' : 'text-(--bpa-green)'}`}>
              {showcase.eyebrow || 'BPA digital ecosystem'}
            </p>
            <h3
              id={`platform-${item.platformKey}-title`}
              className={`mt-3 text-3xl font-bold tracking-tight sm:text-4xl ${dark ? 'text-white' : 'text-(--bpa-navy)'}`}
            >
              {item.heading || item.name}
            </h3>
            {item.subheading && <p className={`mt-3 text-lg font-semibold ${dark ? 'text-green-100' : 'text-(--bpa-green)'}`}>{item.subheading}</p>}
            {item.description && <p className={`mt-5 max-w-2xl text-base leading-7 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{item.description}</p>}

            {item.featureBullets.length > 0 && (
              <ul className="mt-7 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {item.featureBullets.map((feature, featureIndex) => (
                  <li key={`${feature}-${featureIndex}`} className={`flex items-start gap-3 text-sm leading-6 ${dark ? 'text-slate-200' : 'text-slate-700'}`}>
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-(--bpa-green) text-white">
                      <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            )}

            {destinations.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-3">
                {destinations.map((link) => (
                  <PlatformActionButton key={`${link.type}-${link.url}`} link={link} dark={dark} />
                ))}
              </div>
            )}

            {qrLinks.length > 0 && (
              <div className={`mt-8 grid grid-cols-2 gap-4 rounded-xl p-4 sm:flex sm:w-fit ${dark ? 'bg-white/5' : 'bg-slate-50'}`}>
                {qrLinks.map((link) => (
                  <PlatformQrCode
                    key={`${link.type}-${link.url}`}
                    destinationUrl={link.url}
                    isActive
                    qrEnabled={link.qrEnabled}
                    caption={link.qrCaption || `Scan for ${link.label}`}
                    className="max-w-32 text-current"
                  />
                ))}
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-4">
              {item.ctaUrl && item.ctaText && (
                <a
                  href={item.ctaUrl}
                  {...(item.ctaUrl.startsWith('/') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                  className="inline-flex items-center gap-2 font-bold text-(--bpa-green) underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--bpa-green)"
                >
                  {item.ctaText}
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
              {details ? (
                <Link
                  href={`/platforms/${item.platformKey}`}
                  className="inline-flex items-center gap-2 font-bold text-(--bpa-green) underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--bpa-green)"
                >
                  {details.label || 'View details'}
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  {details.openInNewTab && <span className="sr-only"> (opens in a new tab)</span>}
                </Link>
              ) : (
                <Link
                  href={`/platforms/${item.platformKey}`}
                  className="inline-flex items-center gap-2 font-bold text-(--bpa-green) underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--bpa-green)"
                >
                  View details
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
            </div>
          </div>
        </article>
      </Container>
    </Section>
  );
}

function flattenShowcaseItems(showcases: PlatformShowcase[]) {
  const showcase = selectCanonicalPlatformShowcase(showcases);
  if (!showcase) return [];

  return showcase.items
    .filter((item) => item.isActive !== false)
    .map((item) => ({
      showcase,
      item: {
        ...item,
        links: item.links.filter((link) => link.isActive !== false),
      },
    }));
}

export default function DigitalEcosystemSection({ showcases }: Props) {
  const intro = selectCanonicalPlatformShowcase(showcases);
  if (!intro) return null;

  const entries = flattenShowcaseItems([intro]);
  if (entries.length === 0) return null;

  return (
    <>
      <Section tone={/navy|dark/i.test(intro.theme) ? 'gradient-navy' : 'gradient-soft'} aria-labelledby={`platform-showcase-${intro.key}`}>
        <Container>
          <div className="max-w-3xl">
            {intro.eyebrow && (
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-(--bpa-green)">
                {intro.eyebrow}
              </p>
            )}
            <h2 id={`platform-showcase-${intro.key}`} className="text-3xl font-bold tracking-tight text-(--bpa-navy) sm:text-4xl lg:text-5xl">
              {intro.title}
            </h2>
            {intro.subtitle && <p className="mt-5 text-lg leading-8 text-slate-600">{intro.subtitle}</p>}
            {intro.description && <p className="mt-3 leading-7 text-slate-500">{intro.description}</p>}
          </div>
        </Container>
      </Section>

      {entries.map(({ showcase, item }, index) => (
        <PlatformSection key={item.platformKey} showcase={showcase} item={item} dark={/navy|dark/i.test(showcase.theme)} index={index} />
      ))}
    </>
  );
}
