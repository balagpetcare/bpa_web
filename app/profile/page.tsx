'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchDashboard } from '@/lib/api/me';
import { adaptDashboard } from './adapters';
import DashboardSkeleton from './components/DashboardSkeleton';
import ProfileHeroCard from './components/ProfileHeroCard';
import KpiCards from './components/KpiCards';
import MembershipSection from './components/MembershipSection';
import PetsSection from './components/PetsSection';
import BookingsSection from './components/BookingsSection';
import ContributionsSection from './components/ContributionsSection';
import CarePartnerSection from './components/CarePartnerSection';
import ImpactSection from './components/ImpactSection';
import DocumentsSection from './components/DocumentsSection';
import NotificationsSection from './components/NotificationsSection';
import TransparencySection from './components/TransparencySection';
import ActivityTimeline from './components/ActivityTimeline';
import type { DashboardData } from './types';

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setDataLoading(true);
    setError(null);
    try {
      const res = await fetchDashboard();
      if (res.success && res.data) {
        setData(adaptDashboard(res.data));
      } else {
        setError('Failed to load dashboard data.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/sign-in?next=/profile');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      loadDashboard();
    }
  }, [user, loadDashboard]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-(--bpa-navy)" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f0f4f8 0%, #ffffff 300px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Profile Hero ─────────────────────────────────── */}
        <ProfileHeroCard
          user={user}
          data={{
            profileCompletion: data?.profileCompletion ?? 25,
            joinedAt: data?.joinedAt ?? new Date().toISOString(),
            kpi: data?.kpi ?? {
              membershipStatus: 'none',
              totalPets: 0,
              activeBookings: 0,
              totalContributions: 0,
              certificates: 0,
              impactScore: 0,
            },
            membership: data?.membership ?? null,
          }}
          onLogout={logout}
        />

        {dataLoading ? (
          <DashboardSkeleton />
        ) : error ? (
          <div className="rounded-2xl bg-white border border-red-100 shadow-sm p-8 text-center">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-800 mb-1">Failed to load dashboard</h3>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button
              onClick={loadDashboard}
              className="inline-flex items-center gap-2 px-4 py-2 bg-(--bpa-navy) text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
          </div>
        ) : data ? (
          <>
            {/* ── KPI Summary Cards ─────────────────────────── */}
            <KpiCards kpi={data.kpi} />

            {/* ── Main Content Grid ─────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left / Main column */}
              <div className="lg:col-span-2 space-y-6">
                <MembershipSection membership={data.membership} />
                <PetsSection pets={data.pets} />
                <BookingsSection bookings={data.bookings} />
                <ContributionsSection contributions={data.contributions} />
                <ImpactSection impact={data.impact} />
                <DocumentsSection documents={data.documents} />
              </div>

              {/* Right / Sidebar */}
              <div className="space-y-6">
                <CarePartnerSection careCard={data.careCard} />
                <NotificationsSection notifications={data.notifications} />
                <TransparencySection data={data.transparency} />
                <ActivityTimeline activities={data.activity} />
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
