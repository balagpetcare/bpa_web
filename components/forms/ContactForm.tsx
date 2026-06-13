'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FormField from '@/components/ui/FormField';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { submitContactForm } from '@/lib/api/forms';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(20).optional(),
  subject: z.string().max(255).optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
});

type FormValues = z.infer<typeof schema>;

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setStatus('submitting');
    try {
      await submitContactForm(data);
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
        title="Message Sent!"
        message="Thank you for reaching out. We'll get back to you within 1-2 business days."
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
          label="Subject"
          placeholder="How can we help?"
          error={errors.subject?.message}
          {...register('subject')}
        />
      </div>

      <FormField
        label="Message"
        as="textarea"
        required
        rows={5}
        placeholder="Write your message here..."
        error={errors.message?.message}
        {...register('message')}
      />

      <Button type="submit" size="lg" loading={status === 'submitting'} className="w-full sm:w-auto">
        Send Message
      </Button>
    </form>
  );
}
