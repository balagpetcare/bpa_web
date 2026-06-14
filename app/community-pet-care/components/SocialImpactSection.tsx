import { Dog, Home, Utensils, Syringe, HeartHandshake, HandCoins, BookOpen } from 'lucide-react';
import type { SocialImpactProgram } from '@/types/bpa.types';

const FALLBACK_PROGRAMS = [
  {
    icon: Dog,
    titleEn: 'Stray Animal Treatment',
    titleBn: 'পথ প্রাণীর চিকিৎসা',
    descriptionEn: 'Free or subsidised treatment for injured and sick stray animals in BPA clinic zones.',
  },
  {
    icon: Home,
    titleEn: 'Shelter Support',
    titleBn: 'আশ্রয়কেন্দ্র সহায়তা',
    descriptionEn: 'Funding and veterinary support for registered animal shelters operating in BPA zones.',
  },
  {
    icon: Utensils,
    titleEn: 'Feeding Programs',
    titleBn: 'খাদ্য সরবরাহ কর্মসূচি',
    descriptionEn: 'Regular community feeding drives for stray cats and dogs across active BPA zones.',
  },
  {
    icon: Syringe,
    titleEn: 'Vaccination Campaigns',
    titleBn: 'টিকাদান অভিযান',
    descriptionEn: 'Mass rabies and core vaccine campaigns for owned and stray animals in underserved areas.',
  },
  {
    icon: HeartHandshake,
    titleEn: 'Rescue & Rehabilitation',
    titleBn: 'উদ্ধার ও পুনর্বাসন',
    descriptionEn: 'Organised rescue operations, emergency medical care, and adoption facilitation.',
  },
  {
    icon: HandCoins,
    titleEn: 'Low-Income Owner Support',
    titleBn: 'স্বল্প আয়ের মালিক সহায়তা',
    descriptionEn: 'Subsidised veterinary care and medicine for pet owners from low-income households.',
  },
  {
    icon: BookOpen,
    titleEn: 'Animal Welfare Education',
    titleBn: 'পশু কল্যাণ শিক্ষা',
    descriptionEn: 'School workshops, community sessions, and online resources on responsible pet ownership.',
  },
];

interface Props {
  programs: SocialImpactProgram[];
}

export default function SocialImpactSection({ programs }: Props) {
  const items =
    programs.length > 0
      ? programs.map((p) => ({
          icon: null as null,
          titleEn: p.titleEn,
          titleBn: p.titleBn,
          descriptionEn: p.descriptionEn ?? '',
        }))
      : FALLBACK_PROGRAMS;

  return (
    <section className="relative py-24 bg-[#0a1628] text-white overflow-hidden">
      {/* Radial ambient glow — top left */}
      <div
        className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(26,107,60,0.14) 0%, transparent 65%)' }}
      />
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

        {/* Two-column header */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-end mb-16">
          <div>
            <p className="text-xs font-bold text-(--bpa-green) uppercase tracking-[0.18em] mb-5">
              Community Impact
            </p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.0]">
              Beyond your<br />own pet.
            </h2>
            <p className="text-2xl sm:text-3xl text-white/20 font-light tracking-wide mt-4 leading-snug">
              আপনার পোষাপ্রাণীর বাইরেও।
            </p>
          </div>
          <div className="space-y-4">
            <p className="text-lg text-white/60 leading-relaxed">
              Every ৳3,000 contribution flows back into the wider community — funding
              programmes that protect, treat, and support animals and owners who need it most.
            </p>
            <p className="text-base text-white/30 leading-relaxed">
              প্রতিটি ৳৩,০০০ অবদান বৃহত্তর সম্প্রদায়ে ফিরে যায় — যারা সবচেয়ে বেশি
              প্রয়োজন তাদের সুরক্ষা, চিকিৎসা ও সহায়তার জন্য।
            </p>
          </div>
        </div>

        {/* Programs grid — 3-col desktop, 2-col tablet, 1-col mobile */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
          {items.map((item, i) => {
            const Icon = (item as typeof FALLBACK_PROGRAMS[0]).icon ?? null;
            return (
              <div
                key={i}
                className="group relative flex flex-col p-6 rounded-2xl border border-white/[0.07] hover:border-white/[0.18] bg-white/[0.025] hover:bg-white/[0.055] transition-all duration-250 hover:-translate-y-0.5"
              >
                {/* Corner number */}
                <span className="absolute top-5 right-5 text-xs font-mono text-white/[0.10] select-none">
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* Icon circle */}
                {Icon && (
                  <div className="w-12 h-12 bg-white/[0.06] group-hover:bg-(--bpa-green)/20 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-250 shrink-0">
                    <Icon size={22} className="text-(--bpa-green) opacity-85" />
                  </div>
                )}

                {/* Content */}
                <h3 className="text-base font-bold text-white leading-snug mb-1">
                  {item.titleEn}
                </h3>
                <p className="text-sm text-white/30 mb-3 leading-relaxed">
                  {item.titleBn}
                </p>
                <p className="text-sm text-white/50 leading-relaxed">
                  {item.descriptionEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
