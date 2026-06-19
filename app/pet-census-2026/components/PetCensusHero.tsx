'use client';

import { Users, ClipboardCheck, LayoutGrid, Info, Clock } from 'lucide-react';
import type { PetCensusCampaign } from '@/types/bpa.types';
import { useEffect, useState } from 'react';

interface Props {
  settings: PetCensusCampaign;
}

export default function PetCensusHero({ settings }: Props) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    if (!settings.countdownTargetAt) return;

    const target = new Date(settings.countdownTargetAt).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft(null);
      } else {
        setTimeLeft({
          d: Math.floor(distance / (1000 * 60 * 60 * 24)),
          h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [settings.countdownTargetAt]);

  const kpis = [
    {
      icon: Users,
      value: settings.currentSubmissions.toLocaleString() + '+',
      label: 'Pet Owners',
      labelBn: 'পোষা প্রাণীর মালিক',
    },
    {
      icon: LayoutGrid,
      value: '8/8',
      label: 'Zones Active',
      labelBn: 'সক্রিয় জোন',
    },
    {
      icon: ClipboardCheck,
      value: settings.status === 'registration_open' ? 'Live' : 'Closed',
      label: 'Status',
      labelBn: 'বর্তমান অবস্থা',
    },
  ];

  return (
    <section className="relative bg-(--bpa-navy) text-white overflow-hidden">
      {/* Ambient green glow — top right */}
      <div
        className="absolute -top-48 -right-48 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(26,107,60,0.18) 0%, transparent 70%)' }}
      />
      {/* Fine grid texture */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-24 pb-20">
        {/* Live eyebrow pill */}
        <div className="inline-flex items-center gap-2.5 bg-white/[0.06] border border-white/[0.10] rounded-full px-4 py-1.5 mb-10">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className={`ping-dot absolute inset-0 rounded-full ${settings.active ? 'text-(--bpa-green)' : 'text-red-400'}`} />
            <span className={`relative w-2 h-2 rounded-full ${settings.active ? 'bg-(--bpa-green)' : 'bg-red-400'}`} />
          </span>
          <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-[0.18em]">
            BPA Pet Census 2026 — {settings.status.replace('_', ' ')}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
          <div className="max-w-3xl">
            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-[0.92] mb-5">
              <span className="block text-white text-3xl sm:text-4xl lg:text-5xl mb-2 opacity-60">Every pet</span>
              <span className="block text-(--bpa-green)">{settings.title.split('—')[0].trim()}</span>
            </h1>

            {/* Bengali sub-headline */}
            <p className="text-xl sm:text-2xl text-gray-500 font-light tracking-wide mb-6">
              পেট সেন্সাস ২০২৬ — আপনার প্রাণীর তথ্য দিন
            </p>

            {/* Supporting statement */}
            <p className="text-lg text-gray-400 max-w-lg leading-relaxed mb-8">
              {settings.description || 'BPA is building a data-driven map of pet ownership in Dhaka to plan 24/7 community clinics, vaccination drives, and emergency services where they are needed most.'}
            </p>
          </div>

          {timeLeft && (
            <div className="lg:mb-12 shrink-0">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-(--bpa-green) mb-4">
                  <Clock size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">Time Remaining</span>
                </div>
                <div className="flex gap-4">
                  {[
                    { label: 'Days', value: timeLeft.d },
                    { label: 'Hrs', value: timeLeft.h },
                    { label: 'Min', value: timeLeft.m },
                    { label: 'Sec', value: timeLeft.s },
                  ].map((unit) => (
                    <div key={unit.label} className="text-center">
                      <div className="text-3xl font-black tabular-nums">{unit.value.toString().padStart(2, '0')}</div>
                      <div className="text-[10px] uppercase text-gray-500 font-bold mt-1">{unit.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instrument panel — KPI stats */}
        <div className="grid grid-cols-3 gap-px bg-white/[0.08] rounded-2xl overflow-hidden mb-12 border border-white/[0.08]">
          {kpis.map(({ icon: Icon, value, label, labelBn }) => (
            <div
              key={label}
              className="bg-(--bpa-navy) hover:bg-[#1f2d50] transition-colors duration-200 p-3 sm:p-6 lg:p-7 flex flex-col items-center text-center"
            >
              <Icon size={15} className="text-(--bpa-green) mb-2 sm:mb-4 opacity-60" />
              <div className="text-lg sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-none break-all">
                {value}
              </div>
              <div className="text-[9px] sm:text-xs font-medium text-gray-400 mt-1 sm:mt-2 leading-tight uppercase tracking-wider">{label}</div>
              <div className="hidden sm:block text-[10px] text-gray-600 mt-1">{labelBn}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-500 bg-white/5 border border-white/10 rounded-xl p-4 max-w-xl">
          <Info size={18} className="shrink-0 text-(--bpa-green)" />
          <p>
            Your participation helps us allocate veterinary resources across Dhaka&apos;s 8 zones.
            This form is for census purposes only.
          </p>
        </div>
      </div>

      {/* Bottom separator line */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
    </section>
  );
}
