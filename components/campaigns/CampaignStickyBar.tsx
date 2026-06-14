'use client';

import Link from 'next/link';

interface Props {
  slug: string;
  status: string;
  isFree: boolean;
  basePriceBdt: string;
  nextSessionDate: string | null;
  totalAvailable: number;
}

export default function CampaignStickyBar({ slug, status, isFree, basePriceBdt, nextSessionDate, totalAvailable }: Props) {
  const canRegister = status === 'registration_open';
  const canWaitlist = status === 'registration_open' || status === 'registration_closed';

  if (!canRegister && !canWaitlist) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden">
      <div className="bg-white border-t border-gray-200 shadow-2xl px-4 py-3 safe-area-pb">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 leading-none mb-0.5">
              {canRegister && totalAvailable > 0 ? `${totalAvailable} slots available` : canRegister ? 'Slots filling up' : 'Registration closed'}
            </p>
            <p className="font-bold text-(--bpa-green) text-base leading-none">
              {isFree ? 'Free' : `৳${Number(basePriceBdt).toLocaleString()} / pet`}
            </p>
            {nextSessionDate && (
              <p className="text-xs text-gray-400 mt-0.5">Next: {nextSessionDate}</p>
            )}
          </div>
          {canRegister && totalAvailable > 0 ? (
            <Link
              href={`/campaigns/${slug}/register`}
              className="shrink-0 bg-(--bpa-green) text-white font-bold text-sm px-5 py-3 rounded-xl hover:bg-(--color-bpa-green-dark) transition-colors active:scale-95"
            >
              Register Now
            </Link>
          ) : canWaitlist ? (
            <Link
              href={`/campaigns/${slug}/waitlist`}
              className="shrink-0 border-2 border-(--bpa-navy) text-(--bpa-green) font-bold text-sm px-5 py-3 rounded-xl hover:bg-(--bpa-green-light) transition-colors"
            >
              Join Waitlist
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
