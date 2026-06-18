import { DonorWallEntry } from '@/lib/api/donations';
import { User, MessageCircle, Heart } from 'lucide-react';

interface DonorWallProps {
  donors: DonorWallEntry[];
  title?: string;
  /** Compact mode: smaller cards, no message, tighter layout */
  compact?: boolean;
  limit?: number;
}

export default function DonorWall({
  donors,
  title = 'Donor Wall',
  compact = false,
  limit,
}: DonorWallProps) {
  const visible = limit ? donors.slice(0, limit) : donors;
  if (visible.length === 0) return null;

  if (compact) {
    return (
      <div className="space-y-3">
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-(--bpa-navy) flex items-center gap-1.5">
              <Heart size={14} className="text-(--bpa-green) fill-current" />
              {title}
            </h3>
            <span className="text-xs text-gray-400">{donors.length} donors</span>
          </div>
        )}
        {visible.map((donor) => (
          <div key={donor.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <User size={13} className="text-gray-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-(--bpa-navy)">
                  {donor.isAnonymous ? 'Anonymous Kind Donor' : donor.donorName}
                </p>
                <p className="text-[10px] text-gray-400">
                  {new Date(donor.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-(--bpa-green)">৳{Number(donor.amount).toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-(--bpa-navy)">{title}</h2>
        <span className="text-sm text-gray-500">{donors.length} recent donations</span>
      </div>

      <div className="grid gap-4">
        {visible.map((donor) => (
          <div key={donor.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <User size={20} className="text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <h3 className="font-bold text-(--bpa-navy)">
                    {donor.isAnonymous ? 'Anonymous Kind Donor' : donor.donorName}
                  </h3>
                  <span className="text-sm font-bold text-(--bpa-green)">
                    ৳{Number(donor.amount).toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400 mb-2">
                  <span>{new Date(donor.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  {donor.campaign && (
                    <span className="bg-blue-50 text-blue-600 px-2 rounded-full">{donor.campaign.titleEn}</span>
                  )}
                  {donor.purpose && (
                    <span className="bg-green-50 text-green-600 px-2 rounded-full">{donor.purpose.titleEn}</span>
                  )}
                </div>

                {donor.message && (
                  <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg text-sm text-gray-600 italic">
                    <MessageCircle size={14} className="mt-1 shrink-0 text-gray-400" />
                    <p>{donor.message}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
