import { Zap, Syringe, Heart, Clock } from 'lucide-react';
import SectionCard from './SectionCard';
import type { DashboardImpact, AchievementBadge } from '../types';

interface Props {
  impact: DashboardImpact;
}

function BadgeCard({ badge }: { badge: AchievementBadge }) {
  return (
    <div
      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
        badge.earned
          ? 'border-(--bpa-green)/30 bg-(--bpa-green-light) shadow-sm'
          : 'border-gray-100 bg-gray-50 opacity-40 grayscale'
      }`}
    >
      <span className="text-2xl">{badge.icon}</span>
      <p className={`text-[10px] font-semibold leading-tight ${badge.earned ? 'text-(--bpa-navy)' : 'text-gray-400'}`}>
        {badge.title}
      </p>
      {badge.earned && badge.earnedAt && (
        <p className="text-[9px] text-(--bpa-green)/70 leading-none">
          {new Date(badge.earnedAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
        </p>
      )}
    </div>
  );
}

export default function ImpactSection({ impact }: Props) {
  const stats = [
    { label: 'Vaccinated Pets', value: impact.vaccinatedPets, icon: <Syringe className="w-4 h-4" />, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Animals Supported', value: impact.supportedAnimals, icon: <Heart className="w-4 h-4" />, color: 'text-rose-600 bg-rose-50' },
    { label: 'Volunteer Hours', value: impact.volunteerHours, icon: <Clock className="w-4 h-4" />, color: 'text-blue-600 bg-blue-50' },
    { label: 'Impact Score', value: impact.impactScore, icon: <Zap className="w-4 h-4" />, color: 'text-indigo-600 bg-indigo-50' },
  ];

  const earnedCount = impact.badges.filter((b) => b.earned).length;

  return (
    <SectionCard
      title="Social Impact & Achievements"
      subtitle={`${earnedCount} of ${impact.badges.length} badges earned`}
      icon={<Zap className="w-4 h-4" />}
    >
      <div className="space-y-5">
        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-gray-50 rounded-xl p-3 flex flex-col gap-1.5">
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </span>
              <p className="text-lg font-bold text-(--bpa-navy) leading-none">{stat.value}</p>
              <p className="text-[10px] text-gray-400 leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Achievement Badges</p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {impact.badges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
