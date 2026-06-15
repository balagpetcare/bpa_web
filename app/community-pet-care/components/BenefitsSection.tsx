import Link from 'next/link';
import {
  Siren, Building2, Tag, Zap, QrCode, Crown, Vote, CalendarDays,
} from 'lucide-react';
import type { CarePartnerBenefit } from '@/types/bpa.types';

const FALLBACK_BENEFITS = [
  {
    icon: Siren,
    titleEn: '24/7 Emergency Access',
    titleBn: 'জরুরি সেবায় ২৪/৭ প্রবেশাধিকার',
    descriptionEn: 'Priority access to emergency veterinary services at selected BPA branches around the clock.',
  },
  {
    icon: Building2,
    titleEn: 'All BPA Community Clinics',
    titleBn: 'সকল বিপিএ কমিউনিটি ক্লিনিক',
    descriptionEn: 'Service access across all BPA community clinics in your zone and partner districts.',
  },
  {
    icon: Tag,
    titleEn: '15%–30% Service Discount',
    titleBn: '১৫%–৩০% সেবা ছাড়',
    descriptionEn: 'Discounted veterinary services at BPA community clinics for the 5-year card validity period.',
  },
  {
    icon: Zap,
    titleEn: 'Priority Service',
    titleBn: 'অগ্রাধিকার সেবা',
    descriptionEn: 'Skip the general queue — Care Partners receive priority scheduling and faster appointments.',
  },
  {
    icon: QrCode,
    titleEn: 'Digital QR Partner Card',
    titleBn: 'ডিজিটাল কিউআর পার্টনার কার্ড',
    descriptionEn: 'A verifiable digital card with a unique QR code — proof of contribution and benefit access.',
  },
  {
    icon: Crown,
    titleEn: 'Premium Membership Pathway',
    titleBn: 'প্রিমিয়াম সদস্যপদ পথ',
    descriptionEn: 'Care Partners are eligible to apply for BPA Premium Membership — fast-track your association journey.',
  },
  {
    icon: Vote,
    titleEn: 'Voting Eligibility',
    titleBn: 'ভোটের যোগ্যতা',
    descriptionEn: 'If separately approved as a BPA member, Care Partners gain eligibility to participate in association votes.',
  },
  {
    icon: CalendarDays,
    titleEn: 'Events, Education & Community',
    titleBn: 'ইভেন্ট, শিক্ষা ও কমিউনিটি',
    descriptionEn: 'Invitations to BPA events, community care camps, welfare workshops, and educational programs.',
  },
];

interface Props {
  benefits: CarePartnerBenefit[];
}

export default function BenefitsSection({ benefits }: Props) {
  const items =
    benefits.length > 0
      ? benefits.map((b) => ({
          icon: null as null,
          titleEn: b.titleEn,
          titleBn: b.titleBn,
          descriptionEn: b.descriptionEn ?? '',
        }))
      : FALLBACK_BENEFITS;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <p className="text-xs font-bold text-(--bpa-green) uppercase tracking-[0.18em] mb-4">
            Card Benefits
          </p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-(--bpa-navy) leading-tight mb-4">
            What you unlock with a<br />BPA Community Care Partner Card.
          </h2>
          <p className="text-base text-gray-500 leading-relaxed">
            আপনার বেনিফিট যা পাবেন —{' '}
            <span className="text-gray-400">
              Your 5-year card membership unlocks service discounts, priority access, and more across BPA&apos;s growing care network.
            </span>
          </p>
        </div>

        {/* Benefits grid — 2-col on lg for breathing room, numbered */}
        <div className="grid lg:grid-cols-2 gap-4">
          {items.map((item, i) => {
            const Icon = (item as typeof FALLBACK_BENEFITS[0]).icon ?? null;
            const num = String(i + 1).padStart(2, '0');
            return (
              <div
                key={i}
                className="group flex gap-5 p-6 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-lg hover:shadow-green-900/5 hover:-translate-y-0.5 bg-white transition-all duration-200"
              >
                {/* Icon */}
                <div className="shrink-0 mt-0.5">
                  <div className="w-11 h-11 bg-(--bpa-green-light) group-hover:bg-(--bpa-green) rounded-xl flex items-center justify-center transition-colors duration-200">
                    {Icon ? (
                      <Icon size={20} className="text-(--bpa-green) group-hover:text-white transition-colors" />
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-(--bpa-green) group-hover:bg-white transition-colors" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-(--bpa-navy) text-base leading-tight">
                        {item.titleEn}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">{item.titleBn}</p>
                    </div>
                    <span className="text-xs font-mono text-gray-200 shrink-0 pt-0.5 select-none">
                      {num}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-3 leading-relaxed">{item.descriptionEn}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 pt-10 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <p className="text-sm text-gray-400 max-w-lg">
            All benefits are tied to your digital BPA Community Care Partner Card and valid for the full 5-year card membership period.
          </p>
          <Link
            href="/community-pet-care/contribute"
            className="inline-flex items-center gap-2 bg-(--bpa-green) text-white px-7 py-3 rounded-xl font-bold text-sm hover:bg-[#145530] transition-colors shrink-0"
          >
            Get Your Card
          </Link>
        </div>
      </div>
    </section>
  );
}
