interface Props {
  goal: number;
  raised: number;
  currency?: string;
  showLabels?: boolean;
  height?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function DonationProgressBar({
  goal,
  raised,
  currency = '৳',
  showLabels = true,
  height = 'md',
  className = '',
}: Props) {
  const progress = goal > 0 ? Math.min(Math.round((raised / goal) * 100), 100) : 0;

  const barH = height === 'sm' ? 'h-1.5' : height === 'lg' ? 'h-4' : 'h-2.5';

  return (
    <div className={className}>
      {showLabels && (
        <div className="flex items-end justify-between mb-2">
          <div>
            <span className="text-xl font-extrabold text-(--bpa-green)">
              {currency}{raised.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400 ml-1">raised</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Goal </span>
            <span className="text-sm font-bold text-gray-400">
              {currency}{goal.toLocaleString()}
            </span>
          </div>
        </div>
      )}
      <div className={`w-full ${barH} bg-gray-100 rounded-full overflow-hidden shadow-inner`}>
        <div
          className="h-full bg-gradient-to-r from-(--bpa-green) to-green-400 rounded-full transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
      {showLabels && (
        <p className="mt-1.5 text-xs font-bold text-(--bpa-navy)">{progress}% funded</p>
      )}
    </div>
  );
}
