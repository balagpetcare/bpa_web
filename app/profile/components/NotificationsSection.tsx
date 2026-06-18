import Link from 'next/link';
import { Bell, AlertCircle, Syringe, RotateCcw, FileText, Megaphone, ChevronRight } from 'lucide-react';
import SectionCard from './SectionCard';
import EmptyState from './EmptyState';
import type { DashboardNotification } from '../types';

interface Props {
  notifications: DashboardNotification[];
}

const NOTIF_ICONS: Record<DashboardNotification['type'], React.ReactNode> = {
  payment_pending: <AlertCircle className="w-4 h-4" />,
  vaccine_due: <Syringe className="w-4 h-4" />,
  membership_renewal: <RotateCcw className="w-4 h-4" />,
  certificate_ready: <FileText className="w-4 h-4" />,
  campaign_update: <Megaphone className="w-4 h-4" />,
};

const NOTIF_COLORS: Record<DashboardNotification['type'], string> = {
  payment_pending: 'bg-amber-50 text-amber-600',
  vaccine_due: 'bg-blue-50 text-blue-600',
  membership_renewal: 'bg-purple-50 text-purple-600',
  certificate_ready: 'bg-(--bpa-green-light) text-(--bpa-green)',
  campaign_update: 'bg-(--bpa-navy)/5 text-(--bpa-navy)',
};

function NotifRow({ notif }: { notif: DashboardNotification }) {
  const icon = NOTIF_ICONS[notif.type] ?? <Bell className="w-4 h-4" />;
  const colorCls = NOTIF_COLORS[notif.type] ?? 'bg-gray-50 text-gray-500';
  const isHighPriority = notif.priority === 'high';

  const content = (
    <div className={`flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0 ${isHighPriority ? 'opacity-100' : 'opacity-75'}`}>
      <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${colorCls}`}>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-(--bpa-navy) truncate">{notif.title}</p>
          {isHighPriority && <span className="w-1.5 h-1.5 rounded-full bg-(--bpa-green) shrink-0" />}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 leading-snug">{notif.message}</p>
        {notif.priority === 'high' && (
          <span className="inline-block mt-1 text-[10px] font-semibold text-red-500 uppercase tracking-wide">Action needed</span>
        )}
      </div>
      {notif.actionUrl && <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0 mt-1" />}
    </div>
  );

  if (notif.actionUrl) {
    return <Link href={notif.actionUrl}>{content}</Link>;
  }
  return content;
}

export default function NotificationsSection({ notifications }: Props) {
  const highPriorityCount = notifications.filter((n) => n.priority === 'high').length;

  return (
    <SectionCard
      title="Notifications"
      subtitle={highPriorityCount > 0 ? `${highPriorityCount} need attention` : 'All caught up'}
      icon={<Bell className="w-4 h-4" />}
    >
      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-6 h-6" />}
          title="No notifications"
          description="Updates about your membership, payments, and campaigns will appear here."
        />
      ) : (
        <div>
          {notifications.map((n) => (
            <NotifRow key={n.id} notif={n} />
          ))}
        </div>
      )}
    </SectionCard>
  );
}
