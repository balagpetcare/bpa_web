'use client';

import { useState } from 'react';
import { Heart, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Props {
  title?: string;
  purposeId?: string;
  campaignId?: string;
  presetAmounts?: number[];
  className?: string;
}

const DEFAULT_AMOUNTS = [100, 500, 1000, 5000];

export default function DonationMiniCard({
  title = 'Support BPA Animals',
  purposeId,
  campaignId,
  presetAmounts = DEFAULT_AMOUNTS,
  className = '',
}: Props) {
  const [selected, setSelected] = useState(presetAmounts[1] ?? 500);

  const params = new URLSearchParams();
  params.set('amount', String(selected));
  if (purposeId) params.set('purpose', purposeId);
  if (campaignId) params.set('campaign', campaignId);
  const href = `/donate?${params}#donate-form`;

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Heart size={18} className="text-(--bpa-green) fill-current shrink-0" />
        <h3 className="font-bold text-(--bpa-navy) text-sm">{title}</h3>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {presetAmounts.map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => setSelected(amt)}
            className={`py-2 text-sm font-bold rounded-xl border transition-all ${
              selected === amt
                ? 'bg-(--bpa-green) border-(--bpa-green) text-white shadow-sm'
                : 'border-gray-200 text-gray-600 hover:border-(--bpa-green) hover:text-(--bpa-green)'
            }`}
          >
            ৳{amt.toLocaleString()}
          </button>
        ))}
      </div>

      <Link
        href={href}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-(--bpa-navy) text-white text-sm font-bold hover:opacity-90 transition-all"
      >
        Donate ৳{selected.toLocaleString()}
        <ArrowRight size={14} />
      </Link>

      <p className="text-center text-[11px] text-gray-400 mt-3">
        Secure · Official BPA receipt provided
      </p>
    </div>
  );
}
