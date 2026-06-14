import Link from 'next/link';
import { QrCode, ShieldCheck, ChevronRight, Check } from 'lucide-react';

const FEATURES = [
  { labelEn: 'QR-Verified Identity',  labelBn: 'কিউআর-যাচাইকৃত পরিচয়',  desc: 'Instantly verifiable at all BPA partner clinics via QR scan.' },
  { labelEn: '5-Year Validity',        labelBn: '৫ বছরের মেয়াদ',           desc: 'Card remains valid for 5 years from your contribution date.' },
  { labelEn: 'Unique Partner ID',      labelBn: 'অনন্য পার্টনার আইডি',    desc: 'BPA-CP-XXXXXX is your permanent care network identity.' },
  { labelEn: 'Zone-Linked Benefits',   labelBn: 'জোন-সংযুক্ত সুবিধা',     desc: 'Tied to your selected zone, honoured across BPA partner clinics.' },
];

export default function CardPreviewSection() {
  return (
    <section className="py-24 bg-[#f8f9fb]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

        {/* Header */}
        <div className="max-w-2xl mb-16">
          <p className="text-xs font-bold text-(--bpa-green) uppercase tracking-[0.18em] mb-4">
            Care Partner Card
          </p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-(--bpa-navy) leading-tight mb-4">
            Your digital membership<br />card.
          </h2>
          <p className="text-base text-gray-500 leading-relaxed">
            আপনার ডিজিটাল কেয়ার পার্টনার কার্ড —{' '}
            <span className="text-gray-400">proof of contribution, gateway to benefits.</span>
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-14 items-center">

          {/* Premium card mockup with shimmer */}
          <div className="shrink-0 w-full max-w-[420px]">
            <div
              className="care-card-premium relative rounded-3xl overflow-hidden shadow-2xl shadow-green-900/20 select-none"
              style={{
                background: 'linear-gradient(135deg, #1a2540 0%, #243058 40%, #1a6b3c 100%)',
                aspectRatio: '1.586',
              }}
            >
              {/* Decorative rings */}
              <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full border border-white/[0.04]" />
              <div className="absolute -top-8 -right-8  w-40 h-40 rounded-full border border-white/[0.06]" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/[0.02]" />

              {/* Card content */}
              <div className="relative h-full p-7 sm:p-8 flex flex-col justify-between">
                {/* Top */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[9px] font-black text-(--bpa-green) uppercase tracking-[0.22em]">
                      Bangladesh Pet Association
                    </p>
                    <p className="text-white font-black text-lg leading-tight mt-1 tracking-tight">
                      Community Care Partner
                    </p>
                    <p className="text-gray-500 text-[10px] mt-0.5 font-light">কমিউনিটি কেয়ার পার্টনার</p>
                  </div>
                  <ShieldCheck size={26} className="text-(--bpa-green) opacity-90 mt-0.5" />
                </div>

                {/* Holder */}
                <div>
                  <p className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.18em] mb-1">Card Holder</p>
                  <p className="text-white font-black text-xl tracking-wide">Your Name Here</p>
                  <p className="text-gray-500 text-xs mt-1">Zone: Dhaka Central · জোন: ঢাকা কেন্দ্র</p>
                </div>

                {/* Bottom */}
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.15em]">BPA Care Partner ID</p>
                    <p className="text-white font-mono text-sm tracking-[0.2em] mt-1">BPA-CP-XXXXXX</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-(--bpa-green)" />
                      <p className="text-[9px] text-gray-400 font-medium">Valid for 5 Years · ৫ বছরের জন্য বৈধ</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-2.5 flex flex-col items-center gap-1 shadow-lg">
                    <QrCode size={38} className="text-gray-800" />
                    <p className="text-[7px] font-black text-gray-500 uppercase tracking-wide">Scan to verify</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Caption below card */}
            <p className="text-center text-xs text-gray-400 mt-4">
              Sample card. Your details will appear upon contribution.
            </p>
          </div>

          {/* Features list */}
          <div className="flex-1 max-w-lg">
            <div className="space-y-4 mb-10">
              {FEATURES.map(({ labelEn, labelBn, desc }) => (
                <div key={labelEn} className="flex gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-sm transition-all">
                  <div className="w-7 h-7 rounded-full bg-(--bpa-green-light) flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="text-(--bpa-green)" strokeWidth={3} />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-bold text-(--bpa-navy) text-sm">{labelEn}</span>
                      <span className="text-gray-400 text-xs">{labelBn}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/community-pet-care/contribute"
                className="inline-flex items-center gap-2 bg-(--bpa-green) text-white px-7 py-3.5 rounded-xl font-bold text-sm hover:bg-[#145530] transition-colors shadow-lg shadow-green-900/20"
              >
                Get Your Card
                <ChevronRight size={16} />
              </Link>
              <Link
                href="/care-partner-card"
                className="inline-flex items-center gap-2 border border-gray-200 text-(--bpa-navy) px-7 py-3.5 rounded-xl font-bold text-sm hover:border-(--bpa-green) hover:text-(--bpa-green) transition-colors"
              >
                Verify a Card
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
