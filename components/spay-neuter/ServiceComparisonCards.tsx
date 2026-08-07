import LinkButton from '@/components/ui/LinkButton';
import { formatMoney } from '@/lib/utils/format';
import { buildBookingHref } from '@/lib/spay-neuter/offer-detail';
import type { SpayServiceChoice } from '@/lib/api/spay-neuter';
import { Clock } from 'lucide-react';

interface ServiceComparisonCardsProps {
  offerId: string;
  serviceChoices: SpayServiceChoice[];
  bookable: boolean;
}

const CARD_META: Record<string, { forWhom: string; accent: string }> = {
  NEUTER: { forWhom: 'For a male cat', accent: 'border-blue-100' },
  SPAY: { forWhom: 'For a female cat', accent: 'border-pink-100' },
};

/**
 * SPAY and NEUTER are always rendered as two independent cards, each with
 * its own "Book" action — never a single combined card, never implying
 * both procedures apply to the same pet. All amounts come straight from
 * the API's server-computed serviceChoices; nothing here is a client-side
 * calculation.
 */
export default function ServiceComparisonCards({ offerId, serviceChoices, bookable }: ServiceComparisonCardsProps) {
  return (
    <div className="grid sm:grid-cols-2 gap-5">
      {serviceChoices.map((choice) => {
        const meta = CARD_META[choice.code] ?? { forWhom: '', accent: 'border-gray-100' };
        const canBook = bookable && choice.enabled;
        return (
          <div key={choice.code} className={`rounded-2xl border-2 ${meta.accent} bg-white p-6 flex flex-col`}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-extrabold text-(--bpa-navy)">{choice.displayName}</h3>
              <span className="text-sm text-gray-400" lang="bn">{choice.displayNameBn}</span>
            </div>
            {meta.forWhom && <p className="text-sm text-gray-500 mb-4">{meta.forWhom}</p>}

            <dl className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <dt className="text-gray-500">Total price</dt>
                <dd className="font-bold text-(--bpa-navy)">{formatMoney(choice.totalAmount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Online advance</dt>
                <dd className="font-semibold text-(--bpa-green)">{formatMoney(choice.advanceAmount)}</dd>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <dt className="text-gray-500">Due at clinic</dt>
                <dd className="font-semibold text-gray-700">{formatMoney(choice.remainingAmount)}</dd>
              </div>
            </dl>

            <p className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
              <Clock size={12} /> Approximately {choice.durationMinutes} minutes
            </p>

            <div className="mt-auto">
              {canBook ? (
                <LinkButton href={buildBookingHref(offerId, { service: choice.code })} className="w-full">
                  Book {choice.displayName}
                </LinkButton>
              ) : (
                <span className="block w-full text-center bg-gray-100 text-gray-400 font-semibold text-sm px-4 py-2.5 rounded-lg">
                  Not currently bookable
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
