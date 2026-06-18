import Link from 'next/link';
import { DonationCampaign } from '@/lib/api/donations';
import { Target, TrendingUp } from 'lucide-react';

interface DonationCampaignCardProps {
  campaign: DonationCampaign;
}

export default function DonationCampaignCard({ campaign }: DonationCampaignCardProps) {
  const goal = Number(campaign.goalAmount);
  const current = Number(campaign.raisedAmount);
  const progress = goal > 0 ? Math.min(Math.round((current / goal) * 100), 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="aspect-video relative overflow-hidden bg-gray-100">
        {campaign.featuredImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={campaign.featuredImageUrl}
            alt={campaign.titleEn}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Target size={48} />
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-sm text-(--bpa-navy) text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
            Campaign
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-(--bpa-navy) line-clamp-2 mb-2">
          {campaign.titleEn}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-3 mb-6 flex-1">
          {campaign.descriptionEn}
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-1.5 text-(--bpa-green) font-bold">
                <TrendingUp size={16} />
                <span className="text-xl">৳{current.toLocaleString()}</span>
              </div>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                Goal: ৳{goal.toLocaleString()}
              </span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-(--bpa-green) transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-gray-500">{progress}% Funded</span>
            </div>
          </div>

          <Link
            href={`/donate?campaign=${campaign.id}`}
            className="block w-full text-center bg-(--bpa-green) hover:bg-(--bpa-green-dark) text-white font-bold py-2.5 rounded-lg transition-colors"
          >
            Donate to this Campaign
          </Link>
        </div>
      </div>
    </div>
  );
}
