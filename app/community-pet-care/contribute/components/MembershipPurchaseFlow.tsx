'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Info, CheckCircle, Clock, Copy, Tag, Shield, PawPrint, MapPin, AlertTriangle, Building2 } from 'lucide-react';
import FormField from '@/components/ui/FormField';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import {
  getTierBySlug,
  initiateMembershipPurchase,
  submitTransaction,
} from '@/lib/api/community-membership';
import { getPublicZones } from '@/lib/api/community-care';
import { assertSafePaymentUrl } from '@/lib/utils/payment-redirect';
import type {
  MembershipTierPublic,
  InitiatePurchaseResponse,
  MfsInstructions,
} from '@/lib/api/community-membership';
import type { CommunityZonePublic } from '@/types/bpa.types';

// ─── Constants ────────────────────────────────────────────────────

const BD_PHONE = /^(\+8801|01)[3-9]\d{8}$/;

const LEGAL_DISCLAIMER =
  'BPA Community Care Partner Card is a service benefit card only. ' +
  'It does not represent ownership, equity, profit-sharing, investment, or financial return. ' +
  'Service discounts and third-party benefits are subject to availability and partner terms. ' +
  'Clinic zone establishment is subject to sufficient member demand and BPA operational planning.';

function toSafeNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function resolveTierPrice(tier: MembershipTierPublic): number | null {
  return toSafeNumber(tier.currentPriceBdt)
    ?? toSafeNumber(tier.launchPriceBdt)
    ?? toSafeNumber(tier.regularPriceBdt);
}

function resolveTierBenefits(tier: MembershipTierPublic) {
  return (tier.benefits ?? [])
    .map((benefit, index) => {
      const titleEn = benefit.titleEn ?? benefit.title ?? benefit.nameEn ?? benefit.name ?? '';
      const titleBn = benefit.titleBn ?? benefit.nameBn ?? null;
      const title = titleEn || titleBn || '';
      const description = benefit.descriptionEn ?? benefit.descriptionBn ?? benefit.description ?? null;
      const id = benefit.id ?? benefit.slug ?? `${index}-${title}`;
      return { id, title, titleEn, titleBn, description };
    })
    .filter((benefit) => benefit.title.trim().length > 0);
}

function formatValidity(months: number): string {
  if (months >= 60 && months % 12 === 0) return `${months / 12}-Year Card Validity`;
  if (months >= 24 && months % 12 === 0) return `${months / 12}-Year Card Validity`;
  if (months === 12) return '1-Year Card Validity';
  return `${months}-Month Card Validity`;
}

// ─── Clinic status display ────────────────────────────────────────

type ClinicStatus = 'planned' | 'priority' | 'in_progress' | 'active' | 'paused';

const CLINIC_STATUS_MAP: Record<ClinicStatus, { label: string; badge: string }> = {
  planned:     { label: 'Planned',       badge: 'bg-gray-100 text-gray-600 border border-gray-200' },
  priority:    { label: 'Priority Zone', badge: 'bg-amber-100 text-amber-700 border border-amber-200' },
  in_progress: { label: 'In Progress',   badge: 'bg-blue-100 text-blue-700 border border-blue-200' },
  active:      { label: 'Clinic Active', badge: 'bg-green-100 text-green-700 border border-green-200' },
  paused:      { label: 'Paused',        badge: 'bg-red-100 text-red-600 border border-red-200' },
};

function getClinicStatusInfo(status: string | null | undefined) {
  return CLINIC_STATUS_MAP[(status ?? 'planned') as ClinicStatus] ?? CLINIC_STATUS_MAP.planned;
}

// ─── Form schema ─────────────────────────────────────────────────

const schema = z.object({
  memberName: z.string().min(2, 'Full name is required').max(120),
  memberMobile: z.string().regex(BD_PHONE, 'Enter a valid BD mobile number (e.g. 01xxxxxxxxx)'),
  memberEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  memberAddress: z.string().max(300).optional().or(z.literal('')),
  petCount: z.string().regex(/^\d*$/, 'Enter a valid number').optional(),
  preferredZoneId: z.string().uuid('Please select your preferred clinic zone'),
  disclaimerConsent: z.literal(true, { message: 'You must acknowledge the disclaimer' }),
  hasConsented: z.literal(true, { message: 'You must consent to proceed' }),
});

