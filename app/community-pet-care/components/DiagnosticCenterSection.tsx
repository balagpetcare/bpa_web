import React from 'react';
import {
  Droplets, FlaskConical, Microscope, ScanLine, Activity,
  HeartPulse, Brain, Stethoscope, TestTube,
} from 'lucide-react';
import type { DiagnosticCenterService } from '@/types/bpa.types';

type Category = 'LAB' | 'IMAGING' | 'SPECIALIST' | 'EMERGENCY' | 'FUTURE_TECH';

const FALLBACK_SERVICES: {
  icon: React.ComponentType<{ size: number; className?: string }>;
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  category: Category;
}[] = [
  { icon: Droplets,     titleEn: 'Blood Tests',              titleBn: 'রক্ত পরীক্ষা',            descriptionEn: 'CBC, biochemistry, and specialised blood panels.',                         category: 'LAB' },
  { icon: FlaskConical, titleEn: 'Urine Analysis',           titleBn: 'প্রস্রাব বিশ্লেষণ',        descriptionEn: 'Complete urinalysis and sediment examination.',                            category: 'LAB' },
  { icon: Microscope,   titleEn: 'Fecal Testing',            titleBn: 'মল পরীক্ষা',               descriptionEn: 'Parasite detection, culture, and sensitivity.',                            category: 'LAB' },
  { icon: TestTube,     titleEn: 'Branch Sample Collection', titleBn: 'শাখায় নমুনা সংগ্রহ',       descriptionEn: 'Sample pick-up from any BPA community clinic, processed centrally.',        category: 'LAB' },
  { icon: ScanLine,     titleEn: 'Digital X-Ray',            titleBn: 'ডিজিটাল এক্স-রে',          descriptionEn: 'High-resolution digital radiography with rapid expert reporting.',          category: 'IMAGING' },
  { icon: Activity,     titleEn: 'Ultrasound',               titleBn: 'আলট্রাসাউন্ড',             descriptionEn: 'Abdominal and soft tissue ultrasound imaging.',                            category: 'IMAGING' },
  { icon: HeartPulse,   titleEn: 'Echocardiography',        titleBn: 'ইকোকার্ডিওগ্রাফি',         descriptionEn: 'Cardiac function assessment and heart disease screening.',                  category: 'IMAGING' },
  { icon: Stethoscope,  titleEn: 'Specialist Reporting',     titleBn: 'বিশেষজ্ঞ রিপোর্টিং',       descriptionEn: 'Board-certified specialist interpretation of all imaging and lab results.',  category: 'SPECIALIST' },
  { icon: Brain,        titleEn: 'CT / MRI',                titleBn: 'সিটি / এমআরআই',            descriptionEn: 'Advanced cross-sectional imaging — planned for Phase 3 of the programme.', category: 'FUTURE_TECH' },
];

const GROUPS: {
  category: Category;
  labelEn: string;
  labelBn: string;
  accent: string;
  headerBg: string;
  headerBorder: string;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    category: 'LAB',
    labelEn: 'Laboratory Services',
    labelBn: 'পরীক্ষাগার সেবা',
    accent: 'text-blue-700',
    headerBg: 'bg-blue-50',
    headerBorder: 'border-blue-100',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    category: 'IMAGING',
    labelEn: 'Imaging Services',
    labelBn: 'ইমেজিং সেবা',
    accent: 'text-violet-700',
    headerBg: 'bg-violet-50',
    headerBorder: 'border-violet-100',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
  },
  {
    category: 'SPECIALIST',
    labelEn: 'Specialist Services',
    labelBn: 'বিশেষজ্ঞ সেবা',
    accent: 'text-(--bpa-green)',
    headerBg: 'bg-(--bpa-green-light)',
    headerBorder: 'border-green-100',
    iconBg: 'bg-green-100',
    iconColor: 'text-(--bpa-green)',
  },
  {
    category: 'FUTURE_TECH',
    labelEn: 'Coming in Phase 3',
    labelBn: 'তৃতীয় পর্যায়ে আসছে',
    accent: 'text-amber-700',
    headerBg: 'bg-amber-50',
    headerBorder: 'border-amber-100',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
];

interface Props {
  services: DiagnosticCenterService[];
}

export default function DiagnosticCenterSection({ services }: Props) {
  const all =
    services.length > 0
      ? services.map((s) => ({
          icon: null as null,
          titleEn: s.titleEn,
          titleBn: s.titleBn,
          descriptionEn: s.descriptionEn ?? '',
          category: s.category as Category,
        }))
      : FALLBACK_SERVICES;

  return (
    <section className="py-24 bg-[#f8f9fb]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

        {/* Header */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-end mb-16">
          <div>
            <p className="text-xs font-bold text-(--bpa-green) uppercase tracking-[0.18em] mb-5">
              Central Diagnostic Center
            </p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-(--bpa-navy) leading-[1.0]">
              National diagnostic<br />infrastructure.
            </h2>
            <p className="text-2xl text-gray-400 font-light tracking-wide mt-4">
              কেন্দ্রীয় ডায়াগনস্টিক সেন্টার ভবিষ্যৎ পরিকল্পনা
            </p>
          </div>
          <div>
            <p className="text-lg text-gray-500 leading-relaxed">
              BPA&apos;s roadmap includes a state-of-the-art central diagnostic centre serving all
              community clinic zones — bringing specialist-grade diagnostics to Bangladesh&apos;s pet
              owners for the first time.
            </p>
          </div>
        </div>

        {/* Grouped infrastructure panels */}
        <div className="space-y-6">
          {GROUPS.map(({ category, labelEn, labelBn, accent, headerBg, headerBorder, iconBg, iconColor }) => {
            const group = all.filter((s) => s.category === category);
            if (group.length === 0) return null;

            return (
              <div
                key={category}
                className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm"
              >
                {/* Group header bar */}
                <div className={`flex items-center gap-4 px-6 py-5 border-b ${headerBorder} ${headerBg}`}>
                  <div>
                    <span className={`text-sm font-black uppercase tracking-[0.14em] ${accent}`}>
                      {labelEn}
                    </span>
                    <span className={`ml-3 text-sm font-medium ${accent} opacity-60`}>
                      {labelBn}
                    </span>
                  </div>
                  {category === 'FUTURE_TECH' && (
                    <span className="ml-auto text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full uppercase tracking-wide">
                      Roadmap
                    </span>
                  )}
                  <span className="ml-auto text-xs text-gray-400 font-medium">
                    {group.length} {group.length === 1 ? 'service' : 'services'}
                  </span>
                </div>

                {/* Service cards grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {group.map((svc, i) => {
                    const Icon = (svc as typeof FALLBACK_SERVICES[0]).icon ?? null;
                    return (
                      <div
                        key={i}
                        className="p-6 border-b border-r border-gray-100 hover:bg-gray-50/70 transition-colors last:border-r-0"
                      >
                        {/* Icon circle */}
                        {Icon && (
                          <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center mb-4`}>
                            <Icon size={20} className={iconColor} />
                          </div>
                        )}

                        <h3 className="text-base font-bold text-(--bpa-navy) leading-snug">
                          {svc.titleEn}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1 mb-3 leading-snug">
                          {svc.titleBn}
                        </p>
                        <p className="text-sm text-gray-500 leading-relaxed">
                          {svc.descriptionEn}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
