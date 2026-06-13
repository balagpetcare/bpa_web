'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Alert from '@/components/ui/Alert';
import { CheckCircle, CreditCard } from 'lucide-react';
import { assertSafePaymentUrl } from '@/lib/utils/payment-redirect';

const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().max(20).optional(),
});

type FormData = z.infer<typeof schema>;

interface EventRegistrationFormProps {
  eventId: string;
  capacity: number | null;
  registrationCount: number;
  isPaid?: boolean;
  fee?: string | null;
}

export default function EventRegistrationForm({
  eventId,
  capacity,
  registrationCount,
  isPaid = false,
  fee,
}: EventRegistrationFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const spotsLeft = capacity != null ? capacity - registrationCount : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const res = await fetch(`${API_ORIGIN}/api/v1/events/public/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json?.message ?? 'Registration failed. Please try again.');
        return;
      }

      const result = json?.data ?? json;

      // Paid event — validate gateway URL then redirect to EPS
      if (result.requiresPayment && result.redirectUrl) {
        assertSafePaymentUrl(result.redirectUrl);
        setRedirecting(true);
        window.location.href = result.redirectUrl;
        return;
      }

      setSubmitted(true);
    } catch {
      setServerError('Unable to reach the server. Please check your connection and try again.');
    }
  };

  if (redirecting) {
    return (
      <div className="text-center py-8">
        <svg className="animate-spin h-8 w-8 mx-auto text-(--bpa-green) mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="font-semibold text-(--bpa-navy)">Redirecting to payment…</p>
        <p className="text-sm text-gray-500 mt-1">Please do not close this window.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <CheckCircle size={48} className="mx-auto text-(--bpa-green) mb-4" />
        <h3 className="text-lg font-bold text-(--bpa-navy) mb-2">You&apos;re registered!</h3>
        <p className="text-sm text-gray-500">
          We&apos;ll send a confirmation to your email address shortly.
        </p>
      </div>
    );
  }

  if (isFull) {
    return (
      <Alert
        variant="warning"
        message="This event is fully booked. Check back later for cancellations."
        className="text-center"
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {spotsLeft !== null && (
        <p className="text-sm text-(--bpa-navy) font-medium">
          {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} remaining
        </p>
      )}

      {serverError && <Alert variant="error" message={serverError} />}

      <FormField label="Full Name" error={errors.name?.message} required>
        <input
          {...register('name')}
          type="text"
          placeholder="Your full name"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green) focus:border-transparent"
        />
      </FormField>

      <FormField label="Email Address" error={errors.email?.message} required>
        <input
          {...register('email')}
          type="email"
          placeholder="you@example.com"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green) focus:border-transparent"
        />
      </FormField>

      <FormField label="Phone Number" error={errors.phone?.message}>
        <input
          {...register('phone')}
          type="tel"
          placeholder="+880 17xx xxxxxx"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green) focus:border-transparent"
        />
      </FormField>

      {/* Paid event fee notice */}
      {isPaid && fee && (
        <div className="bg-(--bpa-navy)/10 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CreditCard size={20} className="text-(--bpa-green) shrink-0" />
          <div>
            <p className="text-sm font-semibold text-(--bpa-navy)">Registration fee: ৳{Number(fee).toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              You will be redirected to EPS payment gateway after submitting this form.
            </p>
          </div>
        </div>
      )}

      <Button type="submit" loading={isSubmitting} className="w-full">
        {isPaid && fee ? 'Register & Pay' : 'Register for this Event'}
      </Button>
    </form>
  );
}