type FormValues = z.infer<typeof schema>;
type Step = 'form' | 'mfs' | 'submitted' | 'redirecting';

// ─── Helpers ─────────────────────────────────────────────────────

function discountRangeSummary(tier: MembershipTierPublic): string | null {
  if (!tier.serviceDiscounts.length) return null;
  const pcts = tier.serviceDiscounts
    .filter((d) => d.discountType === 'PERCENTAGE')
    .map((d) => d.discountValue);
  const fixed = tier.serviceDiscounts
    .filter((d) => d.discountType === 'FIXED')
    .map((d) => d.discountValue);
  const parts: string[] = [];
  if (pcts.length) {
    const min = Math.min(...pcts);
    const max = Math.max(...pcts);
    parts.push(min === max ? `${min}% off` : `${min}–${max}% off`);
  }
  if (fixed.length) {
    const min = Math.min(...fixed);
    const max = Math.max(...fixed);
    parts.push(min === max ? `৳${min} off` : `৳${min}–৳${max} off`);
  }
  return parts.length ? `Service discounts: ${parts.join(', ')} on partner services` : null;
}

// ─── Tier summary card ─────────────────────────────────────────────

function TierSummary({ tier }: { tier: MembershipTierPublic }) {
  const launchPrice = toSafeNumber(tier.launchPriceBdt);
  const regularPrice = toSafeNumber(tier.regularPriceBdt);
  const currentPrice = resolveTierPrice(tier);
  const benefits = resolveTierBenefits(tier);
  const isOffer = Boolean(
    tier.isOfferActive &&
    launchPrice !== null &&
    regularPrice !== null &&
    currentPrice !== null &&
    launchPrice < regularPrice &&
    currentPrice === launchPrice,
  );
  const discountLine = discountRangeSummary(tier);

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-xs font-semibold text-(--bpa-green) uppercase tracking-wide mb-1">
            BPA Community Care Partner Card
          </p>
          <div className="flex items-center gap-2 mb-1">
            <p className="font-bold text-(--bpa-navy) text-lg">{tier.nameEn}</p>
            {tier.badgeTextEn && (
              <span className="text-xs bg-(--bpa-green) text-white px-2 py-0.5 rounded-full font-semibold">
                {tier.badgeTextEn}
              </span>
            )}
          </div>
          {tier.shortDescEn && (
            <p className="text-sm text-gray-600">{tier.shortDescEn}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          {isOffer && regularPrice !== null && (
            <p className="text-xs text-gray-400 line-through">৳{regularPrice.toLocaleString()}</p>
          )}
          <p className="text-2xl font-bold text-(--bpa-green)">
            {currentPrice !== null ? `৳${currentPrice.toLocaleString()}` : 'Price unavailable'}
          </p>
          <p className="text-xs text-gray-500">{formatValidity(tier.validityMonths)}</p>
          {isOffer && (
            <p className="text-xs text-amber-600 font-medium mt-0.5">Limited time offer</p>
          )}
        </div>
      </div>

      {/* Key specs */}
      <div className="flex gap-4 flex-wrap mb-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <PawPrint size={13} className="text-(--bpa-green)" />
          <span>Up to <strong>{tier.petLimitMax} pets</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Building2 size={13} className="text-(--bpa-green)" />
          <span>Preferred clinic/branch priority</span>
        </div>
        {discountLine && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Tag size={13} className="text-(--bpa-green)" />
            <span>{discountLine}</span>
          </div>
        )}
      </div>

      {/* Benefits */}
      {benefits.length > 0 ? (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Shield size={11} /> Included benefits
          </p>
          <ul className="space-y-1">
            {benefits.map((b, index) => (
              <li key={b.id ?? `${index}-${b.title}`} className="text-xs text-gray-600 flex items-start gap-1.5">
                <span className="text-(--bpa-green) font-bold mt-0.5 shrink-0">✓</span>
                <span>
                  {b.title}
                  {b.description && (
                    <span className="text-gray-400"> — {b.description}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white/60 px-3 py-2 text-xs text-gray-500">
          No benefits are listed for this tier yet.
        </div>
      )}
    </div>
  );
}

// ─── Zone card ────────────────────────────────────────────────────

function ZoneCard({
  zone,
  isSelected,
  onSelect,
}: {
  zone: CommunityZonePublic;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const paidCount = zone.paidMemberCount ?? 0;
  const target = zone.targetMembers ?? 0;
  const pct = target > 0 ? Math.min(100, Math.round((paidCount / target) * 100)) : 0;
  const clinicInfo = getClinicStatusInfo(zone.clinicStatus);
  const isTopZone = zone.rank === 1;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`text-left w-full rounded-xl border-2 p-4 transition-all cursor-pointer ${
        isSelected
          ? 'border-(--bpa-green) bg-green-50 shadow-md ring-2 ring-(--bpa-green)/20'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      {/* Name + status row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {isTopZone && (
              <span className="text-[10px] bg-(--bpa-green) text-white px-1.5 py-0.5 rounded font-bold shrink-0">
                #1 Priority
              </span>
            )}
            <p className="font-semibold text-(--bpa-navy) text-sm leading-tight">{zone.name}</p>
          </div>
          {zone.nameBn && (
            <p className="text-xs text-gray-400 mt-0.5">{zone.nameBn}</p>
          )}
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
            <MapPin size={10} className="shrink-0" />
            {zone.city}, {zone.district}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {isSelected ? (
            <CheckCircle size={18} className="text-(--bpa-green)" />
          ) : null}
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${clinicInfo.badge}`}>
            {clinicInfo.label}
          </span>
        </div>
      </div>

      {/* Member demand */}
      <div className="mt-2">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span className="font-medium text-(--bpa-navy)">{paidCount.toLocaleString()} active member{paidCount !== 1 ? 's' : ''}</span>
          {target > 0 && <span className="text-gray-400">Goal: {target.toLocaleString()}</span>}
        </div>
        {target > 0 ? (
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${isSelected ? 'bg-(--bpa-green)' : 'bg-gray-300'}`}
              style={{ width: `${Math.max(pct, 2)}%` }}
            />
          </div>
        ) : (
          <div className="w-full bg-gray-100 rounded-full h-1.5" />
        )}
      </div>

      {/* Expected launch note */}
      {zone.expectedLaunchNote && (
        <p className="text-[11px] text-gray-400 mt-2 leading-snug">{zone.expectedLaunchNote}</p>
      )}
    </button>
  );
}

// ─── Zone card skeleton ───────────────────────────────────────────

function ZoneCardSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

// ─── MFS payment screen ─────────────────────────────────────────

function MfsPaymentScreen({
  purchaseResult,
  mfs,
  onSubmitted,
}: {
  purchaseResult: InitiatePurchaseResponse;
  mfs: MfsInstructions;
  onSubmitted: () => void;
}) {
  const [provider, setProvider] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const providers = [
    mfs.bKash ? { id: 'bkash', label: 'bKash', number: mfs.bKash } : null,
    mfs.nagad ? { id: 'nagad', label: 'Nagad', number: mfs.nagad } : null,
    mfs.rocket ? { id: 'rocket', label: 'Rocket', number: mfs.rocket } : null,
  ].filter(Boolean) as { id: string; label: string; number: string }[];

  const selectedProvider = providers.find((p) => p.id === provider);

  function copyRef() {
    navigator.clipboard.writeText(mfs.reference).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!provider) { setError('Please select a payment provider.'); return; }
    if (!transactionId.trim()) { setError('Please enter your transaction ID.'); return; }
    setSubmitting(true);
    try {
      await submitTransaction({
        purchaseId: purchaseResult.purchaseId,
        provider,
        transactionId: transactionId.trim(),
      });
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-xl p-5">
        <h3 className="font-bold text-(--bpa-navy) mb-1">Manual Payment Instructions</h3>
        <p className="text-sm text-gray-600">
          {mfs.instructionsEn || 'Send the exact amount via MFS to the number below, using the reference as the note/narration.'}
        </p>
      </div>

      {/* Payment details */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Card Tier</span>
          <span className="font-semibold text-(--bpa-navy)">{purchaseResult.tierName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Amount to Send</span>
          <span className="text-xl font-bold text-(--bpa-green)">
            ৳{Number(purchaseResult.amount).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Reference / Note</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-(--bpa-navy)">{mfs.reference}</span>
            <button type="button" onClick={copyRef} className="text-gray-400 hover:text-(--bpa-green)">
              {copied ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
          </div>
        </div>
        {mfs.accountHolder && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Account Holder</span>
            <span className="text-sm font-medium">{mfs.accountHolder}</span>
          </div>
        )}
      </div>

      {/* Provider selector */}
      {providers.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Send via</p>
          <div className="flex gap-3 flex-wrap">
            {providers.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setProvider(p.id)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  provider === p.id
                    ? 'border-(--bpa-green) bg-green-50 text-(--bpa-green)'
                    : 'border-gray-200 text-gray-700 hover:border-gray-400'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {selectedProvider && (
            <p className="mt-2 text-sm text-gray-600">
              Send to: <strong className="text-(--bpa-navy)">{selectedProvider.number}</strong>
            </p>
          )}
        </div>
      )}

      {/* Transaction ID form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="error" title="Submission failed" message={error} />}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Transaction ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="Enter MFS transaction ID"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green) focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">
            Find this in your MFS app SMS or transaction history.
          </p>
        </div>
        <Button type="submit" size="lg" loading={submitting} className="w-full">
          Submit Payment Confirmation
        </Button>
      </form>
    </div>
  );
}

// ─── Submitted screen ─────────────────────────────────────────────

function SubmittedScreen({
  purchaseId,
  zoneName,
}: {
  purchaseId: string;
  zoneName?: string;
}) {
  return (
    <div className="text-center py-10 space-y-4">
      <Clock className="mx-auto text-(--bpa-green)" size={48} />
      <h3 className="text-xl font-bold text-(--bpa-navy)">Payment Submitted!</h3>
      <p className="text-gray-500 max-w-sm mx-auto">
        Your payment is under review. We will activate your BPA Community Care Partner Card within 24–48 hours after verification.
      </p>
      {zoneName && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-left max-w-sm mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={14} className="text-(--bpa-green) shrink-0" />
            <p className="text-sm font-semibold text-(--bpa-navy)">Preferred Zone: {zoneName}</p>
          </div>
          <p className="text-xs text-gray-500">
            Your selected zone has been counted toward BPA&apos;s clinic expansion priority.
          </p>
        </div>
      )}
      <a
        href={`/community-pet-care/membership/status/${purchaseId}`}
        className="inline-block mt-4 px-6 py-2.5 bg-(--bpa-green) text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
      >
        Check Card Status
      </a>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────

function TierSkeleton() {
  return (
    <div className="animate-pulse space-y-3 bg-gray-50 rounded-xl p-5">
      <div className="flex justify-between">
        <div className="h-5 bg-gray-200 rounded w-32" />
        <div className="h-7 bg-gray-200 rounded w-20" />
      </div>
      <div className="h-3 bg-gray-200 rounded w-48" />
      <div className="space-y-2 pt-2">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────

interface Props {
  tierSlug: string;
}

export default function MembershipPurchaseFlow({ tierSlug }: Props) {
  const [tier, setTier] = useState<MembershipTierPublic | null>(null);
  const [tierError, setTierError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [zones, setZones] = useState<CommunityZonePublic[]>([]);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [zonesError, setZonesError] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [purchaseResult, setPurchaseResult] = useState<InitiatePurchaseResponse | null>(null);
  const [selectedZoneName, setSelectedZoneName] = useState<string | undefined>(undefined);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    getTierBySlug(tierSlug)
      .then((t) => {
        if (!t.isActive) {
          setTierError('This membership tier is currently not available for purchase.');
        } else {
          setTier(t);
        }
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : '';
        if (msg.includes('not found') || msg.includes('404')) {
          setTierError('Membership tier not found. Please go back and select a valid plan.');
        } else {
          setTierError('Could not load membership details. Please refresh or try again.');
        }
      });
  }, [tierSlug]);

  useEffect(() => {
    getPublicZones()
      .then((zs) => {
        const active = zs.filter((z) => z.status === 'active');
        if (active.length === 0) {
          setZonesError(true);
        } else {
          setZones(active);
        }
      })
      .catch(() => setZonesError(true))
      .finally(() => setZonesLoading(false));
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      memberName: '',
      memberMobile: '',
      memberEmail: '',
      memberAddress: '',
      petCount: '',
      preferredZoneId: '',
      disclaimerConsent: false as never,
      hasConsented: false as never,
    },
  });

  const preferredZoneId = watch('preferredZoneId');

  const onSubmit = async (data: FormValues) => {
    setSubmitError('');
    try {
      const petCount = data.petCount ? parseInt(data.petCount, 10) : undefined;
      const selectedZone = zones.find((z) => z.id === data.preferredZoneId);
      setSelectedZoneName(selectedZone?.name);

      const result = await initiateMembershipPurchase({
        tierSlug,
        memberName: data.memberName,
        memberMobile: data.memberMobile,
        memberEmail: data.memberEmail || undefined,
        memberAddress: data.memberAddress || undefined,
        petCount: Number.isFinite(petCount) ? petCount : undefined,
        preferredZoneId: data.preferredZoneId,
      });
      setPurchaseResult(result);
      if (result.paymentMode === 'manual' && result.mfs) {
        setStep('mfs');
      } else if (result.redirectUrl) {
        assertSafePaymentUrl(result.redirectUrl);
        setStep('redirecting');
        window.location.assign(result.redirectUrl);
      } else {
        setStep('mfs');
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  const selectedTierPrice = tier ? resolveTierPrice(tier) : null;

  const isSubmitDisabled =
    !mounted ||
    !tier ||
    zonesLoading ||
    zonesError ||
    selectedTierPrice === null ||
    isSubmitting ||
    !preferredZoneId;

  // ── Error states ────────────────────────────────────────────────

  if (tierError) {
    return (
      <div className="space-y-4">
        <Alert variant="error" title="Tier unavailable" message={tierError} />
        <a
          href="/community-pet-care/membership"
          className="block text-center text-sm text-(--bpa-green) hover:underline"
        >
          ← View all membership plans
        </a>
      </div>
    );
  }

  // ── Redirecting screen ──────────────────────────────────────────

  if (step === 'redirecting') {
    return (
      <div className="text-center py-16">
        <svg className="animate-spin h-8 w-8 mx-auto text-(--bpa-green) mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-(--bpa-green) font-semibold">Redirecting to payment gateway…</p>
        <p className="text-sm text-gray-500 mt-1">Please do not close this window.</p>
      </div>
    );
  }

  // ── MFS screen ──────────────────────────────────────────────────

  if (step === 'mfs' && purchaseResult?.mfs) {
    return (
      <MfsPaymentScreen
        purchaseResult={purchaseResult}
        mfs={purchaseResult.mfs}
        onSubmitted={() => setStep('submitted')}
      />
    );
  }

  // ── Submitted screen ─────────────────────────────────────────────

  if (step === 'submitted' && purchaseResult) {
    return <SubmittedScreen purchaseId={purchaseResult.purchaseId} zoneName={selectedZoneName} />;
  }

  // ── Main form ────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Tier summary */}
      {tier ? <TierSummary tier={tier} /> : <TierSkeleton />}

      {/* Member form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {submitError && <Alert variant="error" title="Submission failed" message={submitError} />}

        <div className="grid sm:grid-cols-2 gap-5">
          <FormField
            label="Full Name"
            required
            placeholder="Your full name"
            error={errors.memberName?.message}
            {...register('memberName')}
          />
          <FormField
            label="Mobile Number"
            type="tel"
            required
            placeholder="01xxxxxxxxx"
            error={errors.memberMobile?.message}
            {...register('memberMobile')}
          />
        </div>

        <FormField
          label="Email Address"
          type="email"
          placeholder="your@email.com (optional)"
          error={errors.memberEmail?.message}
          {...register('memberEmail')}
        />

        <FormField
          label="Address"
          as="textarea"
          rows={2}
          placeholder="Your home address (optional)"
          error={errors.memberAddress?.message}
          {...register('memberAddress')}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Number of Pets</label>
          <input
            type="number"
            min={1}
            max={50}
            placeholder={`Max ${tier?.petLimitMax ?? 50}`}
            className="w-full sm:w-48 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green) focus:border-transparent"
            {...register('petCount')}
          />
          {errors.petCount && (
            <p className="text-xs text-red-600 mt-1">{errors.petCount.message as string}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {tier ? `Your tier covers up to ${tier.petLimitMax} pets.` : 'Optional — for our records.'}
          </p>
        </div>

        {/* ── Preferred Clinic Zone section ─────────────────────── */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={16} className="text-blue-600 shrink-0" />
            <h3 className="font-semibold text-(--bpa-navy) text-sm">
              Choose Your Preferred Clinic Zone <span className="text-red-500 ml-0.5">*</span>
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            Select the area where you want BPA to establish a clinic or partner branch earlier.
            Zones with more active card members receive higher priority in our expansion plan.
          </p>

          {zonesError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
              <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">Could not load clinic zones</p>
                <p className="text-xs text-red-600 mt-0.5">
                  Zone data failed to load. Please refresh the page and try again.
                  You must select a zone to proceed.
                </p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-2 text-xs text-red-700 font-semibold underline underline-offset-2 hover:text-red-800"
                >
                  Refresh page →
                </button>
              </div>
            </div>
          ) : zonesLoading ? (
            <ZoneCardSkeleton />
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {zones.map((z) => (
                <ZoneCard
                  key={z.id}
                  zone={z}
                  isSelected={preferredZoneId === z.id}
                  onSelect={() => setValue('preferredZoneId', z.id, { shouldValidate: true })}
                />
              ))}
            </div>
          )}

          {/* Hidden input for react-hook-form validation */}
          <input type="hidden" {...register('preferredZoneId')} />

          {errors.preferredZoneId && !zonesError && (
            <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
              <AlertTriangle size={11} />
              {errors.preferredZoneId.message as string}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-3">
            Your vote helps BPA prioritise which zone gets the first clinic or partner branch.
            This is recorded with your card purchase.
          </p>
        </div>

        {/* Legal disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex gap-2 mb-3">
            <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">{LEGAL_DISCLAIMER}</p>
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded mt-0.5 shrink-0"
              {...register('disclaimerConsent')}
            />
            <span className="text-sm text-gray-700">
              I have read and understood the legal disclaimer above.
            </span>
          </label>
          {errors.disclaimerConsent && (
            <p className="text-xs text-red-600 mt-1.5">{errors.disclaimerConsent.message}</p>
          )}
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded mt-0.5 shrink-0"
            {...register('hasConsented')}
          />
          <span className="text-sm text-gray-600 leading-relaxed">
            I consent to BPA collecting and storing my information to process my card membership and issue a Community Care Partner Card.
          </span>
        </label>
        {errors.hasConsented && (
          <p className="text-xs text-red-600 -mt-4">{errors.hasConsented.message}</p>
        )}

        {zonesError && (
          <Alert
            variant="error"
            title="Zone selection required"
            message="Clinic zone data could not be loaded. Please refresh the page before proceeding."
          />
        )}

        {!mounted ? (
          <Button type="button" size="lg" loading={false} className="w-full" disabled>
            Loading…
          </Button>
        ) : (
          <Button
            type="submit"
            size="lg"
            loading={Boolean(isSubmitting)}
            className="w-full"
            disabled={Boolean(isSubmitDisabled)}
          >
            Proceed to Payment
          </Button>
        )}
        {mounted && tier && selectedTierPrice === null && (
          <p className="text-xs text-amber-700 text-center">
            Price unavailable for this tier right now. Please try again later.
          </p>
        )}
      </form>
    </div>
  );
}
