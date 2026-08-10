import Image from 'next/image';
import type { PlatformShowcasePreviewMode, PublicMedia } from '@/lib/api/public-homepage';

interface AppPreviewProps {
  media: PublicMedia | null;
  mode: PlatformShowcasePreviewMode;
  fallbackAlt: string;
}

export default function AppPreview({ media, mode, fallbackAlt }: AppPreviewProps) {
  const alt = media?.altText?.trim() || fallbackAlt;

  if (!media) {
    return (
      <div className="flex min-h-64 w-full max-w-sm items-center justify-center rounded-3xl border border-dashed border-slate-300/70 bg-slate-100/50 px-8 text-center text-sm text-slate-500" role="img" aria-label={`${fallbackAlt} unavailable`}>
        Preview coming soon
      </div>
    );
  }

  if (mode === 'RAW_IMAGE') {
    return <Image src={media.url} alt={alt} width={900} height={1100} sizes="(max-width: 1023px) 92vw, 48vw" className="h-auto w-full max-w-[760px] object-contain" />;
  }

  return (
    <div className="relative aspect-[9/19.5] w-full max-w-[310px] rounded-[2.8rem] bg-gradient-to-br from-slate-700 via-slate-950 to-black p-[7px] shadow-[0_28px_70px_-24px_rgba(15,23,42,0.75)] ring-1 ring-white/25">
      <div className="relative h-full w-full overflow-hidden rounded-[2.4rem] bg-slate-100 ring-1 ring-black/40">
        <Image src={media.url} alt={alt} fill sizes="(max-width: 640px) 72vw, 310px" className="object-contain" />
        <span className="pointer-events-none absolute left-1/2 top-2 h-5 w-20 -translate-x-1/2 rounded-full bg-black/90 shadow-sm" aria-hidden="true" />
      </div>
      <span className="absolute -right-[3px] top-28 h-16 w-[3px] rounded-r bg-slate-700" aria-hidden="true" />
      <span className="absolute -left-[3px] top-24 h-10 w-[3px] rounded-l bg-slate-700" aria-hidden="true" />
    </div>
  );
}
