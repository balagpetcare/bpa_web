import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import type { RoadmapItem } from '@/types/bpa.types';

type RoadmapStatus = 'PLANNED' | 'IN_PROGRESS' | 'LIVE';

interface PhaseGroup {
  phase: number;
  labelEn: string;
  labelBn: string;
  status: RoadmapStatus;
  items: { titleEn: string; titleBn: string; descriptionEn: string; status: RoadmapStatus }[];
}

const FALLBACK_PHASES: PhaseGroup[] = [
  {
    phase: 1,
    labelEn: 'Foundation',
    labelBn: 'ভিত্তি স্থাপন',
    status: 'LIVE',
    items: [
      { titleEn: 'Programme Launch',   titleBn: 'কর্মসূচি চালু',        descriptionEn: 'Community Pet Care officially launched, contributions open across Dhaka zones.', status: 'LIVE' },
      { titleEn: 'Digital Care Cards', titleBn: 'ডিজিটাল কেয়ার কার্ড',  descriptionEn: 'QR-verified Care Partner cards issued to founding contributors.',               status: 'LIVE' },
      { titleEn: 'Zone Registry',      titleBn: 'জোন নিবন্ধন',           descriptionEn: 'All 8 target zones formally registered and zone administrators assigned.',       status: 'LIVE' },
    ],
  },
  {
    phase: 2,
    labelEn: 'Clinic Build-Out',
    labelBn: 'ক্লিনিক নির্মাণ',
    status: 'IN_PROGRESS',
    items: [
      { titleEn: 'First Community Clinic',  titleBn: 'প্রথম কমিউনিটি ক্লিনিক',       descriptionEn: 'First fully-funded zone clinic procured, fitted, and staffed.',           status: 'IN_PROGRESS' },
      { titleEn: 'Partner Vet Network',     titleBn: 'অংশীদার ভেটেরিনারি নেটওয়ার্ক', descriptionEn: 'Verified partner veterinarians onboarded across zone clinics.',         status: 'IN_PROGRESS' },
      { titleEn: 'Supply Chain',            titleBn: 'সাপ্লাই চেইন',                  descriptionEn: 'Centralised medicine and supply procurement to reduce per-zone costs.',  status: 'PLANNED' },
    ],
  },
  {
    phase: 3,
    labelEn: 'Diagnostic Hub',
    labelBn: 'ডায়াগনস্টিক হাব',
    status: 'PLANNED',
    items: [
      { titleEn: 'Central Lab & Imaging', titleBn: 'কেন্দ্রীয় ল্যাব ও ইমেজিং', descriptionEn: 'State-of-the-art diagnostic laboratory and digital imaging centre.',          status: 'PLANNED' },
      { titleEn: 'Sample Network',        titleBn: 'নমুনা নেটওয়ার্ক',            descriptionEn: 'Cold-chain sample pick-up from all community clinics.',                       status: 'PLANNED' },
      { titleEn: 'Specialist Reporting',  titleBn: 'বিশেষজ্ঞ রিপোর্টিং',          descriptionEn: 'Board-certified specialists providing same-day reports for all tests.',       status: 'PLANNED' },
    ],
  },
  {
    phase: 4,
    labelEn: 'National Scale',
    labelBn: 'জাতীয় সম্প্রসারণ',
    status: 'PLANNED',
    items: [
      { titleEn: 'All 8 Zones Active',    titleBn: 'সকল ৮টি জোন সক্রিয়',        descriptionEn: 'Every zone reaches full funding and opens its 24/7 community clinic.',      status: 'PLANNED' },
      { titleEn: 'Mobile Outreach Units', titleBn: 'মোবাইল আউটরিচ ইউনিট',        descriptionEn: 'Outreach mobile units for underserved neighbourhoods within each zone.',     status: 'PLANNED' },
      { titleEn: 'National Welfare Fund', titleBn: 'জাতীয় পশু কল্যাণ তহবিল',    descriptionEn: 'Surplus contributions channelled into a permanent national welfare fund.',   status: 'PLANNED' },
    ],
  },
];

