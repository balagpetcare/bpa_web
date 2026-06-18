'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Info, CheckCircle, Copy, ShieldCheck } from 'lucide-react';
import FormField from '@/components/ui/FormField';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import {
  initiateMembershipPurchase,
  submitTransaction,
  type MembershipTierPublic,
  type InitiatePurchaseResponse,
  type MfsInstructions,
} from '@/lib/api/community-membership';
import { getPublicZones } from '@/lib/api/community-care';
import { assertSafePaymentUrl } from '@/lib/utils/payment-redirect';
import type { CommunityZonePublic } from '@/types/bpa.types';

const BD_PHONE = /^(\+8801|01)[3-9]\d{8}$/;

const schema = z.object({
  memberName: z.string().min(2, 'Full name is required').max(120),
  memberMobile: z.string().regex(BD_PHONE, 'Enter a valid BD mobile number (e.g. 01xxxxxxxxx)'),
  memberEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  memberAddress: z.string().max(300).optional().or(z.literal('')),
  preferredZoneId: z.string().min(1, 'Please select your preferred clinic zone'),
  petCount: z.string().optional(),
  disclaimerConsent: z.literal(true, { message: 'You must acknowledge the disclaimer' }),
  hasConsented: z.literal(true, { message: 'You must consent to proceed' }),
});

type FormValues = z.infer<typeof schema>;

const mfsTxnSchema = z.object({
  provider: z.string().min(1, 'Please select a payment provider'),
  transactionId: z.string().min(6, 'Transaction ID must be at least 6 characters').max(50),
});
type MfsTxnValues = z.infer<typeof mfsTxnSchema>;

interface Props {
  tier: MembershipTierPublic;
  displayPrice: number;
  strikePrice: number | null;
  isOfferActive: boolean;
  legalDisclaimer?: string | null;
}

