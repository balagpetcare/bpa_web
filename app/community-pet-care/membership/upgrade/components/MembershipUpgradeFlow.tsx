'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowRight, CheckCircle, Clock, Copy, CreditCard,
  Shield, AlertCircle, ChevronRight,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Alert from '@/components/ui/Alert';
import {
  lookupMembership,
  getUpgradeQuote,
  requestUpgrade,
  submitUpgradeTransaction,
} from '@/lib/api/community-membership';
import { assertSafePaymentUrl } from '@/lib/utils/payment-redirect';
import type {
  MembershipLookupResult,
  UpgradeQuoteResponse,
  UpgradeRequestResponse,
  MfsInstructions,
} from '@/lib/api/community-membership';

// ─── Step types ─────────────────────────────────────────────────

type Step = 'lookup' | 'select-tier' | 'confirm' | 'mfs' | 'redirecting' | 'submitted';

// ─── Tier upgrade map ─────────────────────────────────────────────

const UPGRADE_PATHS: Record<string, { slug: string; label: string }[]> = {
  primary: [
    { slug: 'premium', label: 'Premium' },
    { slug: 'enterprise', label: 'Enterprise' },
  ],
  premium: [
    { slug: 'enterprise', label: 'Enterprise' },
  ],
  enterprise: [],
};

// ─── Lookup form ─────────────────────────────────────────────────

const BD_PHONE = /^(\+8801|01)[3-9]\d{8}$/;

const lookupSchema = z.discriminatedUnion('method', [
  z.object({
    method: z.literal('card'),
    cardNumber: z.string().min(1, 'Card number is required'),
    mobile: z.string().regex(BD_PHONE, 'Enter a valid BD mobile number (e.g. 01xxxxxxxxx)'),
  }),
  z.object({
    method: z.literal('token'),
    token: z.string().length(64, 'Verification token must be 64 characters').regex(/^[0-9a-f]+$/, 'Invalid token format'),
  }),
]);

type LookupValues = z.infer<typeof lookupSchema>;

