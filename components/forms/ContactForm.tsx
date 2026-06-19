'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FormField from '@/components/ui/FormField';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { getContactInquiryConfig, submitContactInquiry } from '@/lib/api/contact-inquiry';
import type { ContactInquiryConfig } from '@/lib/api/contact-inquiry';

const schema = z.object({
  contactTypeId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required').max(120),
  email: z.string().email('Invalid email address').max(255),
  phone: z.string().max(30).optional(),
  whatsapp: z.string().max(30).optional(),
  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  organizationName: z.string().max(255).optional(),
  designation: z.string().max(120).optional(),
  website: z
    .string()
    .max(500)
    .optional()
    .refine((v) => !v || v.startsWith('http://') || v.startsWith('https://'), { message: 'Enter a valid URL (https://...)' }),
  subject: z.string().min(1, 'Subject is required').max(500),
  message: z.string().min(10, 'Message must be at least 10 characters').max(10000),
  consentGiven: z.boolean().refine((v) => v === true, { message: 'You must agree to the privacy policy to submit' }),
});

type FormValues = z.infer<typeof schema>;
type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [config, setConfig] = useState<ContactInquiryConfig | null>(null);
  const [ticketNumber, setTicketNumber] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { consentGiven: false },
  });

  useEffect(() => {
    getContactInquiryConfig()
      .then((res) => setConfig(res.data ?? null))
      .catch(() => null);
  }, []);

  const onSubmit = async (data: FormValues) => {
    setStatus('submitting');
    try {
      const res = await submitContactInquiry(data);
      setTicketNumber(res.data?.ticketNumber ?? '');
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
        title="Inquiry Submitted!"
        message={`Thank you for reaching out. Your ticket number is ${ticketNumber}. We will get back to you within 1–2 business days.`}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {status === 'error' && <Alert variant="error" title="Submission failed" message={errorMsg} />}

      {/* Contact Type + Category */}
      {config && (config.types.length > 0 || config.categories.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-5">
          {config.types.length > 0 && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Contact Type</label>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green) bg-white"
                {...register('contactTypeId')}
              >
                <option value="">Select type...</option>
                {config.types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.labelEn}
                  </option>
                ))}
              </select>
              {errors.contactTypeId && <p className="text-xs text-red-500">{errors.contactTypeId.message}</p>}
            </div>
          )}
          {config.categories.length > 0 && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green) bg-white"
                {...register('categoryId')}
              >
                <option value="">Select category...</option>
                {config.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.labelEn}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId.message}</p>}
            </div>
          )}
        </div>
      )}

      {/* Name + Email */}
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

      {/* Phone + WhatsApp */}
      <div className="grid sm:grid-cols-2 gap-5">
        <FormField
          label="Phone Number"
          type="tel"
          placeholder="+880 1xxx-xxxxxx"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <FormField
          label="WhatsApp Number"
          type="tel"
          placeholder="+880 1xxx-xxxxxx"
          error={errors.whatsapp?.message}
          {...register('whatsapp')}
        />
      </div>

      {/* Country + City */}
      <div className="grid sm:grid-cols-2 gap-5">
        <FormField
          label="Country"
          placeholder="Bangladesh"
          error={errors.country?.message}
          {...register('country')}
        />
        <FormField
          label="City"
          placeholder="Dhaka"
          error={errors.city?.message}
          {...register('city')}
        />
      </div>

      {/* Subject */}
      <FormField
        label="Subject"
        required
        placeholder="Brief subject of your inquiry"
        error={errors.subject?.message}
        {...register('subject')}
      />

      {/* Advanced (optional org/professional info) */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="text-xs text-(--bpa-green) font-medium hover:underline mb-3 block"
        >
          {showAdvanced ? '− Hide' : '+ Add'} organization / professional details (optional)
        </button>

        {showAdvanced && (
          <div className="space-y-5 bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="grid sm:grid-cols-2 gap-5">
              <FormField
                label="Organization Name"
                placeholder="Your company or NGO"
                error={errors.organizationName?.message}
                {...register('organizationName')}
              />
              <FormField
                label="Designation"
                placeholder="Your job title"
                error={errors.designation?.message}
                {...register('designation')}
              />
            </div>
            <FormField
              label="Website"
              type="url"
              placeholder="https://yourwebsite.com"
              error={errors.website?.message}
              {...register('website')}
            />
          </div>
        )}
      </div>

      {/* Message */}
      <FormField
        label="Message"
        as="textarea"
        required
        rows={6}
        placeholder="Write your inquiry in detail..."
        error={errors.message?.message}
        {...register('message')}
      />

      {/* Consent */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="consentGiven"
          className="mt-0.5 w-4 h-4 accent-(--bpa-green) shrink-0 cursor-pointer"
          {...register('consentGiven')}
        />
        <label htmlFor="consentGiven" className="text-sm text-gray-600 cursor-pointer">
          I agree that BPA may use the information provided to respond to my inquiry. I have read and accept the{' '}
          <a href="/privacy-policy" className="text-(--bpa-green) underline hover:opacity-80">
            Privacy Policy
          </a>
          .
        </label>
      </div>
      {errors.consentGiven && <p className="text-xs text-red-500 -mt-3">{errors.consentGiven.message}</p>}

      <Button type="submit" size="lg" loading={status === 'submitting'} className="w-full sm:w-auto">
        Send Inquiry
      </Button>
    </form>
  );
}
