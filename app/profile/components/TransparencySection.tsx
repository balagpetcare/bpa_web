import Link from 'next/link';
import { BarChart3, ExternalLink } from 'lucide-react';
import SectionCard from './SectionCard';
import type { TransparencyUpdate } from '../types';

interface Props {
  data: TransparencyUpdate;
}

function ProgressBar({ value, max, className = '' }: { value: number; max: number; className?: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={`h-2 bg-gray-100 rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-(--bpa-green) rounded-full transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function TransparencySection({ data }: Props) {
  const fundPct = Math.round((data.collectedBdt / data.totalFundBdt) * 100);
  const zonePct = Math.round((data.activeZones / data.totalZones) * 100);

  return (
    <SectionCard
      title="Transparency Updates"
      subtitle="Community fund & zone progress"
      icon={<BarChart3 className="w-4 h-4" />}
      action={
        <Link
          href="/transparency"
          className="inline-flex items-center gap-1 text-xs font-semibold text-(--bpa-green) hover:underline"
        >
          Full report <ExternalLink className="w-3 h-3" />
        </Link>
      }
    >
      <div className="space-y-5">
        {/* Fund progress */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-gray-700">Community Fund Progress</span>
            <span className="font-bold text-(--bpa-green)">{fundPct}%</span>
          </div>
          <ProgressBar value={data.collectedBdt} max={data.totalFundBdt} />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>৳{(data.collectedBdt / 1000000).toFixed(2)}M raised</span>
            <span>Goal: ৳{(data.totalFundBdt / 1000000).toFixed(0)}M</span>
          </div>
        </div>

        {/* Zone progress */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-gray-700">Active Zones</span>
            <span className="font-bold text-(--bpa-navy)">{data.activeZones} / {data.totalZones}</span>
          </div>
          <ProgressBar value={data.activeZones} max={data.totalZones} />
          <p className="text-[10px] text-gray-400 mt-1">{zonePct}% of planned zones are active</p>
        </div>

        <div className="text-[10px] text-gray-300 border-t border-gray-50 pt-3">
          Last updated {new Date(data.lastUpdated).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>
    </SectionCard>
  );
}
