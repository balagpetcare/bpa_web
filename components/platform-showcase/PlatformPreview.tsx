import Image from 'next/image';
import type { PlatformShowcaseItem, PlatformShowcasePreviewMode, PublicMedia } from '@/lib/api/public-homepage';

type PlatformShowcasePlatformType = PlatformShowcaseItem['platformType'];

interface PlatformPreviewProps {
  media: PublicMedia | null;
  mode: PlatformShowcasePreviewMode;
  platformType: PlatformShowcasePlatformType;
  fallbackAlt: string;
  priority?: boolean;
}

function NeutralFallback({ fallbackAlt, platformType }: { fallbackAlt: string; platformType: PlatformShowcasePlatformType }) {
  const label = platformType === 'WEBSITE' ? 'Website preview' : 'App preview';
  const frame = platformType === 'WEBSITE' ? 'browser window' : 'device frame';

  return (
    <div
      className="flex min-h-72 w-full max-w-[760px] items-center justify-center rounded-[2rem] border border-dashed border-slate-300/70 bg-slate-50 px-8 py-16 text-center text-sm text-slate-500 shadow-sm"
      role="img"
      aria-label={`${fallbackAlt} unavailable`}
    >
      <div className="max-w-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-(--bpa-green) shadow-sm">
          <span className="text-lg font-bold">{platformType === 'WEBSITE' ? 'WWW' : 'APP'}</span>
        </div>
        <p className="text-base font-semibold text-(--bpa-navy)">{label}</p>
        <p className="mt-2 text-sm leading-6">
          {frame} media has not been selected yet. Please upload a CMS-approved asset for this platform.
        </p>
      </div>
    </div>
  );
}

function RawImage({ media, fallbackAlt, platformType, priority }: Pick<PlatformPreviewProps, 'media' | 'fallbackAlt' | 'platformType' | 'priority'>) {
  if (!media) return <NeutralFallback fallbackAlt={fallbackAlt} platformType={platformType} />;

  return (
    <div className="w-full min-w-0 max-w-[760px]">
      <Image
        src={media.url}
        alt={media.altText?.trim() || fallbackAlt}
        width={1200}
        height={1200}
        sizes="(max-width: 1023px) 92vw, 48vw"
        priority={priority}
        className="h-auto w-full object-contain"
      />
    </div>
  );
}

function AppDeviceFrame({ media, fallbackAlt, priority }: Pick<PlatformPreviewProps, 'media' | 'fallbackAlt' | 'priority'>) {
  if (!media) return <NeutralFallback fallbackAlt={fallbackAlt} platformType="APP" />;

  return (
    <div className="relative w-full max-w-[320px]">
      <div className="relative aspect-[9/19.5] w-full rounded-[2.9rem] bg-gradient-to-br from-slate-700 via-slate-950 to-black p-[8px] shadow-[0_32px_80px_-28px_rgba(15,23,42,0.8)] ring-1 ring-white/25">
        <div className="relative h-full w-full overflow-hidden rounded-[2.4rem] bg-slate-100 ring-1 ring-black/40">
          <Image
            src={media.url}
            alt={media.altText?.trim() || fallbackAlt}
            fill
            sizes="(max-width: 640px) 72vw, 320px"
            priority={priority}
            className="object-contain"
          />
          <span className="pointer-events-none absolute left-1/2 top-2 h-5 w-20 -translate-x-1/2 rounded-full bg-black/90 shadow-sm" aria-hidden="true" />
        </div>
        <span className="absolute -right-[3px] top-28 h-16 w-[3px] rounded-r bg-slate-700" aria-hidden="true" />
        <span className="absolute -left-[3px] top-24 h-10 w-[3px] rounded-l bg-slate-700" aria-hidden="true" />
      </div>
    </div>
  );
}

function WebsiteBrowserFrame({ media, fallbackAlt, mode, priority }: Pick<PlatformPreviewProps, 'media' | 'fallbackAlt' | 'mode' | 'priority'>) {
  if (!media) return <NeutralFallback fallbackAlt={fallbackAlt} platformType="WEBSITE" />;

  if (mode === 'RAW_IMAGE') return <RawImage media={media} fallbackAlt={fallbackAlt} platformType="WEBSITE" priority={priority} />;

  return (
    <div className="w-full max-w-[920px] overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-[0_30px_80px_-36px_rgba(15,23,42,0.45)]">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-400" aria-hidden="true" />
          <span className="h-3 w-3 rounded-full bg-amber-400" aria-hidden="true" />
          <span className="h-3 w-3 rounded-full bg-emerald-400" aria-hidden="true" />
        </div>
        <div className="ml-2 flex-1 rounded-full bg-white px-4 py-1.5 text-sm text-slate-500 ring-1 ring-slate-200">
          {fallbackAlt}
        </div>
      </div>
      <div className="bg-slate-50 p-3">
        <div className="overflow-hidden rounded-[1.2rem] bg-white ring-1 ring-slate-200">
          <Image
            src={media.url}
            alt={media.altText?.trim() || fallbackAlt}
            width={1600}
            height={1000}
            sizes="(max-width: 1023px) 92vw, 52vw"
            priority={priority}
            className="h-auto w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}

export default function PlatformPreview({ media, mode, platformType, fallbackAlt, priority }: PlatformPreviewProps) {
  if (platformType === 'WEBSITE') {
    return <WebsiteBrowserFrame media={media} fallbackAlt={fallbackAlt} mode={mode} priority={priority} />;
  }

  if (mode === 'RAW_IMAGE') {
    return <RawImage media={media} fallbackAlt={fallbackAlt} platformType="APP" priority={priority} />;
  }

  return <AppDeviceFrame media={media} fallbackAlt={fallbackAlt} priority={priority} />;
}
