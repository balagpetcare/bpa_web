'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FormField from '@/components/ui/FormField';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { initiateMembershipPayment } from '@/lib/api/forms';
import { assertSafePaymentUrl } from '@/lib/utils/payment-redirect';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required').max(20),
  membershipType: z.enum(['regular', 'student', 'corporate'], {
    error: 'Please select a membership type',
  }),
  message: z.string().max(2000).optional(),
});

type FormValues = z.infer<typeof schema>;

const MEMBERSHIP_TYPES = [
  { value: 'regular',   label: 'Regular Member',   price: '৳500/year',   desc: 'For individual pet owners and animal lovers' },
  { value: 'student',   label: 'Student Member',   price: '৳200/year',   desc: 'For full-time students with valid ID' },
  { value: 'corporate', label: 'Corporate Member', price: '৳5,000/year', desc: 'For pet businesses and organisations' },
] as const;

export default function MembershipForm() {
  const [errorMsg, setErrorMsg] = useState('');
  const [redirecting, setRedirecting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const selectedType = watch('membershipType');
  const selectedInfo = MEMBERSHIP_TYPES.find((t) => t.value === selectedType);

  const onSubmit = async (data: FormValues) => {
    setErrorMsg('');
    try {
      const result = await initiateMembershipPayment(data);
      assertSafePaymentUrl(result.redirectUrl);
      setRedirecting(true);
      window.location.href = result.redirectUrl;
    } catch (err) {
      setRedirecting(false);
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  if (redirecting) {
    return (
      <div className="text-center py-12">
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
      {errorMsg && (
        <Alert variant="error" title="Submission failed" message={errorMsg} />
      )}

      {/* Membership type selector */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">
          Membership Type <span className="text-red-500">*</span>
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {MEMBERSHIP_TYPES.map((type) => (
            <label
              key={type.value}
              className={[
                'flex flex-col gap-1 rounded-xl border-2 p-4 cursor-pointer transition-colors',
                selectedType === type.value
                  ? 'border-(--bpa-navy) bg-(--bpa-green)'
                  : 'border-gray-200 hover:border-gray-300',
              ].join(' ')}
            >
              <input type="radio" value={type.value} {...register('membershipType')} className="sr-only" />
              <span className="font-semibold text-(--bpa-navy) text-sm">{type.label}</span>
              <span className="text-(--bpa-green) font-bold text-base">{type.price}</span>
              <span className="text-xs text-gray-500 leading-relaxed">{type.desc}</span>
            </label>
          ))}
        </div>
        {errors.membershipType && (
          <p className="text-xs text-red-600 mt-1.5">{errors.membershipType.message}</p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <FormField
          label="Full Name"
          required
          placeholder="Your full name"
          error={errors.name?.message}
          {...register('name')}
        />
        <FormField
          label="Email Address"
          type="email"
          required
          placeholder="your@email.com"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      <FormField
        label="Phone Number"
        type="tel"
        required
        placeholder="01xxx-xxxxxx"
        error={errors.phone?.message}
        {...register('phone')}
      />

      <FormField
        label="Additional Notes"
        as="textarea"
        rows={3}
        placeholder="Any questions or additional information..."
        error={errors.message?.message}
        {...register('message')}
      />

      {/* Payment summary */}
      {selectedInfo && (
        <div className="bg-(--bpa-navy)/10 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-(--bpa-navy)">{selectedInfo.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">Annual membership — Bangladesh Pet Association</p>
            </div>
            <p className="text-xl font-bold text-(--bpa-green)">{selectedInfo.price}</p>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            You will be securely redirected to EPS payment gateway to complete your payment.
          </p>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        loading={isSubmitting || redirecting}
        className="w-full sm:w-auto"
      >
        Proceed to Payment
      </Button>
    </form>
  );
}
