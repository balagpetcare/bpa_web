import Link from 'next/link';
import { CalendarDays, Syringe, Users } from 'lucide-react';
import type { CampaignListItem, CampaignStatus, CampaignType } from '@/types/bpa.types';
import { formatMoney, normalizeCampaignPricing, getCampaignMediaUrl } from '@/lib/utils/format';

const TYPE_LABELS: Record<CampaignType, string> = {
  vaccination: 'Vaccination',
  deworming: 'Deworming',
  microchip: 'Microchipping',
  health_camp: 'Health Camp',
  spay_neuter: 'Spay & Neuter',
};

const STATUS_CONFIG: Record<CampaignStatus, { label: string; className: string }> = {
  published: { label: 'Coming Soon', className: 'bg-blue-100 text-blue-800' },
  registration_open: { label: 'Open', className: 'bg-green-100 text-green-800' },
  registration_closed: { label: 'Closed', className: 'bg-orange-100 text-orange-800' },
  completed: { label: 'Completed', className: 'bg-gray-100 text-gray-600' },
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-500' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700' },
};

function formatDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  if (s.toDateString() === e.toDateString()) return s.toLocaleDateString('en-GB', opts);
  return `${s.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${e.toLocaleDateString('en-GB', opts)}`;
}

export default function CampaignCard({ campaign }: { campaign: CampaignListItem }) {
  const statusCfg = STATUS_CONFIG[campaign.status] ?? STATUS_CONFIG.published;
  const coverUrl = getCampaignMediaUrl(campaign);
  const { campaignFee, serviceTotal, savings, discountPercent, hasDiscount, isFree } =
    normalizeCampaignPricing(campaign);

  return (
    <Link href={`/campaigns/${campaign.slug}`} className="group block h-full">
      <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
        {/* Cover */}
        <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={campaign.coverImage?.altText ?? campaign.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-(--bpa-navy)/10 to-(--bpa-navy)/10 flex items-center justify-center">
              <Syringe size={32} className="text-(--bpa-green)" />
            </div>
          )}
          <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg.className}`}>
            {statusCfg.label}
          </span>
          {isFree && (
            <span className="absolute top-3 right-3 bg-(--bpa-green) text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              Free
            </span>
          )}
          {hasDiscount && !isFree && (
            <span className="absolute top-3 right-3 bg-amber-400 text-amber-950 text-xs font-bold px-2.5 py-1 rounded-full">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        <div className="p-5 flex flex-col flex-1">
          <span className="text-xs font-semibold text-(--bpa-navy) mb-1.5">
            {TYPE_LABELS[campaign.campaignType] ?? campaign.campaignType}
          </span>

          <h3 className="font-bold text-(--bpa-navy) mb-2 group-hover:text-(--bpa-green) transition-colors line-clamp-2 leading-snug">
            {campaign.title}
          </h3>

          {campaign.description && (
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4 flex-1">
              {campaign.description}
            </p>
          )}

          <div className="mt-auto space-y-1.5 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <CalendarDays size={12} />
              <span>{formatDateRange(campaign.startDate, campaign.endDate)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={12} />
              <span>{campaign._count?.sessions ?? 0} session{campaign._count?.sessions !== 1 ? 's' : ''}</span>
            </div>
            {!isFree && campaignFee > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {hasDiscount && (
                  <span className="line-through text-gray-300">{formatMoney(serviceTotal)}</span>
                )}
                <span className="font-bold text-(--bpa-navy)">{formatMoney(campaignFee)} / pet</span>
                {savings > 0 && (
                  <span className="text-emerald-600 font-semibold">Save {formatMoney(savings)}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
