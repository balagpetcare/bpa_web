import Link from 'next/link';
import { ShieldCheck, Download, ExternalLink, CheckCircle, XCircle, Clock } from 'lucide-react';
import SectionCard from './SectionCard';
import EmptyState from './EmptyState';
import type { DashboardCareCard, CareCardStatus } from '../types';

interface Props {
  careCard: DashboardCareCard | null;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function CardStatusPill({ status }: { status: CareCardStatus }) {
  const map: Record<CareCardStatus, { label: string; cls: string; icon: React.ReactNode }> = {
    active: { label: 'Active', cls: 'bg-emerald-50 text-emerald-700', icon: <CheckCircle className="w-3 h-3" /> },
    pending: { label: 'Pending Approval', cls: 'bg-amber-50 text-amber-700', icon: <Clock className="w-3 h-3" /> },
    expired: { label: 'Expired', cls: 'bg-red-50 text-red-600', icon: <XCircle className="w-3 h-3" /> },
    revoked: { label: 'Revoked', cls: 'bg-gray-100 text-gray-500', icon: <XCircle className="w-3 h-3" /> },
  };
  const { label, cls, icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {icon} {label}
    </span>
  );
}

export default function CarePartnerSection({ careCard }: Props) {
  return (
    <SectionCard
      title="Care Partner Card"
      subtitle="Your digital membership card"
      icon={<ShieldCheck className="w-4 h-4" />}
    >
      {!careCard ? (
        <EmptyState
          icon={<ShieldCheck className="w-6 h-6" />}
          title="No Care Partner Card yet"
          description="Become a Care Partner member to receive your digital card."
          action={
            <Link
              href="/community-pet-care/contribute"
              className="inline-flex items-center px-4 py-2 bg-(--bpa-green) text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Get Your Card
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {/* Card visual */}
          <div
            className="care-card-premium rounded-xl p-4 text-white relative"
            style={{ background: 'linear-gradient(135deg, #1a2540 0%, #2a3a60 60%, #1a6b3c 100%)' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold text-white/50 uppercase tracking-widest">Bangladesh Pet Alliance</p>
                <p className="text-base font-bold mt-0.5">{careCard.memberName}</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-white/20" />
            </div>
            <div className="mt-3 space-y-0.5">
              <p className="text-xs font-mono text-white/70">{careCard.cardNumber ?? careCard.cardId}</p>
              <p className="text-xs text-white/50">{careCard.zoneName}</p>
            </div>

            {/* QR placeholder */}
            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-[10px] text-white/50">Valid Until</p>
                <p className="text-xs font-semibold">{formatDate(careCard.expiresAt)}</p>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                <div className="grid grid-cols-3 gap-0.5">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-[1px]"
                      style={{ background: Math.random() > 0.4 ? 'rgba(255,255,255,0.8)' : 'transparent' }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center justify-between">
            <CardStatusPill status={careCard.status} />
            <p className="text-xs text-gray-400">Issued {formatDate(careCard.issuedAt)}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              disabled
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-(--bpa-green-light) text-(--bpa-green) text-xs font-semibold rounded-lg opacity-50 cursor-not-allowed"
              title="Download coming soon"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
            <Link
              href={careCard.verifyUrl ?? `/care-partner-card?id=${careCard.cardId}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-(--bpa-navy) text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Verify Card
            </Link>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
