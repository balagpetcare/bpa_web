import LinkButton from '@/components/ui/LinkButton';
import { formatMoney } from '@/lib/utils/format';
import { buildBookingHref, getLifecycleBadge, getNotBookableReason } from '@/lib/spay-neuter/offer-detail';
import type { SpayOfferLifecycleState, SpayServiceChoice } from '@/lib/api/spay-neuter';
import { ShieldCheck, Clock } from 'lucide-react';

interface BookingSummaryCardProps {
  offerId: string;
  serviceChoices: SpayServiceChoice[];
  bookable: boolean;
  lifecycleState: SpayOfferLifecycleState;
}

/**
 * The sticky booking card — lives in the right-hand column on desktop
 * (`sticky top-24`, so it scrolls with the page and stops naturally at the
 * end of its own grid column rather than overlapping the footer; no
 * position: fixed involved). Shows both available services side by side
 * since no single service is "selected" yet at this stage — the actual
 * exactly-one-service choice happens on the booking page itself and is
 * re-validated there and by the API.
 */
export default function BookingSummaryCard({ offerId, serviceChoices, bookable, lifecycleState }: BookingSummaryCardProps) {
  const badge = getLifecycleBadge(lifecycleState);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-(--bpa-navy) px-6 py-5">
        <p className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-3">Pricing</p>
        <div className="space-y-3">
          {serviceChoices.map((choice) => (
            <div key={choice.code} className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-bold">{choice.displayName}</p>
                <p className="text-white/50 text-xs">{formatMoney(choice.remainingAmount)} due at clinic</p>
              </div>
              <p className="text-white font-extrabold">{formatMoney(choice.totalAmount)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between">
          <span className="text-white/70 text-xs">Online advance (either service)</span>
          <span className="text-white font-bold text-sm">{formatMoney(serviceChoices[0]?.advanceAmount ?? 500)}</span>
        </div>
      </div>

      <div className="p-5 space-y-3">
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${badge.className}`}>
          {badge.label}
        </span>

        {bookable ? (
          <LinkButton href={buildBookingHref(offerId)} className="w-full mt-1">
            Book Appointment
          </LinkButton>
        ) : (
          <div className="w-full text-center bg-gray-100 text-gray-500 font-semibold text-sm px-4 py-3.5 rounded-xl">
            {getNotBookableReason(lifecycleState)}
          </div>
        )}

        <p className="text-xs text-gray-400 flex items-center justify-center gap-1.5 pt-1">
          <ShieldCheck size={12} className="text-(--bpa-green)" /> Secure online advance payment
        </p>
        <p className="text-xs text-gray-400 flex items-center justify-center gap-1.5">
          <Clock size={11} /> Bookings are shown in Asia/Dhaka time
        </p>
      </div>
    </div>
  );
}
