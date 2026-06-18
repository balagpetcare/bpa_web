import Link from 'next/link';
import { TrendingUp, Plus, ChevronRight, CheckCircle, Clock, XCircle } from 'lucide-react';
import SectionCard from './SectionCard';
import EmptyState from './EmptyState';
import type { DashboardContribution, ContributionStatus } from '../types';

interface Props {
  contributions: DashboardContribution[];
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function StatusPill({ status }: { status: ContributionStatus }) {
  const map: Record<ContributionStatus, { label: string; cls: string; icon: React.ReactNode }> = {
    paid: { label: 'Confirmed', cls: 'bg-emerald-50 text-emerald-700', icon: <CheckCircle className="w-3 h-3" /> },
    pending_payment: { label: 'Pending', cls: 'bg-amber-50 text-amber-700', icon: <Clock className="w-3 h-3" /> },
    refunded: { label: 'Refunded', cls: 'bg-blue-50 text-blue-700', icon: <ChevronRight className="w-3 h-3" /> },
    cancelled: { label: 'Cancelled', cls: 'bg-red-50 text-red-600', icon: <XCircle className="w-3 h-3" /> },
  };
  const { label, cls, icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cls}`}>
      {icon} {label}
    </span>
  );
}

export default function ContributionsSection({ contributions }: Props) {
  const totalPaid = contributions.filter((c) => c.status === 'paid').reduce((sum, c) => sum + c.amountBdt, 0);
  const pendingCount = contributions.filter((c) => c.status === 'pending_payment').length;
  const confirmedCount = contributions.filter((c) => c.status === 'paid').length;

  return (
    <SectionCard
      title="Contributions & Impact Wallet"
      subtitle="Your financial support history"
      icon={<TrendingUp className="w-4 h-4" />}
      action={
        <Link
          href="/community-pet-care/contribute"
          className="inline-flex items-center gap-1 text-xs font-semibold text-(--bpa-green) hover:underline"
        >
          <Plus className="w-3.5 h-3.5" /> Contribute
        </Link>
      }
    >
      {contributions.length === 0 ? (
        <EmptyState
          icon={<TrendingUp className="w-6 h-6" />}
          title="No contributions yet"
          description="Support BPA's community pet care fund to see your impact here."
          action={
            <Link
              href="/community-pet-care/contribute"
              className="inline-flex items-center px-4 py-2 bg-(--bpa-green) text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Make a Contribution
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {/* Summary row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-base font-bold text-(--bpa-navy)">৳{totalPaid.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Total Contributed</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-base font-bold text-emerald-700">{confirmedCount}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Confirmed</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <p className="text-base font-bold text-amber-700">{pendingCount}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Pending</p>
            </div>
          </div>

          {/* Recent contributions */}
          <div className="space-y-2">
            {contributions.slice(0, 3).map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-2 py-2.5 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-(--bpa-navy) truncate">{c.planTitle}</p>
                  <p className="text-xs text-gray-400">{c.zoneName} · {formatDate(c.createdAt)}</p>
                  <p className="text-[10px] text-gray-300 font-mono">{c.contributionNumber}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-(--bpa-navy)">৳{c.amountBdt.toLocaleString('en-IN')}</p>
                  <StatusPill status={c.status} />
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/community-pet-care/contribute"
            className="flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-semibold text-white bg-(--bpa-green) rounded-xl hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" /> Contribute Again
          </Link>
        </div>
      )}
    </SectionCard>
  );
}
