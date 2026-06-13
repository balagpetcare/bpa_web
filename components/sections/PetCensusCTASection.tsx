import Link from 'next/link';
import { ClipboardList } from 'lucide-react';

export default function PetCensusCTASection() {
  return (
    <section className="py-16 bg-(--bpa-green)">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <ClipboardList size={28} className="text-white" />
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-1">Pet Census 2026</h2>
              <p className="text-green-100 text-sm leading-relaxed max-w-lg">
                Register your pets to help BPA plan Community Pet Clinic capacity in your area.
                It takes less than 2 minutes.
              </p>
            </div>
          </div>
          <Link
            href="/pet-census-2026"
            className="inline-flex items-center gap-2 bg-white text-(--bpa-green) px-7 py-3.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors shrink-0"
          >
            Register Your Pets →
          </Link>
        </div>
      </div>
    </section>
  );
}
