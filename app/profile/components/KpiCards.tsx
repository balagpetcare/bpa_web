import { PawPrint, Calendar, TrendingUp, Award, Heart, Zap } from 'lucide-react';
import type { DashboardKpi, MembershipStatus } from '../types';

interface Props {
  kpi: DashboardKpi;
}

function statusLabel(s: MembershipStatus) {
  const map: Record<MembershipStatus, string> = {
    active: 'Active',
    expired: 'Expired',
    pending: 'Pending',
    none: 'Not a Member',
  };
  return map[s];
}

function statusColor(s: MembershipStatus) {
  if (s === 'active') return 'text-emerald-600';
  if (s === 'expired') return 'text-red-500';
  if (s === 'pending') return 'text-amber-600';
  return 'text-gray-400';
}

interface KpiConfig {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  accent: string;
  valueClass?: string;
}

export default function KpiCards({ kpi }: Props) {
  const cards: KpiConfig[] = [
    {
      label: 'Membership',
      value: statusLabel(kpi.membershipStatus),
      icon: <Heart className="w-5 h-5" />,
      accent: 'bg-(--bpa-green-light) text-(--bpa-green)',
      valueClass: statusColor(kpi.membershipStatus),
    },
    {
      label: 'My Pets',
      value: kpi.totalPets,
      subtext: kpi.totalPets === 1 ? 'pet registered' : 'pets registered',
      icon: <PawPrint className="w-5 h-5" />,
      accent: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Active Bookings',
      value: kpi.activeBookings,
      subtext: kpi.activeBookings === 1 ? 'campaign booking' : 'campaign bookings',
      icon: <Calendar className="w-5 h-5" />,
      accent: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Contributions',
      value: `৳${kpi.totalContributions.toLocaleString('en-IN')}`,
      subtext: 'total contributed',
      icon: <TrendingUp className="w-5 h-5" />,
      accent: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Certificates',
      value: kpi.certificates,
      subtext: kpi.certificates === 1 ? 'certificate issued' : 'certificates issued',
      icon: <Award className="w-5 h-5" />,
      accent: 'bg-rose-50 text-rose-600',
    },
    {
      label: 'Impact Score',
      value: kpi.impactScore,
      subtext: 'community points',
      icon: <Zap className="w-5 h-5" />,
      accent: 'bg-indigo-50 text-indigo-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2"
        >
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.accent}`}>
            {card.icon}
          </div>
          <div>
            <p className={`text-xl font-bold leading-tight ${card.valueClass ?? 'text-(--bpa-navy)'}`}>
              {card.value}
            </p>
            <p className="text-xs text-gray-500 font-medium mt-0.5 leading-snug">{card.label}</p>
            {card.subtext && <p className="text-[10px] text-gray-400 leading-snug">{card.subtext}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