export default function MembershipPurchaseForm({ tier, displayPrice, strikePrice, isOfferActive, legalDisclaimer }: Props) {
  const [zones, setZones] = useState<CommunityZonePublic[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [redirecting, setRedirecting] = useState(false);
  const [pendingPurchase, setPendingPurchase] = useState<InitiatePurchaseResponse | null>(null);
  const [mfsSubmitted, setMfsSubmitted] = useState(false);
  const [mfsError, setMfsError] = useState('');

  useEffect(() => {
    getPublicZones().then(setZones).catch(() => {});
  }, []);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      memberName: '',
      memberMobile: '',
      memberEmail: '',
      memberAddress: '',
      preferredZoneId: '',
      disclaimerConsent: false as never,
      hasConsented: false as never,
    },
  });

  const mfsForm = useForm<MfsTxnValues>({
    resolver: zodResolver(mfsTxnSchema),
    defaultValues: { provider: '', transactionId: '' },
  });

  const onSubmit = async (data: FormValues) => {
    setErrorMsg('');
    try {
      const result = await initiateMembershipPurchase({
        tierSlug: tier.slug,
        memberName: data.memberName,
        memberMobile: data.memberMobile,
        memberEmail: data.memberEmail || undefined,
        memberAddress: data.memberAddress || undefined,
        petCount: data.petCount ? parseInt(data.petCount, 10) : undefined,
        preferredZoneId: data.preferredZoneId || undefined,
      });

      if (result.redirectUrl) {
        assertSafePaymentUrl(result.redirectUrl);
        // Store purchaseId so we can retrieve it on success page
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem(`bpa_purchase_${result.merchantTxnId}`, result.purchaseId);
          } catch { /* sessionStorage unavailable */ }
        }
        setRedirecting(true);
        window.location.assign(result.redirectUrl);
      } else {
        // Manual MFS payment mode
        setPendingPurchase(result);
      }
    } catch (err) {
      setRedirecting(false);
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  const onMfsSubmit = async (data: MfsTxnValues) => {
    if (!pendingPurchase) return;
    setMfsError('');
    try {
      await submitTransaction({
        purchaseId: pendingPurchase.purchaseId,
        provider: data.provider,
        transactionId: data.transactionId,
      });
      setMfsSubmitted(true);
    } catch (err) {
      setMfsError(err instanceof Error ? err.message : 'Failed to submit transaction. Please try again.');
    }
  };

  if (redirecting) {
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

  if (mfsSubmitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck size={32} className="text-(--bpa-green)" />
        </div>
        <h2 className="text-2xl font-bold text-(--bpa-navy) mb-3">Transaction Submitted!</h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed max-w-sm mx-auto">
          Your transaction reference has been submitted. Our team will verify your payment and activate your membership card within a few hours.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 mb-6">
          <strong>Purchase Reference:</strong>{' '}
          <span className="font-mono">{pendingPurchase?.purchaseId?.slice(0, 8).toUpperCase()}</span>
        </div>
        <p className="text-xs text-gray-400">
          You can check your card status at{' '}
          <a href="/membership/lookup" className="text-(--bpa-green) underline">membership/lookup</a>
        </p>
      </div>
    );
  }

  if (pendingPurchase?.paymentMode === 'manual' && pendingPurchase.mfs) {
    return (
      <ManualPaymentPanel
        purchase={pendingPurchase}
        mfs={pendingPurchase.mfs}
        mfsForm={mfsForm}
        onMfsSubmit={onMfsSubmit}
        mfsError={mfsError}
      />
    );
  }

  const disclaimer = legalDisclaimer ??
    'BPA Community Care Partner Card is a service benefit card only. It does not represent ownership, equity, ' +
    'profit-sharing, investment, or financial return. Service discounts are subject to availability and partner terms. ' +
    'Clinic zone establishment is subject to sufficient member demand and BPA operational planning.';

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {errorMsg && <Alert variant="error" title="Submission failed" message={errorMsg} />}

      {/* Tier summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-1">
          <p className="font-bold text-(--bpa-navy) text-base">{tier.nameEn}</p>
          <div className="text-right">
            <span className="text-2xl font-black text-(--bpa-green)">৳{displayPrice.toLocaleString()}</span>
            {strikePrice && (
              <span className="text-sm text-gray-400 line-through ml-2">৳{strikePrice.toLocaleString()}</span>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mb-2">{tier.nameBn}</p>
        <div className="flex gap-4 text-xs text-gray-500 mt-2">
          <span className="bg-white border border-gray-200 px-2 py-0.5 rounded-full">
            {tier.validityMonths >= 60 ? '5-Year Validity' : `${tier.validityMonths} Months`}
          </span>
          <span className="bg-white border border-gray-200 px-2 py-0.5 rounded-full">
            Up to {tier.petLimitMax} Pets
          </span>
          {isOfferActive && (
            <span className="bg-green-50 border border-green-200 text-(--bpa-green) px-2 py-0.5 rounded-full font-semibold">
              Launch Offer
            </span>
          )}
        </div>
      </div>

      {/* Preferred zone */}
      <FormField
        label="Preferred Clinic Zone"
        required
        as="select"
        error={errors.preferredZoneId?.message}
        {...register('preferredZoneId')}
      >
        <option value="">Select your preferred zone</option>
        {zones.filter((z) => z.status === 'active').map((z) => (
          <option key={z.id} value={z.id}>
            {z.name} — {z.city}, {z.district}
          </option>
        ))}
      </FormField>

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
        placeholder="Your address (optional)"
        error={errors.memberAddress?.message}
        {...register('memberAddress')}
      />

      <FormField
        label="Number of Pets"
        type="number"
        placeholder={`Max ${tier.petLimitMax}`}
        error={errors.petCount?.message}
        {...register('petCount')}
      />

      {/* Legal disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex gap-2 mb-3">
          <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">{disclaimer}</p>
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 rounded mt-0.5 shrink-0" {...register('disclaimerConsent')} />
          <span className="text-sm text-gray-700">I have read and understood the legal disclaimer above.</span>
        </label>
        {errors.disclaimerConsent && (
          <p className="text-xs text-red-600 mt-1.5">{errors.disclaimerConsent.message}</p>
        )}
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" className="w-4 h-4 rounded mt-0.5 shrink-0" {...register('hasConsented')} />
        <span className="text-sm text-gray-600 leading-relaxed">
          I consent to BPA collecting and storing my information to process my membership and issue a Community Care Partner Card.
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
        disabled={isSubmitting}
      >
        Proceed to Payment — ৳{displayPrice.toLocaleString()}
      </Button>

      <p className="text-xs text-center text-gray-400">
        You will be securely redirected to the EPS payment gateway. Card is issued automatically after payment verification.
      </p>
    </form>
  );
}

function ManualPaymentPanel({
  purchase,
  mfs,
  mfsForm,
  onMfsSubmit,
  mfsError,
}: {
  purchase: InitiatePurchaseResponse;
  mfs: MfsInstructions;
  mfsForm: ReturnType<typeof useForm<MfsTxnValues>>;
  onMfsSubmit: (data: MfsTxnValues) => Promise<void>;
  mfsError: string;
}) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = mfsForm;
  const [copied, setCopied] = useState(false);

  function copyRef() {
    navigator.clipboard.writeText(mfs.reference).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-xl p-5">
        <h3 className="font-bold text-(--bpa-navy) mb-1">Complete Your Payment</h3>
        <p className="text-sm text-gray-600 mb-4">
          Send <strong>৳{purchase.amount.toLocaleString()} BDT</strong> for <strong>{purchase.tierName} Care Partner Card</strong> using any of the options below.
        </p>

        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Payment Reference</p>
            <p className="font-mono font-bold text-(--bpa-navy) text-lg">{mfs.reference}</p>
          </div>
          <button type="button" onClick={copyRef} className="text-gray-400 hover:text-(--bpa-green) transition-colors">
            {copied ? <CheckCircle size={18} className="text-(--bpa-green)" /> : <Copy size={18} />}
          </button>
        </div>

        <div className="space-y-2">
          {mfs.bKash && (
            <div className="bg-pink-50 border border-pink-100 rounded-lg px-4 py-3">
              <p className="text-xs font-bold text-pink-700 uppercase tracking-widest mb-0.5">bKash</p>
              <p className="font-mono font-bold text-pink-800 text-base">{mfs.bKash}</p>
              {mfs.accountHolder && <p className="text-xs text-pink-600">{mfs.accountHolder}</p>}
            </div>
          )}
          {mfs.nagad && (
            <div className="bg-orange-50 border border-orange-100 rounded-lg px-4 py-3">
              <p className="text-xs font-bold text-orange-700 uppercase tracking-widest mb-0.5">Nagad</p>
              <p className="font-mono font-bold text-orange-800 text-base">{mfs.nagad}</p>
              {mfs.accountHolder && <p className="text-xs text-orange-600">{mfs.accountHolder}</p>}
            </div>
          )}
          {mfs.rocket && (
            <div className="bg-purple-50 border border-purple-100 rounded-lg px-4 py-3">
              <p className="text-xs font-bold text-purple-700 uppercase tracking-widest mb-0.5">Rocket</p>
              <p className="font-mono font-bold text-purple-800 text-base">{mfs.rocket}</p>
              {mfs.accountHolder && <p className="text-xs text-purple-600">{mfs.accountHolder}</p>}
            </div>
          )}
        </div>

        {mfs.instructionsEn && (
          <p className="text-xs text-gray-600 mt-4 bg-white border border-gray-100 rounded-lg px-3 py-2 leading-relaxed">
            {mfs.instructionsEn}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit(onMfsSubmit)} className="space-y-4">
        {mfsError && <Alert variant="error" message={mfsError} />}
        <p className="text-sm font-semibold text-(--bpa-navy)">After payment, enter the transaction details below:</p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Provider</label>
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green)"
            {...register('provider')}
          >
            <option value="">Select provider</option>
            {mfs.bKash && <option value="bKash">bKash</option>}
            {mfs.nagad && <option value="Nagad">Nagad</option>}
            {mfs.rocket && <option value="Rocket">Rocket</option>}
            <option value="Other">Other</option>
          </select>
          {errors.provider && <p className="text-xs text-red-600 mt-1">{errors.provider.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Transaction ID</label>
          <input
            type="text"
            placeholder="e.g. 8N7A4B2K1R"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-(--bpa-green)"
            {...register('transactionId')}
          />
          {errors.transactionId && <p className="text-xs text-red-600 mt-1">{errors.transactionId.message}</p>}
        </div>

        <Button type="submit" loading={isSubmitting} size="md" className="w-full">
          Submit Transaction Reference
        </Button>
      </form>
    </div>
  );
}
