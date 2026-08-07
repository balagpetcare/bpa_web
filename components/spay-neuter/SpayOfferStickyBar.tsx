import Link from 'next/link';
import { buildBookingHref, getNotBookableReason } from '@/lib/spay-neuter/offer-detail';
import { formatMoney } from '@/lib/utils/format';
import type { SpayOfferLifecycleState, SpayServiceChoice } from '@/lib/api/spay-neuter';

interface SpayOfferStickyBarProps {
  offerId: string;
  serviceChoices: SpayServiceChoice[];
  bookable: boolean;
  lifecycleState: SpayOfferLifecycleState;
}

/** Mobile-only fixed bottom bar — mirrors CampaignStickyBar's exact convention so the two campaign types feel like one product, not a separate theme. */
export default function SpayOfferStickyBar({ offerId, serviceChoices, bookable, lifecycleState }: SpayOfferStickyBarProps) {
  const fromPrice = Math.min(...serviceChoices.map((c) => c.totalAmount));

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden">
      <div className="bg-white border-t border-gray-200 shadow-2xl px-4 py-3 safe-area-pb">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 leading-none mb-0.5">From</p>
            <p className="font-bold text-(--bpa-green) text-base leading-none">{formatMoney(fromPrice)}</p>
          </div>
          {bookable ? (
            <Link
              href={buildBookingHref(offerId)}
              className="shrink-0 bg-(--bpa-green) text-white font-bold text-sm px-5 py-3 rounded-xl hover:opacity-90 transition-opacity active:scale-95"
            >
              Book Appointment
            </Link>
          ) : (
            <span className="shrink-0 bg-gray-100 text-gray-400 font-semibold text-sm px-5 py-3 rounded-xl">
              {getNotBookableReason(lifecycleState)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
