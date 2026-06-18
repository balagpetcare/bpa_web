import Link from 'next/link';
import { CreditCard, ArrowUpCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import SectionCard from './SectionCard';
import EmptyState from './EmptyState';
import type { DashboardMembership } from '../types';

interface Props {
  membership: DashboardMembership | null;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function StatusPill({ status }: { status: DashboardMembership['status'] }) {
  if (status === 'active')
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
        <CheckCircle className="w-3 h-3" /> Active
      </span>
    );
  if (status === 'expired')
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600">
        <XCircle className="w-3 h-3" /> Expired
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
      <Clock className="w-3 h-3" /> Pending
    </span>
  );
}

export default function MembershipSection({ membership }: Props) {
  return (
    <SectionCard
      title="Membership"
      subtitle="Your BPA community membership"
      icon={<CreditCard className="w-4 h-4" />}
      action={
        <Link
          href="/community-pet-care/contribute"
          className="inline-flex items-center gap-1 text-xs font-semibold text-(--bpa-green) hover:underline"
        >
          <ArrowUpCircle className="w-3.5 h-3.5" />
          Upgrade
        </Link>
      }
    >
      {!membership || membership.status === 'none' ? (
        <EmptyState
          icon={<CreditCard className="w-6 h-6" />}
          title="No active membership"
          description="Join as a Care Partner to support community pet welfare."
          action={
            <Link
              href="/community-pet-care/contribute"
              className="inline-flex items-center px-4 py-2 bg-(--bpa-green) text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Become a Care Partner
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {/* Tier & Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-(--bpa-navy)">{membership.tier}</p>
              <p className="text-xs text-gray-400">{membership.memberNumber}</p>
            </div>
            <StatusPill status={membership.status} />
          </div>

          {/* Validity */}
          <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-3 text-xs">
            <div>
              <p className="text-gray-400 mb-0.5">Valid From</p>
              <p className="font-semibold text-gray-700">{formatDate(membership.validFrom)}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-0.5">Expires</p>
              <p className="font-semibold text-gray-700">{formatDate(membership.validUntil)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-400 mb-0.5">Zone Preference</p>
              <p className="font-semibold text-gray-700">{membership.zonePreference}</p>
            </div>
          </div>

          {/* Benefits */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Included Benefits</p>
            <ul className="space-y-1.5">
              {membership.benefits.map((b) => (
                <li key={b} className="flex items-start gap-2 text-xs text-gray-600">
                  <CheckCircle className="w-3.5 h-3.5 text-(--bpa-green) mt-0.5 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="flex gap-2 pt-1">
            <Link
              href="/community-pet-care/contribute"
              className="flex-1 text-center px-3 py-2 bg-(--bpa-green-light) text-(--bpa-green) text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Digital Card
            </Link>
            <Link
              href="/community-pet-care/contribute"
              className="flex-1 text-center px-3 py-2 bg-(--bpa-navy) text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Renew / Upgrade
            </Link>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
