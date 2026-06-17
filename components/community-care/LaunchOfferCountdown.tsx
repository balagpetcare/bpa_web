'use client';

import { useEffect, useState } from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { NormalizedProgram } from '@/lib/community-care-normalizer';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calc(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

function TimeUnit({ value, label, labelBn }: { value: number; label: string; labelBn: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white text-(--bpa-navy) rounded-xl sm:rounded-2xl w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center shadow-lg border border-green-100">
        <span className="text-2xl sm:text-4xl font-black tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <div className="mt-2 text-center">
        <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-80">{label}</span>
        <span className="block text-[9px] sm:text-[10px] font-medium opacity-60">{labelBn}</span>
      </div>
    </div>
  );
}

interface Props {
  program: NormalizedProgram;
}

export default function LaunchOfferCountdown({ program }: Props) {
  const [time, setTime] = useState<TimeLeft | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (!program.offerEndAt) return;

    const target = program.offerEndAt;
    const update = () => setTime(calc(target));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [program.offerEndAt]);

  if (!mounted) {
    return (
      <div className="w-full bg-green-50 animate-pulse py-12 rounded-3xl mx-4 my-8 h-[400px]" />
    );
  }

  if (!program.offerEndAt || program.isOfferExpired) {
     if (program.isOfferExpired && program.priceAfterOffer === 'SHOW_EXPIRED_MESSAGE') {
        return (
          <div className="max-w-7xl mx-auto px-4 my-8">
            <div className="w-full bg-amber-50 border border-amber-200 py-10 rounded-3xl text-center">
              <p className="text-amber-700 font-bold text-lg">Founding Member Launch Offer has ended.</p>
              <Link href="/community-pet-care" className="text-(--bpa-green) font-semibold mt-2 inline-block hover:underline">
                 Learn about our regular memberships
              </Link>
            </div>
          </div>
        );
     }
     return null;
  }

  const isExpired = time && time.days === 0 && time.hours === 0 && time.minutes === 0 && time.seconds === 0;

  if (isExpired) {
    return (
      <div className="max-w-7xl mx-auto px-4 my-8">
        <div className="w-full bg-gray-50 border border-gray-200 py-10 rounded-3xl text-center">
          <p className="text-gray-500 font-bold text-lg">Launch offer has just ended.</p>
        </div>
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-(--bpa-green) to-green-700 text-white py-12 sm:py-16 rounded-3xl shadow-2xl mx-4 my-8">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-black/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-6 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest mb-6">
          <Clock size={16} />
          Limited Time Offer
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold mb-4 max-w-2xl leading-tight">
          {program.offerBannerEn}
        </h2>
        
        {program.offerBannerBn && (
          <p className="text-green-50 text-sm sm:text-base max-w-3xl mb-10 leading-relaxed font-medium">
            {program.offerBannerBn}
          </p>
        )}

        <div className="flex items-start justify-center gap-3 sm:gap-6 mb-12">
          <TimeUnit value={time?.days ?? 0} label="Days" labelBn="দিন" />
          <div className="text-2xl sm:text-4xl font-black mt-4 sm:mt-8 opacity-40">:</div>
          <TimeUnit value={time?.hours ?? 0} label="Hours" labelBn="ঘণ্টা" />
          <div className="text-2xl sm:text-4xl font-black mt-4 sm:mt-8 opacity-40">:</div>
          <TimeUnit value={time?.minutes ?? 0} label="Min" labelBn="মিনিট" />
          <div className="text-2xl sm:text-4xl font-black mt-4 sm:mt-8 opacity-40">:</div>
          <TimeUnit value={time?.seconds ?? 0} label="Sec" labelBn="সেকেন্ড" />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Link
            href="/community-pet-care/contribute"
            className="group inline-flex items-center gap-2 bg-white text-(--bpa-green) px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            Get Your BPA Community Care Partner Card
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          {program.offerEndAt && (
             <p className="text-green-100 text-sm font-semibold">
               Ends: {program.offerEndAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
             </p>
          )}
        </div>
      </div>
    </section>
  );
}