const STATUS_CONFIG: Record<RoadmapStatus, {
  Icon: React.ComponentType<{ size: number; className?: string }>;
  dotClass: string;
  pillLabel: string;
  pillClass: string;
  ringClass: string;
  iconClass: string;
  connectorClass: string;
}> = {
  LIVE: {
    Icon: CheckCircle2,
    dotClass: 'bg-(--bpa-green)',
    pillLabel: 'Live',
    pillClass: 'bg-green-900/50 text-green-400 border border-green-800/60',
    ringClass: 'border-2 border-(--bpa-green) bg-(--bpa-green)',
    iconClass: 'text-white',
    connectorClass: 'bg-(--bpa-green)',
  },
  IN_PROGRESS: {
    Icon: Clock,
    dotClass: 'bg-amber-400',
    pillLabel: 'In Progress',
    pillClass: 'bg-amber-900/40 text-amber-400 border border-amber-700/50',
    ringClass: 'border-2 border-amber-400 bg-[#0a1628]',
    iconClass: 'text-amber-400',
    connectorClass: 'bg-white/[0.12]',
  },
  PLANNED: {
    Icon: Circle,
    dotClass: 'bg-white/[0.15]',
    pillLabel: 'Planned',
    pillClass: 'bg-white/[0.06] text-white/40 border border-white/[0.10]',
    ringClass: 'border-2 border-white/[0.15] bg-[#0a1628]',
    iconClass: 'text-white/25',
    connectorClass: 'bg-white/[0.08]',
  },
};

function derivePhaseStatus(items: { status: RoadmapStatus }[]): RoadmapStatus {
  if (items.every((i) => i.status === 'LIVE')) return 'LIVE';
  if (items.some((i) => i.status === 'LIVE' || i.status === 'IN_PROGRESS')) return 'IN_PROGRESS';
  return 'PLANNED';
}

interface Props { items: RoadmapItem[] }