function LookupStep({ onFound }: { onFound: (r: MembershipLookupResult) => void }) {
  const [error, setError] = useState('');
  const [lookupMethod, setLookupMethod] = useState<'card' | 'token'>('card');

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<LookupValues>({
    resolver: zodResolver(lookupSchema),
    defaultValues: { method: 'card', cardNumber: '', mobile: '' },
  });

  function switchMethod(m: 'card' | 'token') {
    setLookupMethod(m);
    setValue('method', m);
    setError('');
  }

  const onSubmit = async (data: LookupValues) => {
    setError('');
    try {
      const payload = data.method === 'token'
        ? { token: (data as { method: 'token'; token: string }).token }
        : { cardNumber: (data as { method: 'card'; cardNumber: string; mobile: string }).cardNumber, mobile: (data as { method: 'card'; cardNumber: string; mobile: string }).mobile };
      const result = await lookupMembership(payload);
      onFound(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Membership not found. Check your details and try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Identify your membership</p>
        <div className="flex gap-2">
          {(['card', 'token'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMethod(m)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                lookupMethod === m
                  ? 'border-(--bpa-green) bg-green-50 text-(--bpa-green)'
                  : 'border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              {m === 'card' ? 'Card Number + Mobile' : 'Verification Token'}
            </button>
          ))}
        </div>
      </div>

      <input type="hidden" {...register('method')} />

      {lookupMethod === 'card' ? (
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            label="Card Number"
            required
            placeholder="e.g. BPA-CM-2026-000001"
            error={(errors as { cardNumber?: { message?: string } }).cardNumber?.message}
            {...register('cardNumber')}
          />
          <FormField
            label="Registered Mobile"
            type="tel"
            required
            placeholder="01xxxxxxxxx"
            error={(errors as { mobile?: { message?: string } }).mobile?.message}
            {...register('mobile')}
          />
        </div>
      ) : (
        <FormField
          label="Verification Token"
          required
          placeholder="64-character hex token from your card QR"
          error={(errors as { token?: { message?: string } }).token?.message}
          {...register('token')}
        />
      )}

      {error && <Alert variant="error" title="Lookup failed" message={error} />}

      <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
        Find My Membership
      </Button>
    </form>
  );
}

// ─── Membership card display ──────────────────────────────────────

function MembershipCard({ membership }: { membership: MembershipLookupResult }) {
  function formatDate(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-BD', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  const statusColor: Record<string, string> = {
    active: 'text-green-600 bg-green-50 border-green-200',
    expired: 'text-red-600 bg-red-50 border-red-200',
    suspended: 'text-amber-600 bg-amber-50 border-amber-200',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard size={16} className="text-gray-400" />
          <span className="font-mono text-sm font-bold text-(--bpa-navy)">{membership.cardNumber}</span>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColor[membership.cardStatus] ?? 'text-gray-500 bg-gray-50 border-gray-200'}`}>
          {membership.cardStatus.toUpperCase()}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-gray-400 text-xs">Member</p>
          <p className="font-semibold text-(--bpa-navy)">{membership.memberName}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Current Tier</p>
          <p className="font-semibold text-(--bpa-green)">{membership.tierName}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Paid Amount</p>
          <p className="font-semibold">৳{Number(membership.amountBdt).toLocaleString()}</p>
        </div>
        {membership.petLimit != null && (
          <div>
            <p className="text-gray-400 text-xs">Pet Limit</p>
            <p className="font-semibold">{membership.petLimit} pets</p>
          </div>
        )}
        {membership.expiresAt && (
          <div className="col-span-2">
            <p className="text-gray-400 text-xs">Expires</p>
            <p className="font-semibold">{formatDate(membership.expiresAt)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tier select step ─────────────────────────────────────────────

function SelectTierStep({
  membership,
  onSelect,
  onBack,
}: {
  membership: MembershipLookupResult;
  onSelect: (slug: string) => void;
  onBack: () => void;
}) {
  const upgradeOptions = UPGRADE_PATHS[membership.tierSlug] ?? [];
  const [error, setError] = useState('');

  function handleSelect(slug: string) {
    setError('');
    if (membership.cardStatus !== 'active') {
      setError('Only active memberships can be upgraded.');
      return;
    }
    onSelect(slug);
  }

  return (
    <div className="space-y-5">
      <MembershipCard membership={membership} />

      {membership.cardStatus !== 'active' && (
        <Alert
          variant="error"
          title="Upgrade not available"
          message={`Your membership card status is "${membership.cardStatus}". Only active memberships can be upgraded.`}
        />
      )}

      {upgradeOptions.length === 0 && membership.cardStatus === 'active' && (
        <Alert
          variant="info"
          title="Already on top tier"
          message="You are already on the Enterprise tier. No further upgrades are available."
        />
      )}

      {upgradeOptions.length > 0 && membership.cardStatus === 'active' && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Select upgrade target</p>
          <div className="space-y-3">
            {upgradeOptions.map((opt) => (
              <button
                key={opt.slug}
                type="button"
                onClick={() => handleSelect(opt.slug)}
                className="w-full flex items-center justify-between px-5 py-4 border border-gray-200 rounded-xl hover:border-(--bpa-green) hover:bg-green-50 transition-colors group text-left"
              >
                <div className="flex items-center gap-3">
                  <Shield size={20} className="text-gray-300 group-hover:text-(--bpa-green)" />
                  <div>
                    <p className="font-semibold text-(--bpa-navy)">{opt.label}</p>
                    <p className="text-xs text-gray-400">Upgrade from {membership.tierName}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-(--bpa-green)" />
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <Alert variant="error" title="Cannot upgrade" message={error} />}

      <button type="button" onClick={onBack} className="text-sm text-(--bpa-green) hover:underline">
        ← Use a different membership
      </button>
    </div>
  );
}

// ─── Quote + Confirm step ─────────────────────────────────────────

function ConfirmStep({
  membership,
  targetSlug,
  onConfirmed,
  onBack,
}: {
  membership: MembershipLookupResult;
  targetSlug: string;
  onConfirmed: (result: UpgradeRequestResponse) => void;
  onBack: () => void;
}) {
  const [quote, setQuote] = useState<UpgradeQuoteResponse | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState('');

  // Fetch quote on mount
  useState(() => {
    setQuoteLoading(true);
    getUpgradeQuote({ purchaseId: membership.purchaseId, toTierSlug: targetSlug })
      .then(setQuote)
      .catch((err) => setQuoteError(err instanceof Error ? err.message : 'Could not fetch upgrade quote.'))
      .finally(() => setQuoteLoading(false));
  });

  async function handleConfirm() {
    if (!quote) return;
    setConfirmError('');
    setConfirming(true);
    try {
      const result = await requestUpgrade({ purchaseId: membership.purchaseId, toTierSlug: targetSlug });
      onConfirmed(result);
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : 'Upgrade request failed. Please try again.');
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="space-y-5">
      <MembershipCard membership={membership} />

      {quoteLoading && (
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <div className="animate-pulse text-sm text-gray-400">Calculating upgrade cost…</div>
        </div>
      )}

      {quoteError && <Alert variant="error" title="Quote failed" message={quoteError} />}

      {quote && !quoteLoading && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-3">
          <p className="font-bold text-(--bpa-navy)">Upgrade Summary</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Current tier</span>
              <span className="font-semibold">{quote.currentTier.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Upgrading to</span>
              <span className="font-semibold text-(--bpa-green)">{quote.targetTier.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Already paid</span>
              <span className="font-semibold">৳{Number(quote.originalPaidAmount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Target tier price</span>
              <span className="font-semibold">৳{Number(quote.targetCurrentPrice).toLocaleString()}</span>
            </div>
            <div className="border-t border-green-200 pt-2 flex justify-between items-center">
              <span className="text-gray-700 font-semibold">Amount payable now</span>
              <span className="text-2xl font-bold text-(--bpa-green)">৳{Number(quote.upgradeAmount).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {confirmError && <Alert variant="error" title="Upgrade failed" message={confirmError} />}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:border-gray-400 transition-colors"
        >
          Back
        </button>
        <Button
          type="button"
          size="lg"
          loading={confirming}
          disabled={!quote || quoteLoading || confirming}
          className="flex-[2]"
          onClick={handleConfirm}
        >
          Confirm Upgrade <ArrowRight size={16} className="inline ml-1" />
        </Button>
      </div>
    </div>
  );
}

// ─── MFS payment screen ───────────────────────────────────────────

function MfsPaymentScreen({
  upgradeResult,
  mfs,
  purchaseId,
  onSubmitted,
}: {
  upgradeResult: UpgradeRequestResponse;
  mfs: MfsInstructions;
  purchaseId: string;
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
      await submitUpgradeTransaction({
        upgradeId: upgradeResult.upgradeId,
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
        <p className="text-sm text-gray-600">{mfs.instructionsEn || 'Send the exact amount via MFS to the number below.'}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Amount to Send</span>
          <span className="text-xl font-bold text-(--bpa-green)">৳{Number(upgradeResult.amount).toLocaleString()}</span>
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
          <p className="text-xs text-gray-400 mt-1">Find this in your MFS app SMS or transaction history.</p>
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
      <h3 className="text-xl font-bold text-(--bpa-navy)">Upgrade Payment Submitted!</h3>
      <p className="text-gray-500 max-w-sm mx-auto">
        Your upgrade payment is under review. We will upgrade your membership within 24–48 hours after verification.
      </p>
      <a
        href={`/community-pet-care/membership/status/${purchaseId}`}
        className="inline-block mt-4 px-6 py-2.5 bg-(--bpa-green) text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
      >
        View Membership Status
      </a>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────

export default function MembershipUpgradeFlow({ initialToken }: { initialToken?: string }) {
  const [step, setStep] = useState<Step>('lookup');
  const [membership, setMembership] = useState<MembershipLookupResult | null>(null);
  const [targetSlug, setTargetSlug] = useState('');
  const [upgradeResult, setUpgradeResult] = useState<UpgradeRequestResponse | null>(null);
  const [tokenLookupLoading, setTokenLookupLoading] = useState(!!initialToken);
  const [tokenLookupError, setTokenLookupError] = useState('');

  // Auto-lookup when a token is passed via URL
  // Both tokenLookupLoading and tokenLookupError are pre-initialized; no setState in effect body needed
  useEffect(() => {
    if (!initialToken) return;
    lookupMembership({ token: initialToken })
      .then((result) => {
        setMembership(result);
        setStep('select-tier');
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : '';
        setTokenLookupError(
          msg.includes('not found') || msg.includes('404')
            ? 'Membership card not found for this token. Please use your card number and mobile instead.'
            : 'Could not verify your membership automatically. Please use the lookup form below.',
        );
      })
      .finally(() => setTokenLookupLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFound(result: MembershipLookupResult) {
    setMembership(result);
    setStep('select-tier');
  }

  function handleSelectTier(slug: string) {
    setTargetSlug(slug);
    setStep('confirm');
  }

  function handleConfirmed(result: UpgradeRequestResponse) {
    setUpgradeResult(result);
    if (result.paymentMode === 'manual' && result.mfs) {
      setStep('mfs');
    } else if (result.redirectUrl) {
      try {
        assertSafePaymentUrl(result.redirectUrl);
        setStep('redirecting');
        window.location.assign(result.redirectUrl);
      } catch {
        setStep('mfs');
      }
    } else {
      setStep('mfs');
    }
  }

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

  if (step === 'submitted' && membership) {
    return <SubmittedScreen purchaseId={membership.purchaseId} />;
  }

  if (step === 'mfs' && upgradeResult?.mfs && membership) {
    return (
      <MfsPaymentScreen
        upgradeResult={upgradeResult}
        mfs={upgradeResult.mfs}
        purchaseId={membership.purchaseId}
        onSubmitted={() => setStep('submitted')}
      />
    );
  }

  if (step === 'confirm' && membership && targetSlug) {
    return (
      <ConfirmStep
        membership={membership}
        targetSlug={targetSlug}
        onConfirmed={handleConfirmed}
        onBack={() => setStep('select-tier')}
      />
    );
  }

  if (step === 'select-tier' && membership) {
    return (
      <SelectTierStep
        membership={membership}
        onSelect={handleSelectTier}
        onBack={() => setStep('lookup')}
      />
    );
  }

  // Auto-lookup in progress
  if (tokenLookupLoading) {
    return (
      <div className="text-center py-16 space-y-3">
        <svg className="animate-spin h-8 w-8 mx-auto text-(--bpa-green)" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm text-gray-500">Looking up your membership…</p>
      </div>
    );
  }

  // lookup step (manual form — shown when no token or token lookup failed)
  return (
    <div className="space-y-6">
      {tokenLookupError ? (
        <Alert variant="error" title="Auto-lookup failed" message={tokenLookupError} />
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <AlertCircle size={18} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            Enter your card number and registered mobile to find your membership, then select the tier you want to upgrade to.
          </p>
        </div>
      )}
      <LookupStep onFound={handleFound} />
    </div>
  );
}
