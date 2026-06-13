'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowRight, CalendarDays, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import LinkButton from '@/components/ui/LinkButton';
import type { HeroSlide } from '@/types/bpa.types';

const FALLBACK_STATS = [
  { value: '2,500+', label: 'Active Members' },
  { value: '50+', label: 'Events Hosted' },
  { value: '64', label: 'Districts Reached' },
];

const ROTATE_MS = 6000;

// Used when the CMS returns zero published slides
function StaticHeroFallback() {
  return (
    <section
      className="relative overflow-hidden text-white flex items-center"
      style={{
        minHeight: 'calc(100vh - 4rem)',
        background: 'linear-gradient(135deg, #1a2540 0%, #10231a 100%)',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 20% 20%, rgba(26,107,60,0.4) 0%, transparent 40%)',
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <p className="text-(--bpa-green) text-sm font-semibold uppercase tracking-widest mb-4">
          Bangladesh Pet Association
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6 max-w-3xl">
          A stronger national platform for responsible pet care
        </h1>
        <p className="text-lg sm:text-xl text-gray-200 leading-relaxed mb-9 max-w-2xl">
          BPA connects pet owners, veterinary professionals, volunteers, and partners through
          campaigns, education, events, and welfare programs across Bangladesh.
        </p>
        <div className="flex flex-wrap gap-4">
          <LinkButton href="/membership" size="lg">
            Become a Member <ArrowRight size={18} />
          </LinkButton>
          <LinkButton
            href="/campaigns"
            variant="outline"
            size="lg"
            className="border-white text-white hover:bg-white/10"
          >
            View Campaigns
          </LinkButton>
        </div>
      </div>
    </section>
  );
}

export default function EnterpriseHeroSection({ slides }: { slides: HeroSlide[] }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const count = slides.length;

  const goTo = useCallback(
    (idx: number) => {
      setCurrent(((idx % count) + count) % count);
    },
    [count],
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-rotate when there are multiple slides
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (count > 1) {
      timerRef.current = setInterval(next, ROTATE_MS);
    }
  }, [count, next]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { prev(); resetTimer(); }
      if (e.key === 'ArrowRight') { next(); resetTimer(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next, resetTimer]);

  if (count === 0) return <StaticHeroFallback />;

  const slide = slides[current];
  const stats = slide.stats?.length ? slide.stats : FALLBACK_STATS;

  return (
    <section
      className="relative overflow-hidden bg-(--bpa-navy) text-white"
      style={{ minHeight: 'calc(100vh - 4rem)' }}
      aria-label="Hero slider"
      aria-roledescription="carousel"
    >
      {/* ── Background layers (one per slide, cross-fade) ── */}
      {slides.map((s, idx) => {
        const dUrl = s.desktopImage?.url;
        const mUrl = s.mobileImage?.url ?? dUrl;
        return (
          <div
            key={s.id}
            aria-hidden="true"
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: idx === current ? 1 : 0, zIndex: 0 }}
          >
            {/* Mobile image */}
            {mUrl && (
              <div
                className="absolute inset-0 block sm:hidden"
                style={{
                  backgroundImage: `url(${mUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center top',
                }}
              />
            )}
            {/* Desktop image */}
            {dUrl && (
              <div
                className={`absolute inset-0 ${mUrl && mUrl !== dUrl ? 'hidden sm:block' : ''}`}
                style={{
                  backgroundImage: `url(${dUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center top',
                }}
              />
            )}
            {/* Dark gradient overlay — strong on left for text, lighter on right to show image */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to right, rgba(26,37,64,0.90) 0%, rgba(26,37,64,0.70) 45%, rgba(26,37,64,0.30) 100%)',
              }}
            />
          </div>
        );
      })}

      {/* ── Slide content ── */}
      <div
        className="relative flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-20 lg:py-28"
        style={{ minHeight: 'calc(100vh - 4rem)', zIndex: 10 }}
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="max-w-2xl xl:max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-green-100 mb-5 backdrop-blur-sm">
              <ShieldCheck size={14} />
              {slide.badgeText ?? 'Bangladesh Pet Association'}
            </div>

            {/* Eyebrow */}
            {slide.eyebrow && (
              <p className="text-(--bpa-green) text-sm font-semibold uppercase tracking-widest mb-3">
                {slide.eyebrow}
              </p>
            )}

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-5">
              {slide.headline}
            </h1>

            {/* Body */}
            {slide.body && (
              <p className="text-lg sm:text-xl text-gray-200 leading-relaxed mb-8 max-w-2xl">
                {slide.body}
              </p>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-10">
              {slide.ctaHref && slide.ctaLabel ? (
                <LinkButton
                  href={slide.ctaHref}
                  size="lg"
                  external={slide.ctaType === 'external'}
                >
                  {slide.ctaLabel} <ArrowRight size={18} />
                </LinkButton>
              ) : (
                <LinkButton href="/membership" size="lg">
                  Become a Member <ArrowRight size={18} />
                </LinkButton>
              )}
              {slide.secondaryCtaHref && slide.secondaryCtaLabel && (
                <LinkButton
                  href={slide.secondaryCtaHref}
                  variant="outline"
                  size="lg"
                  className="border-white/70 text-white hover:bg-white/10"
                  external={slide.secondaryCtaType === 'external'}
                >
                  {slide.secondaryCtaLabel}
                </LinkButton>
              )}
            </div>

            {/* Stats */}
            {stats.length > 0 && (
              <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-sm sm:max-w-md">
                {stats.slice(0, 3).map((stat) => (
                  <div
                    key={`${stat.value}-${stat.label}`}
                    className="border border-white/15 bg-white/10 px-3 py-3 backdrop-blur-sm"
                  >
                    <div className="text-xl sm:text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-gray-300 mt-0.5 leading-snug">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Countdown widget */}
        {slide.countdownTargetAt && (
          <div className="hidden xl:block absolute right-12 bottom-28 border border-white/15 bg-white/10 p-5 backdrop-blur-sm max-w-[180px]">
            <div className="flex items-center gap-2 text-green-100 text-xs mb-1">
              <CalendarDays size={14} />
              <span>{slide.countdownLabel ?? 'Deadline'}</span>
            </div>
            <div className="text-base font-semibold">
              {new Date(slide.countdownTargetAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </div>
          </div>
        )}

        {/* ── Carousel controls (only when 2+ slides) ── */}
        {count > 1 && (
          <>
            {/* Prev */}
            <button
              onClick={() => { prev(); resetTimer(); }}
              aria-label="Previous slide"
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-sm transition-colors flex items-center justify-center"
              style={{ zIndex: 20 }}
            >
              <ChevronLeft size={20} />
            </button>

            {/* Next */}
            <button
              onClick={() => { next(); resetTimer(); }}
              aria-label="Next slide"
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-sm transition-colors flex items-center justify-center"
              style={{ zIndex: 20 }}
            >
              <ChevronRight size={20} />
            </button>

            {/* Dots */}
            <div
              className="absolute bottom-7 left-1/2 -translate-x-1/2 flex items-center gap-2"
              style={{ zIndex: 20 }}
            >
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => { goTo(idx); resetTimer(); }}
                  aria-label={`Go to slide ${idx + 1} of ${count}`}
                  aria-current={idx === current ? 'true' : undefined}
                  className={`rounded-full transition-all duration-300 ${
                    idx === current
                      ? 'w-6 h-2.5 bg-white'
                      : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