export default function RoadmapSection({ items }: Props) {
  let phases: PhaseGroup[];

  if (items.length > 0) {
    const map: Record<number, PhaseGroup> = {};
    for (const item of items) {
      const p = (item as RoadmapItem & { phase?: number }).phase ?? 1;
      if (!map[p]) {
        map[p] = { phase: p, labelEn: `Phase ${p}`, labelBn: `পর্যায় ${p}`, status: 'PLANNED', items: [] };
      }
      map[p].items.push({
        titleEn: item.titleEn,
        titleBn: item.titleBn,
        descriptionEn: item.descriptionEn ?? '',
        status: (item.status as RoadmapStatus) ?? 'PLANNED',
      });
    }
    phases = Object.values(map).sort((a, b) => a.phase - b.phase);
    phases.forEach((p) => { p.status = derivePhaseStatus(p.items); });
  } else {
    phases = FALLBACK_PHASES;
  }

  return (
    <section className="py-24 bg-(--bpa-navy) text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

        {/* Header */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-end mb-20">
          <div>
            <p className="text-xs font-bold text-(--bpa-green) uppercase tracking-[0.18em] mb-5">
              Programme Roadmap
            </p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.0]">
              Where we are<br />going.
            </h2>
            <p className="text-2xl text-white/20 font-light tracking-wide mt-4">
              আমাদের ভবিষ্যৎ পরিকল্পনা
            </p>
          </div>
          <p className="text-lg text-white/50 leading-relaxed">
            Four phases, clear milestones, full transparency on what your contribution
            builds — from programme launch to a national 24/7 pet healthcare network.
          </p>
        </div>

        {/* ─── DESKTOP TIMELINE (lg+) ─────────────────────────────── */}
        <div className="hidden lg:block">
          {/* Phase header row — circles + connector */}
          <div className="relative flex items-start mb-10">
            {/* Connector line behind circles */}
            <div className="absolute top-7 left-7 right-7 h-px bg-white/[0.08] z-0" />

            {phases.map((phase, idx) => {
              const cfg = STATUS_CONFIG[phase.status];
              const PhaseIcon = cfg.Icon;
              return (
                <div key={phase.phase} className="relative flex-1 flex flex-col items-start z-10">
                  {/* Number circle */}
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${cfg.ringClass}`}>
                    <PhaseIcon size={22} className={cfg.iconClass} />
                  </div>

                  {/* Phase label */}
                  <div className="mt-4 pr-4">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white/30">
                        Phase {phase.phase}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${cfg.pillClass}`}>
                        {cfg.pillLabel}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-white leading-tight">
                      {phase.labelEn}
                    </h3>
                    <p className="text-sm text-white/30 mt-0.5">{phase.labelBn}</p>
                  </div>

                  {/* Left border progress line to next (visual connector below circle) */}
                  {idx < phases.length - 1 && (
                    <div className="absolute top-7 left-14 right-0 h-px z-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Milestone cards row */}
          <div className="grid grid-cols-4 gap-6">
            {phases.map((phase) => {
              return (
                <div key={phase.phase} className="space-y-3">
                  {phase.items.map((item, j) => {
                    const iCfg = STATUS_CONFIG[item.status];
                    return (
                      <div
                        key={j}
                        className="p-5 rounded-xl border border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.055] hover:border-white/[0.14] transition-all duration-200"
                      >
                        <div className="flex items-start gap-3">
                          <span className={`w-2 h-2 rounded-full shrink-0 mt-2 ${iCfg.dotClass}`} />
                          <div>
                            <p className="text-[15px] font-bold text-white leading-snug">
                              {item.titleEn}
                            </p>
                            <p className="text-sm text-white/30 mt-0.5 mb-2 leading-snug">
                              {item.titleBn}
                            </p>
                            <p className="text-sm text-white/45 leading-relaxed">
                              {item.descriptionEn}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── MOBILE / TABLET TIMELINE (< lg) ────────────────────── */}
        <div className="lg:hidden space-y-0">
          {phases.map((phase, phaseIdx) => {
            const cfg = STATUS_CONFIG[phase.status];
            const PhaseIcon = cfg.Icon;
            const isLast = phaseIdx === phases.length - 1;

            return (
              <div key={phase.phase} className="relative flex gap-5">
                {/* Left column: circle + vertical line */}
                <div className="flex flex-col items-center shrink-0 pt-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${cfg.ringClass} z-10`}>
                    <PhaseIcon size={18} className={cfg.iconClass} />
                  </div>
                  {!isLast && (
                    <div className="w-px flex-1 bg-white/[0.08] mt-2 mb-0" />
                  )}
                </div>

                {/* Right column: content */}
                <div className={`flex-1 pb-10 ${isLast ? 'pb-0' : ''}`}>
                  <div className="flex items-center gap-2 flex-wrap mb-1 pt-2">
                    <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white/30">
                      Phase {phase.phase}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${cfg.pillClass}`}>
                      {cfg.pillLabel}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white leading-tight mb-0.5">
                    {phase.labelEn}
                  </h3>
                  <p className="text-sm text-white/30 mb-5">{phase.labelBn}</p>

                  <div className="space-y-3">
                    {phase.items.map((item, j) => {
                      const iCfg = STATUS_CONFIG[item.status];
                      return (
                        <div
                          key={j}
                          className="p-5 rounded-xl border border-white/[0.07] bg-white/[0.025]"
                        >
                          <div className="flex items-start gap-3">
                            <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${iCfg.dotClass}`} />
                            <div>
                              <p className="text-[15px] font-bold text-white leading-snug">
                                {item.titleEn}
                              </p>
                              <p className="text-sm text-white/30 mt-0.5 mb-2">
                                {item.titleBn}
                              </p>
                              <p className="text-sm text-white/45 leading-relaxed">
                                {item.descriptionEn}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
