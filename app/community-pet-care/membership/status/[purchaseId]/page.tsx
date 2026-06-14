import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, Clock, XCircle, AlertCircle, ArrowUpCircle, MapPin } from 'lucide-react';
import { getPurchaseStatus } from '@/lib/api/community-membership';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Membership Status — BPA Community Care',
  robots: { index: false },
};

interface Props {
  params: Promise<{ purchaseId: string }>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; Icon: typeof CheckCircle }> = {
    active: { label: 'Active', color: 'text-green-600 bg-green-50 border-green-200', Icon: CheckCircle },
    paid: { label: 'Paid — Activating', color: 'text-blue-600 bg-blue-50 border-blue-200', Icon: Clock },
    pending_payment: { label: 'Pending Payment', color: 'text-amber-600 bg-amber-50 border-amber-200', Icon: Clock },
    cancelled: { label: 'Cancelled', color: 'text-red-600 bg-red-50 border-red-200', Icon: XCircle },
    expired: { label: 'Expired', color: 'text-gray-500 bg-gray-50 border-gray-200', Icon: AlertCircle },
  };
  const cfg = map[status] ?? { label: status, color: 'text-gray-600 bg-gray-50 border-gray-200', Icon: AlertCircle };
  const { Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-semibold ${cfg.color}`}>
      <Icon size={14} /> {cfg.label}
    </span>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-BD', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default async function MembershipStatusPage({ params }: Props) {
  const { purchaseId } = await params;
  const purchase = await getPurchaseStatus(purchaseId).catch(() => null);

  if (!purchase) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <AlertCircle size={48} className="text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-(--bpa-navy) mb-2">Membership Not Found</h1>
        <p className="text-gray-500 max-w-sm">
          We could not find a membership record with that ID. Please check the link and try again.
        </p>
        <Link
          href="/community-pet-care"
          className="mt-6 inline-block text-(--bpa-green) hover:underline text-sm"
        >
          ← Back to Community Pet Care
        </Link>
      </div>
    );
  }

  const isPending = purchase.status === 'pending_payment';
  const isPaid = purchase.status === 'paid';
  const isActive = purchase.status === 'active';

  return (
    <>
      <section className="bg-gray-50 border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-400 mb-4 flex gap-2 items-center">
            <Link href="/" className="hover:text-(--bpa-green)">Home</Link>
            <span>/</span>
            <Link href="/community-pet-care" className="hover:text-(--bpa-green)">Community Pet Care</Link>
            <span>/</span>
            <span className="text-gray-600">Membership Status</span>
          </nav>
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-3xl font-bold text-(--bpa-navy)">Membership Status</h1>
            <StatusBadge status={purchase.status} />
          </div>
        </div>
      </section>

      <div className="py-12">
        <div className="max-w-xl mx-auto px-4 space-y-6">

          {/* Summary card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Member</p>
              <p className="font-semibold text-(--bpa-navy)">{purchase.memberName}</p>
            </div>
            {purchase.tierName && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Tier</p>
                <p className="font-semibold text-(--bpa-navy)">{purchase.tierName}</p>
              </div>
            )}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Amount</p>
              <p className="font-bold text-(--bpa-green) text-lg">৳{Number(purchase.amountBdt).toLocaleString()}</p>
            </div>
            {purchase.petLimit != null && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Pet Limit</p>
                <p className="font-semibold">{purchase.petLimit} pets</p>
              </div>
            )}
            {purchase.startsAt && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Starts</p>
                <p className="font-semibold">{formatDate(purchase.startsAt)}</p>
              </div>
            )}
            {purchase.expiresAt && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Expires</p>
                <p className="font-semibold">{formatDate(purchase.expiresAt)}</p>
              </div>
            )}
            {purchase.preferredZone && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin size={13} /> Preferred Zone
                </p>
                <p className="font-semibold text-(--bpa-navy)">
                  {purchase.preferredZone.name}
                  <span className="text-xs text-gray-400 font-normal ml-1">({purchase.preferredZone.city})</span>
                </p>
              </div>
            )}
          </div>

          {/* Pending purchase payment */}
          {isPending && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex gap-3">
                <Clock className="text-amber-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-semibold text-amber-800">Awaiting Payment Verification</p>
                  <p className="text-sm text-amber-700 mt-1">
                    If you have submitted your MFS transaction, our team will verify and activate your card within 24–48 hours.
                    Refresh this page to check for updates.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Paid — card being issued */}
          {isPaid && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <div className="flex gap-3">
                <Clock className="text-blue-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-semibold text-blue-800">Payment Confirmed — Card Being Issued</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Your payment has been confirmed. Your membership card is being generated and will be available shortly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pending upgrade */}
          {purchase.pendingUpgrade && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
              <div className="flex gap-3">
                <ArrowUpCircle className="text-purple-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-semibold text-purple-800">
                    Upgrade to {purchase.pendingUpgrade.toTierName} — Pending Verification
                  </p>
                  <p className="text-sm text-purple-700 mt-1">
                    Your upgrade payment of ৳{Number(purchase.pendingUpgrade.upgradeAmount).toLocaleString()} is under review.
                    Your membership will be upgraded within 24–48 hours after verification.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Card details if active */}
          {isActive && purchase.card && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-3">
              <div className="flex gap-3 items-start">
                <CheckCircle className="text-green-600 shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-semibold text-green-800">Membership Active!</p>
                  <p className="text-sm text-green-700 mt-0.5">Your membership card has been issued.</p>
                </div>
              </div>
              <div className="border-t border-green-200 pt-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Card Number</span>
                  <span className="font-mono font-bold text-(--bpa-navy)">{purchase.card.cardNumber}</span>
                </div>
                {purchase.card.downloadToken && purchase.card.pdfDocumentKey && (
                  <a
                    href={`/api/membership/card/download?token=${purchase.card.downloadToken}`}
                    className="mt-2 block text-center w-full px-4 py-2.5 bg-(--bpa-green) text-white font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download Membership Card (PDF)
                  </a>
                )}
              </div>
            </div>
          )}

          {isActive && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-(--bpa-navy)">Want more pet slots or benefits?</p>
                <p className="text-xs text-gray-500 mt-0.5">Upgrade to Premium or Enterprise tier.</p>
              </div>
              <Link
                href="/community-pet-care/membership/upgrade"
                className="shrink-0 px-4 py-2 bg-(--bpa-navy) text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Upgrade →
              </Link>
            </div>
          )}

          <div className="text-center text-sm text-gray-400 space-y-1 pt-2">
            <p>
              <Link href="/community-pet-care/membership" className="text-(--bpa-green) hover:underline">
                View Membership Plans →
              </Link>
            </p>
            <p>
              <Link href="/contact" className="hover:underline">Need help? Contact us</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
