'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import type { CampaignMedia } from '@/types/bpa.types';

interface Props {
  items: CampaignMedia[];
  title: string;
}

export default function CampaignGallery({ items, title }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [carousel, setCarousel] = useState(0);

  const open = (i: number) => setLightbox(i);
  const close = () => setLightbox(null);

  const prev = useCallback(() => {
    if (lightbox !== null) setLightbox((lightbox - 1 + items.length) % items.length);
  }, [lightbox, items.length]);

  const next = useCallback(() => {
    if (lightbox !== null) setLightbox((lightbox + 1) % items.length);
  }, [lightbox, items.length]);

  // Keyboard navigation
  useEffect(() => {
    if (lightbox === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, prev, next]);

  // Auto-advance carousel every 4s when lightbox is closed
  useEffect(() => {
    if (lightbox !== null || items.length <= 1) return;
    const id = setInterval(() => setCarousel(c => (c + 1) % items.length), 4000);
    return () => clearInterval(id);
  }, [lightbox, items.length]);

  if (items.length === 0) return null;

  const carouselItem = items[carousel];

  return (
    <>
      {/* Carousel strip */}
      <section id="gallery">
        <h2 className="text-2xl font-bold text-(--bpa-navy)/10 mb-6 flex items-center gap-2">
          <span className="text-(--bpa-green)">📷</span> Gallery
        </h2>

        {/* Main carousel */}
        <div className="relative rounded-2xl overflow-hidden bg-black mb-4 group cursor-pointer"
          style={{ aspectRatio: '16/7' }}
          onClick={() => open(carousel)}>
          {carouselItem && (
            <Image
              key={carouselItem.id}
              src={carouselItem.mediaFile.url}
              alt={carouselItem.altText ?? title}
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover transition-opacity duration-500"
              priority={carousel === 0}
            />
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
              <ZoomIn size={20} className="text-(--bpa-green)" />
            </div>
          </div>
          {/* Counter */}
          {items.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
              {carousel + 1} / {items.length}
            </div>
          )}
          {/* Prev/Next overlay buttons */}
          {items.length > 1 && (
            <>
              <button
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                onClick={e => { e.stopPropagation(); setCarousel((carousel - 1 + items.length) % items.length); }}>
                <ChevronLeft size={18} />
              </button>
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                onClick={e => { e.stopPropagation(); setCarousel((carousel + 1) % items.length); }}>
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {items.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {items.map((item, i) => (
              <button key={item.id}
                onClick={() => setCarousel(i)}
                className={`shrink-0 rounded-xl overflow-hidden relative transition-all ${i === carousel ? 'ring-2 ring-(--bpa-green-light) ring-offset-1' : 'opacity-60 hover:opacity-90'}`}
                style={{ width: 72, height: 50 }}>
                <Image
                  src={item.mediaFile.url}
                  alt={item.altText ?? `${title} ${i + 1}`}
                  fill
                  sizes="72px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
          onClick={close}>
          {/* Close */}
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
            onClick={close}>
            <X size={20} />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-semibold">
            {lightbox + 1} / {items.length}
          </div>

          {/* Image */}
          <div className="relative max-w-[90vw] max-h-[85vh] w-full"
            style={{ aspectRatio: '16/10' }}
            onClick={e => e.stopPropagation()}>
            <Image
              src={items[lightbox].mediaFile.url}
              alt={items[lightbox].altText ?? title}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>

          {/* Alt text caption */}
          {items[lightbox].altText && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm text-center px-4 max-w-lg">
              {items[lightbox].altText}
            </div>
          )}

          {/* Prev/Next */}
          {items.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                onClick={e => { e.stopPropagation(); prev(); }}>
                <ChevronLeft size={22} />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                onClick={e => { e.stopPropagation(); next(); }}>
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
