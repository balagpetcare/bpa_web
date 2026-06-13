import type { Metadata } from 'next';
import Breadcrumb from '@/components/ui/Breadcrumb';
import SectionHeader from '@/components/ui/SectionHeader';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import { buildMetadata } from '@/lib/seo';
import { getSeoData } from '@/lib/api/seo';
import { CheckCircle, ArrowRight } from 'lucide-react';
import CtaSection from '@/components/sections/CtaSection';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData('/vision');
  return buildMetadata(
    {
      title: 'Our Vision',
      description: "BPA's vision for a Bangladesh where every animal lives in safety and dignity — and our long-term roadmap to get there.",
    },
    seo,
  );
}

const ROADMAP = [
  {
    phase: 'Phase 1',
    years: '2016 – 2020',
    title: 'Foundation',
    status: 'completed',
    items: [
      'Establish national organisation and governance structure',
      'Launch membership programme and district chapters',
      'Host inaugural national pet welfare conference',
      'Build first online community platform',
    ],
  },
  {
    phase: 'Phase 2',
    years: '2021 – 2024',
    title: 'Growth & Advocacy',
    status: 'completed',
    items: [
      'Expand to all 64 districts',
      'Submit national animal welfare bill proposals',
      'Launch certified pet owner training programme',
      'Partner with 10+ veterinary institutions',
    ],
  },
  {
    phase: 'Phase 3',
    years: '2025 – 2027',
    title: 'Infrastructure',
    status: 'current',
    items: [
      'Establish BPA-accredited rescue centres in 8 major cities',
      'Launch national pet microchipping and registration database',
      'Introduce international veterinary exchange programme',
      'Create BPA Animal Welfare Foundation fund',
    ],
  },
  {
    phase: 'Phase 4',
    years: '2028 – 2030',
    title: 'Transformation',
    status: 'upcoming',
    items: [
      'Achieve comprehensive national animal welfare legislation',
      'Establish Bangladesh as a regional leader in animal welfare',
      'Launch youth education programme in 500+ schools',
      '10,000 active BPA members nationwide',
    ],
  },
];

const VISION_PILLARS = [
  'A Bangladesh where every pet lives in a safe, loving home',
  'Nationwide awareness on responsible breeding and adoption',
  'Robust legislation that protects animals from all forms of cruelty',
  'An accessible veterinary network reaching every district',
  'Bangladesh recognised internationally for animal welfare standards',
  'A generation of children raised with compassion for all animals',
];

export default function VisionPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Our Vision', url: '/vision' }]} />

      {/* Page header */}
      <section className="bg-gray-50 border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Our Vision' }]} />
          <h1 className="mt-4 text-4xl font-bold text-(--bpa-navy)">Our Vision</h1>
          <p className="mt-3 text-lg text-gray-500 max-w-2xl">
            Where we are going — and how we plan to get there.
          </p>
        </div>
      </section>

      {/* Vision statement */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-(--bpa-green) text-sm font-semibold uppercase tracking-widest mb-4">Vision Statement</p>
              <blockquote className="text-3xl sm:text-4xl font-bold text-(--bpa-navy) leading-snug mb-6">
                &ldquo;A nation where compassion for animals is a cornerstone of society — and every pet has a loving, responsible home.&rdquo;
              </blockquote>
              <p className="text-gray-500 text-lg leading-relaxed">
                This is the Bangladesh we are working to build — one community programme, one policy advocacy effort, and one rescued animal at a time.
              </p>
            </div>
            <div className="bg-(--bpa-navy) rounded-3xl p-10">
              <p className="text-(--bpa-green) text-xs font-semibold uppercase tracking-widest mb-6">What We Envision</p>
              <ul className="space-y-4">
                {VISION_PILLARS.map((p) => (
                  <li key={p} className="flex gap-3 items-start text-sm text-gray-300 leading-relaxed">
                    <CheckCircle size={16} className="text-(--bpa-green) shrink-0 mt-0.5" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Long-Term Roadmap"
            title="Our Journey to 2030"
            subtitle="A phased approach that turns our vision into concrete, measurable outcomes."
            centered
          />
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ROADMAP.map((phase, i) => (
              <div
                key={phase.phase}
                className={[
                  'rounded-2xl p-6 border-2 relative',
                  phase.status === 'completed' ? 'border-(--bpa-green) bg-(--bpa-navy)' :
                  phase.status === 'current' ? 'border-(--bpa-green-light) bg-white shadow-md' :
                  'border-gray-200 bg-white',
                ].join(' ')}
              >
                {phase.status === 'current' && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-(--bpa-green) text-white text-xs px-3 py-0.5 rounded-full font-medium">
                    In Progress
                  </span>
                )}
                <div className="mb-4">
                  <span className={`text-xs font-bold uppercase tracking-wider ${phase.status === 'completed' ? 'text-(--bpa-green)' : 'text-gray-400'}`}>
                    {phase.phase}
                  </span>
                  <p className="text-xs text-gray-400 mt-0.5">{phase.years}</p>
                  <h3 className="font-bold text-(--bpa-navy) text-lg mt-2">{phase.title}</h3>
                </div>
                <ul className="space-y-2.5">
                  {phase.items.map((item) => (
                    <li key={item} className="flex gap-2 items-start text-xs text-gray-600 leading-relaxed">
                      {phase.status === 'completed' ? (
                        <CheckCircle size={12} className="text-(--bpa-green) shrink-0 mt-0.5" />
                      ) : (
                        <ArrowRight size={12} className="text-gray-300 shrink-0 mt-0.5" />
                      )}
                      {item}
                    </li>
                  ))}
                </ul>
                {i < ROADMAP.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 text-gray-300">
                    <ArrowRight size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
