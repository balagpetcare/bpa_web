'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2, KeyRound, LogOut, CheckCircle } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import type { DashboardData } from '../types';

interface Props {
  user: { id: string; name: string; email: string | null; phone: string | null; avatarUrl: string | null; role: string };
  data: Pick<DashboardData, 'profileCompletion' | 'joinedAt' | 'kpi' | 'membership'>;
  onLogout: () => Promise<void>;
}

function formatJoined(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export default function ProfileHeroCard({ user, data, onLogout }: Props) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await onLogout();
      router.push('/');
    } finally {
      setLoggingOut(false);
    }
  };

  const memberId = `#${user.id.slice(0, 8).toUpperCase()}`;
  const completion = data.profileCompletion;
  const memberStatus = data.kpi.membershipStatus;

  const statusColor =
    memberStatus === 'active'
      ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30'
      : memberStatus === 'expired'
        ? 'bg-red-400/20 text-red-200 border border-red-400/30'
        : memberStatus === 'pending'
          ? 'bg-yellow-400/20 text-yellow-200 border border-yellow-400/30'
          : 'bg-white/10 text-white/70 border border-white/20';

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-xl">
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, #1a2540 0%, #2a3a60 50%, #1a6b3c 100%)' }}
      />
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      <div className="relative p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="ring-4 ring-white/20 rounded-full">
              <Avatar src={user.avatarUrl} name={user.name} size={88} />
            </div>
            {memberStatus === 'active' && (
              <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center border-2 border-white">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
              </span>
            )}
          </div>

          {/* Identity */}
          <div className="flex-1 min-w-0 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold leading-tight truncate">{user.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide shrink-0 ${statusColor}`}>
                {memberStatus === 'active' ? 'Active Member' : memberStatus === 'none' ? user.role : memberStatus}
              </span>
              {data.membership?.tier && data.membership.tier !== 'None' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-200 border border-amber-400/30 shrink-0">
                  {data.membership.tier}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-white/70 text-sm mt-1">
              {user.email && <span>{user.email}</span>}
              {user.phone && <span>{user.phone}</span>}
              <span className="font-mono text-white/50">{memberId}</span>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-white/50 text-xs mt-1.5">
              <span>Joined {formatJoined(data.joinedAt)}</span>
              <span>Role: {user.role}</span>
            </div>
          </div>
        </div>

        {/* Profile completion bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-white/60 mb-1.5">
            <span>Profile Completion</span>
            <span className="font-semibold text-white">{completion}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${completion}%` }}
            />
          </div>
          {completion < 100 && (
            <p className="text-xs text-white/40 mt-1">
              Add your {!user.phone ? 'phone number' : !user.email ? 'email address' : 'avatar'} to complete your profile
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mt-5">
          <button
            onClick={() => router.push('/profile/edit')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg border border-white/20 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit Profile
          </button>
          <button
            onClick={() => router.push('/auth/change-password')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg border border-white/20 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" />
            Change Password
          </button>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 text-sm font-medium rounded-lg border border-red-400/20 transition-colors disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            {loggingOut ? 'Logging out…' : 'Logout'}
          </button>
        </div>
      </div>
    </div>
  );
}
