'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Info } from 'lucide-react';
import FormField from '@/components/ui/FormField';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { initiateContribution } from '@/lib/api/contributions';
import { getPublicZones, getPublicPlans } from '@/lib/api/community-care';
import { assertSafePaymentUrl } from '@/lib/utils/payment-redirect';
import type { CommunityZonePublic, ContributionPlanPublic } from '@/types/bpa.types';

const BD_PHONE = /^(\+8801|01)[3-9]\d{8}$/;

const schema = z.object({
  contributorName: z.string().min(1, 'Full name is required').max(120),
  contributorMobile: z.string().regex(BD_PHONE, 'Enter a valid BD mobile number (e.g. 01xxxxxxxxx)'),
  contributorEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  contributorAddress: z.string().max(300).optional().or(z.literal('')),
  zoneId: z.string().min(1, 'Please select a zone'),
  planId: z.string().min(1, 'Please select a plan'),
  isAnonymous: z.boolean().optional(),
  disclaimerConsent: z.literal(true, { message: 'You must acknowledge the disclaimer' }),
  hasConsented: z.literal(true, { message: 'You must consent to proceed' }),
});

type FormValues = z.infer<typeof schema>;

const LEGAL_DISCLAIMER =
  'Care Partner Card is a contribution recognition and service benefit card only. ' +
  'It is not ownership, share, profit-sharing, investment, or financial return. ' +
  'Product, medicine, food, accessories, and third-party cost discounts are not guaranteed.';

interface Props {
  defaultZoneId?: string;
}

export default function ContributionForm({ defaultZoneId }: Props) {
  const [zones, setZones] = useState<CommunityZonePublic[]>([]);
  const [plans, setPlans] = useState<ContributionPlanPublic[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    Promise.all([getPublicZones(), getPublicPlans()])
      .then(([z, p]) => { setZones(z); setPlans(p); })
      .catch(() => {});
  }, []);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { zoneId: defaultZoneId ?? '', planId: '' },
  });

  const selectedPlanId = watch('planId');
  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  const onSubmit = async (data: FormValues) => {
    setErrorMsg('');
    try {
      const result = await initiateContribution({
        planId: data.planId,
        zoneId: data.zoneId,
        contributorName: data.contributorName,
        contributorMobile: data.contributorMobile,
        contributorEmail: data.contributorEmail || undefined,
        contributorAddress: data.contributorAddress || undefined,
        isAnonymous: data.isAnonymous ?? false,
      });
      assertSafePaymentUrl(result.paymentUrl);
      setRedirecting(true);
      window.location.href = result.paymentUrl;
    } catch (err) {
      setRedirecting(false);
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {errorMsg && <Alert variant="error" title="Submission failed" message={errorMsg} />}

      {/* Zone select */}
      <FormField label="Zone" required as="select" error={errors.zoneId?.message} {...register('zoneId')}>
        <option value="">Select your zone</option>
        {zones.filter((z) => z.status === 'active').map((z) => (
          <option key={z.id} value={z.id}>
            {z.name} — {z.city}, {z.district} ({z.currentContributors.toLocaleString()} / {z.targetContributors.toLocaleString()} contributors)
          </option>
        ))}
      </FormField>

      {/* Plan select */}
      <FormField label="Contribution Plan" required as="select" error={errors.planId?.message} {...register('planId')}>
        <option value="">Select a plan</option>
        {plans.map((p) => (
          <option key={p.id} value={p.id}>
            {p.title} — ৳{Number(p.amountBdt).toLocaleString()}
          </option>
        ))}
      </FormField>

      <div className="grid sm:grid-cols-2 gap-5">
        <FormField
          label="Full Name"
          required
          placeholder="Your full name"
          error={errors.contributorName?.message}
          {...register('contributorName')}
        />
        <FormField
          label="Mobile Number"
          type="tel"
          required
          placeholder="01xxxxxxxxx"
          error={errors.contributorMobile?.message}
          {...register('contributorMobile')}
        />
      </div>

      <FormField
        label="Email Address"
        type="email"
        placeholder="your@email.com (optional)"
        error={errors.contributorEmail?.message}
        {...register('contributorEmail')}
      />

      <FormField
        label="Address"
        as="textarea"
        rows={2}
        placeholder="Your address (optional)"
        error={errors.contributorAddress?.message}
        {...register('contributorAddress')}
      />

      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" className="w-4 h-4 rounded" {...register('isAnonymous')} />
        <span className="text-sm text-gray-600">Show my contribution as anonymous on public reports</span>
      </label>

      {/* Payment summary */}
      {selectedPlan && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold text-(--bpa-navy)">{selectedPlan.title}</p>
            <p className="text-2xl font-bold text-(--bpa-green)">৳{Number(selectedPlan.amountBdt).toLocaleString()}</p>
          </div>
          {selectedPlan.benefitsSummaryJson && selectedPlan.benefitsSummaryJson.length > 0 && (
            <ul className="mt-3 space-y-1">
              {selectedPlan.benefitsSummaryJson.map((b) => (
                <li key={b} className="text-xs text-gray-600 flex items-start gap-1.5">
                  <span className="text-(--bpa-green) font-bold mt-0.5">✓</span> {b}
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-gray-400 mt-3">You will be securely redirected to the EPS payment gateway.</p>
        </div>
      )}

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

      {/* General consent */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          className="w-4 h-4 rounded mt-0.5 shrink-0"
          {...register('hasConsented')}
        />
        <span className="text-sm text-gray-600 leading-relaxed">
          I consent to BPA collecting and storing my information to process my contribution and issue a Care Partner Card.
        </span>
      </label>
      {errors.hasConsented && (
        <p className="text-xs text-red-600 -mt-4">{errors.hasConsented.message}</p>
      )}

      <Button
        type="submit"
        size="lg"
        loading={isSubmitting || redirecting}
        className="w-full"
        disabled={plans.length === 0 || zones.length === 0}
      >
        Proceed to Payment
      </Button>
    </form>
  );
}
