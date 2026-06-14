import Link from 'next/link';
import { FileText, TrendingUp, Building2, ArrowRight } from 'lucide-react';

const LINKS = [
  {
    icon: FileText,
    labelEn: 'Fund Reports',
    labelBn: 'তহবিল প্রতিবেদন',
    desc: 'Quarterly collection and spending statements.',
    href: '/transparency',
  },
  {
    icon: TrendingUp,
    labelEn: 'Spending Updates',
    labelBn: 'ব্যয় আপডেট',
    desc: 'How every taka is allocated across programme categories.',
    href: '/transparency',
  },
  {
    icon: Building2,
    labelEn: 'Clinic Progress',
    labelBn: 'ক্লিনিক অগ্রগতি',
    desc: 'Construction and operational status per zone.',
    href: '/community-pet-care/zones',
  },
];

export default function TransparencyStrip() {
  return (
    <section className="py-16 border-y border-gray-100 bg-[#f8f9fb]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-10 items-center">

          {/* Left label */}
          <div>
            <p className="text-xs font-bold text-(--bpa-green) uppercase tracking-[0.18em] mb-3">
              Full Transparency
            </p>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-(--bpa-navy) leading-tight">
              Track every taka.
            </h2>
            <p className="text-base text-gray-400 font-light mt-2">
              প্রতিটি টাকার হিসাব — স্বচ্ছভাবে।
            </p>
          </div>

          {/* Link cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            {LINKS.map(({ icon: Icon, labelEn, labelBn, desc, href }) => (
              <Link
                key={labelEn}
                href={href}
                className="group flex flex-col gap-3 p-5 bg-white rounded-2xl border border-gray-100 hover:border-(--bpa-green) hover:shadow-md hover:shadow-green-900/5 transition-all duration-200"
              >
                <div className="w-9 h-9 bg-(--bpa-green-light) group-hover:bg-(--bpa-green) rounded-xl flex items-center justify-center transition-colors duration-200">
                  <Icon size={17} className="text-(--bpa-green) group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-(--bpa-navy) text-sm leading-tight">{labelEn}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{labelBn}</p>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">{desc}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-(--bpa-green) opacity-0 group-hover:opacity-100 transition-opacity">
                  View <ArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
