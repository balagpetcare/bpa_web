'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FormField from '@/components/ui/FormField';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { submitVolunteerForm } from '@/lib/api/forms';

const AREAS = [
  'Animal Rescue & Rehabilitation',
  'Veterinary Assistance',
  'Community Education & Outreach',
  'Event Management',
  'Fundraising & Sponsorship',
  'Social Media & Communications',
  'Legal & Advocacy',
  'Administrative Support',
  'Other',
];

const AVAILABILITY_OPTIONS = [
  'Weekdays (full-time)',
  'Weekdays (part-time)',
  'Weekends only',
  'Flexible / As needed',
];

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(20).optional(),
  areaOfInterest: z.string().optional(),
  availability: z.string().optional(),
  message: z.string().max(3000).optional(),
});

type FormValues = z.infer<typeof schema>;
type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function VolunteerForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setStatus('submitting');
    try {
      await submitVolunteerForm(data);
      setStatus('success');
      reset();
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <Alert
        variant="success"
        title="Application Submitted!"
        message="Thank you for your interest in volunteering with BPA. We'll review your application and contact you soon."
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {status === 'error' && (
        <Alert variant="error" title="Submission failed" message={errorMsg} />
      )}

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

      <div className="grid sm:grid-cols-2 gap-5">
        <FormField
          label="Phone Number"
          type="tel"
          placeholder="+880 1xxx-xxxxxx"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <FormField
          label="Area of Interest"
          as="select"
          error={errors.areaOfInterest?.message}
          {...register('areaOfInterest')}
        >
          <option value="">Select an area...</option>
          {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
        </FormField>
      </div>

      <FormField
        label="Availability"
        as="select"
        error={errors.availability?.message}
        {...register('availability')}
      >
        <option value="">Select availability...</option>
        {AVAILABILITY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
      </FormField>

      <FormField
        label="Why do you want to volunteer?"
        as="textarea"
        rows={4}
        placeholder="Tell us about your motivation and any relevant experience..."
        error={errors.message?.message}
        {...register('message')}
      />

      <Button type="submit" size="lg" loading={status === 'submitting'} className="w-full sm:w-auto">
        Submit Application
      </Button>
    </form>
  );
}
