import Link from 'next/link';
import { FileText } from 'lucide-react';

export default function TransparencyTeaserSection() {
  return (
    <section className="py-12 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <FileText size={24} className="text-(--bpa-green)" />
            </div>
            <div>
              <p className="text-sm font-semibold text-(--bpa-green) uppercase tracking-wide mb-1">
                Fund Transparency
              </p>
              <h2 className="text-2xl font-bold text-(--bpa-navy)">Community Care Fund progress and reports</h2>
              <p className="text-sm text-gray-500 leading-relaxed mt-2 max-w-2xl">
                BPA publishes Care Partner contribution progress and manual transparency reports.
                Contributions are not investment, shares, or profit-sharing.
              </p>
            </div>
          </div>
          <Link
            href="/transparency"
            className="inline-flex items-center justify-center rounded-lg border border-(--bpa-green) px-5 py-3 text-sm font-semibold text-(--bpa-green) hover:bg-green-50"
          >
            View Transparency
          </Link>
        </div>
      </div>
    </section>
  );
}
