import {
  Calendar,
  CreditCard,
  CheckCircle,
  Syringe,
  FileText,
  Heart,
  TrendingUp,
} from 'lucide-react';
import SectionCard from './SectionCard';
import EmptyState from './EmptyState';
import type { ActivityItem, ActivityType } from '../types';

interface Props {
  activities: ActivityItem[];
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

const ACTIVITY_CONFIG: Record<ActivityType, { icon: React.ReactNode; color: string }> = {
  campaign_registered: { icon: <Calendar className="w-3.5 h-3.5" />, color: 'bg-purple-100 text-purple-600' },
  payment_submitted: { icon: <CreditCard className="w-3.5 h-3.5" />, color: 'bg-amber-100 text-amber-600' },
  payment_verified: { icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'bg-emerald-100 text-emerald-600' },
  pet_vaccinated: { icon: <Syringe className="w-3.5 h-3.5" />, color: 'bg-blue-100 text-blue-600' },
  certificate_issued: { icon: <FileText className="w-3.5 h-3.5" />, color: 'bg-(--bpa-green-light) text-(--bpa-green)' },
  membership_purchased: { icon: <Heart className="w-3.5 h-3.5" />, color: 'bg-rose-100 text-rose-600' },
  donation_made: { icon: <TrendingUp className="w-3.5 h-3.5" />, color: 'bg-indigo-100 text-indigo-600' },
};

function ActivityRow({ item, isLast }: { item: ActivityItem; isLast: boolean }) {
  const { icon, color } = ACTIVITY_CONFIG[item.type] ?? { icon: <Calendar className="w-3.5 h-3.5" />, color: 'bg-gray-100 text-gray-500' };
  return (
    <div className="flex gap-3">
      {/* Timeline spine */}
      <div className="flex flex-col items-center shrink-0">
        <span className={`w-7 h-7 rounded-full flex items-center justify-center ${color}`}>{icon}</span>
        {!isLast && <div className="w-px flex-1 bg-gray-100 mt-1" />}
      </div>

      {/* Content */}
      <div className={`pb-4 flex-1 min-w-0 ${isLast ? '' : ''}`}>
        <p className="text-sm font-semibold text-(--bpa-navy) leading-tight">{item.title}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-snug">{item.description}</p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-[10px] text-gray-300">{timeAgo(item.createdAt)}</p>
          {item.referenceNumber && (
            <p className="text-[10px] font-mono text-gray-300">{item.referenceNumber}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ActivityTimeline({ activities }: Props) {
  return (
    <SectionCard
      title="Recent Activity"
      subtitle="Your BPA journey timeline"
      icon={<Calendar className="w-4 h-4" />}
    >
      {activities.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-6 h-6" />}
          title="No activity yet"
          description="Your registrations, payments, and campaign activities will appear here."
        />
      ) : (
        <div className="pt-1">
          {activities.map((item, i) => (
            <ActivityRow key={item.id} item={item} isLast={i === activities.length - 1} />
          ))}
        </div>
      )}
    </SectionCard>
  );
}
