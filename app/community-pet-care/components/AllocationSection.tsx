import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

const ALLOCATIONS = [
  { labelEn: 'Clinic Operations',     labelBn: 'ক্লিনিক পরিচালনা',     pct: 40, color: 'bg-(--bpa-green)',  barText: 'text-white' },
  { labelEn: 'Medical Equipment',     labelBn: 'চিকিৎসা সরঞ্জাম',      pct: 25, color: 'bg-blue-500',       barText: 'text-white' },
  { labelEn: 'Welfare Programs',      labelBn: 'কল্যাণ কর্মসূচি',      pct: 15, color: 'bg-purple-500',     barText: 'text-white' },
  { labelEn: 'Vaccination Campaigns', labelBn: 'টিকাদান অভিযান',       pct: 10, color: 'bg-amber-400',      barText: 'text-gray-900' },
  { labelEn: 'Rescue & Emergency',    labelBn: 'উদ্ধার ও জরুরি সেবা',  pct:  5, color: 'bg-rose-400',       barText: 'text-white' },
  { labelEn: 'Technology & Admin',    labelBn: 'প্রযুক্তি ও প্রশাসন',  pct:  5, color: 'bg-gray-400',       barText: 'text-white' },
];

export default function AllocationSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

        {/* Header */}
        <div className="grid lg:grid-cols-2 gap-10 items-end mb-16">
          <div>
            <p className="text-xs font-bold text-(--bpa-green) uppercase tracking-[0.18em] mb-4">
              Fund Transparency
            </p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-(--bpa-navy) leading-tight">
              Where your<br />contribution goes.
            </h2>
            <p className="text-2xl text-gray-400 font-light tracking-wide mt-3">
              আপনার অবদান কোথায় যায়
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-base text-gray-500 leading-relaxed">
              Every taka contributed to BPA Community Pet Care is allocated across six verified
              spending categories. Actual expenditure is published quarterly.
            </p>
            <Link
              href="/transparency"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--bpa-green) hover:underline"
            >
              View full transparency reports <ExternalLink size={13} />
            </Link>
          </div>
        </div>

        {/* Stacked segmented bar */}
        <div className="mb-10">
          <div className="flex rounded-xl overflow-hidden h-10">
            {ALLOCATIONS.map(({ labelEn, pct, color }) => (
              <div
                key={labelEn}
                className={`${color} flex items-center justify-center transition-all`}
                style={{ width: `${pct}%` }}
                title={`${labelEn} — ${pct}%`}
              />
            ))}
          </div>
        </div>

        {/* Allocation rows */}
        <div className="space-y-3">
          {ALLOCATIONS.map(({ labelEn, labelBn, pct, color }) => (
            <div key={labelEn} className="grid grid-cols-[1fr_auto] items-center gap-4 group">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
                <div className="min-w-0">
                  <span className="font-semibold text-(--bpa-navy) text-sm">{labelEn}</span>
                  <span className="text-gray-400 text-xs ml-2">{labelBn}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                {/* Mini bar */}
                <div className="hidden sm:block w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-2xl font-black text-(--bpa-navy) w-14 text-right tracking-tight leading-none">
                  {pct}%
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-8 max-w-xl leading-relaxed">
          Allocation targets are indicative. Actual expenditure is reported quarterly in BPA
          transparency reports.{' '}
          <span className="text-gray-300">বরাদ্দের লক্ষ্যমাত্রা ইঙ্গিতমূলক। প্রকৃত ব্যয় ত্রৈমাসিক প্রতিবেদনে প্রকাশিত হয়।</span>
        </p>
      </div>
    </section>
  );
}
