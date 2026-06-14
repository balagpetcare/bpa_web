'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Info, CheckCircle, Clock, Copy, Tag, Shield, PawPrint } from 'lucide-react';
import FormField from '@/components/ui/FormField';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import {
  getTierBySlug,
  initiateMembershipPurchase,
  submitTransaction,
} from '@/lib/api/community-membership';
import { assertSafePaymentUrl } from '@/lib/utils/payment-redirect';
import type {
  MembershipTierPublic,
  InitiatePurchaseResponse,
  MfsInstructions,
} from '@/lib/api/community-membership';

// ─── Constants ────────────────────────────────────────────────────

const BD_PHONE = /^(\+8801|01)[3-9]\d{8}$/;

const LEGAL_DISCLAIMER =
  'Community Care Membership is a service benefit membership only. ' +
  'It does not represent ownership, equity, profit-sharing, investment, or financial return. ' +
  'Service discounts and third-party benefits are subject to availability and partner terms.';

// ─── Form schema ─────────────────────────────────────────────────

const schema = z.object({
  memberName: z.string().min(2, 'Full name is required').max(120),
  memberMobile: z.string().regex(BD_PHONE, 'Enter a valid BD mobile number (e.g. 01xxxxxxxxx)'),
  memberEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  memberAddress: z.string().max(300).optional().or(z.literal('')),
  petCount: z.string().regex(/^\d*$/, 'Enter a valid number').optional(),
  preferredZone: z.string().max(100).optional().or(z.literal('')),
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
  const isOffer = tier.isOfferActive && tier.launchPriceBdt < tier.regularPriceBdt;
  const discountLine = discountRangeSummary(tier);

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
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
          {isOffer && (
            <p className="text-xs text-gray-400 line-through">
              ৳{Number(tier.regularPriceBdt).toLocaleString()}
            </p>
          )}
          <p className="text-2xl font-bold text-(--bpa-green)">
            ৳{Number(tier.currentPriceBdt).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">{tier.validityMonths} month membership</p>
          {isOffer && (
            <p className="text-xs text-amber-600 font-medium mt-0.5">
              Limited time offer
            </p>
          )}
        </div>
      </div>

      {/* Key specs */}
      <div className="flex gap-4 flex-wrap mb-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <PawPrint size={13} className="text-(--bpa-green)" />
          <span>Up to <strong>{tier.petLimitMax} pets</strong></span>
        </div>
        {discountLine && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Tag size={13} className="text-(--bpa-green)" />
            <span>{discountLine}</span>
          </div>
        )}
      </div>

      {/* Benefits */}
      {tier.benefits.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Shield size={11} /> Included benefits
          </p>
          <ul className="space-y-1">
            {tier.benefits.map((b) => (
              <li key={b.id} className="text-xs text-gray-600 flex items-start gap-1.5">
                <span className="text-(--bpa-green) font-bold mt-0.5 shrink-0">✓</span>
                <span>
                  {b.titleEn}
                  {b.descriptionEn && (
                    <span className="text-gray-400"> — {b.descriptionEn}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
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
          <span className="text-sm text-gray-500">Membership</span>
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

function SubmittedScreen({ purchaseId }: { purchaseId: string }) {
  return (
    <div className="text-center py-10 space-y-4">
      <Clock className="mx-auto text-(--bpa-green)" size={48} />
      <h3 className="text-xl font-bold text-(--bpa-navy)">Payment Submitted!</h3>
      <p className="text-gray-500 max-w-sm mx-auto">
        Your payment is under review. We will activate your membership card within 24–48 hours after verification.
      </p>
      <a
        href={`/community-pet-care/membership/status/${purchaseId}`}
        className="inline-block mt-4 px-6 py-2.5 bg-(--bpa-green) text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
      >
        Check Membership Status
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
  const [step, setStep] = useState<Step>('form');
  const [purchaseResult, setPurchaseResult] = useState<InitiatePurchaseResponse | null>(null);
  const [submitError, setSubmitError] = useState('');

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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      memberName: '',
      memberMobile: '',
      memberEmail: '',
      memberAddress: '',
      petCount: '',
      preferredZone: '',
      disclaimerConsent: false as never,
      hasConsented: false as never,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setSubmitError('');
    try {
      const petCount = data.petCount ? parseInt(data.petCount, 10) : undefined;
      const result = await initiateMembershipPurchase({
        tierSlug,
        memberName: data.memberName,
        memberMobile: data.memberMobile,
        memberEmail: data.memberEmail || undefined,
        memberAddress: data.memberAddress || undefined,
        petCount: Number.isFinite(petCount) ? petCount : undefined,
        preferredZone: data.preferredZone || undefined,
      });
      setPurchaseResult(result);
      if (result.paymentMode === 'manual' && result.mfs) {
        setStep('mfs');
      } else if (result.redirectUrl) {
        assertSafePaymentUrl(result.redirectUrl);
        setStep('redirecting');
        window.location.assign(result.redirectUrl);
      } else {
        // Fallback: treat as manual if no redirect URL and no mfs block
        setStep('mfs');
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

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
        <svg
          className="animate-spin h-8 w-8 mx-auto text-(--bpa-green) mb-4"
          fill="none"
          viewBox="0 0 24 24"
        >
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
    return <SubmittedScreen purchaseId={purchaseResult.purchaseId} />;
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

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Number of Pets
            </label>
            <input
              type="number"
              min={1}
              max={50}
              placeholder={`Max ${tier?.petLimitMax ?? 50}`}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green) focus:border-transparent"
              {...register('petCount')}
            />
            {errors.petCount && (
              <p className="text-xs text-red-600 mt-1">{errors.petCount.message as string}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {tier ? `Your tier covers up to ${tier.petLimitMax} pets.` : 'Optional — for our records.'}
            </p>
          </div>

          <FormField
            label="Preferred Zone"
            placeholder="e.g. Mirpur, Gulshan (optional)"
            error={errors.preferredZone?.message}
            {...register('preferredZone')}
          />
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
            I consent to BPA collecting and storing my information to process my membership and issue a card.
          </span>
        </label>
        {errors.hasConsented && (
          <p className="text-xs text-red-600 -mt-4">{errors.hasConsented.message}</p>
        )}

        <Button
          type="submit"
          size="lg"
          loading={isSubmitting}
          className="w-full"
          disabled={!tier || isSubmitting}
        >
          Proceed to Payment
        </Button>
      </form>
    </div>
  );
}
