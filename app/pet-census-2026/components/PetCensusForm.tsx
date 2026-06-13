'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle } from 'lucide-react';
import FormField from '@/components/ui/FormField';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { submitPetCensus } from '@/lib/api/care-card';
import { getPublicZones } from '@/lib/api/community-care';
import type { CommunityZonePublic } from '@/types/bpa.types';

const BD_PHONE = /^(\+8801|01)[3-9]\d{8}$/;

const schema = z.object({
  ownerName: z.string().min(2, 'Name is required').max(120),
  mobile: z.string().regex(BD_PHONE, 'Enter a valid BD mobile number'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  zoneId: z.string().optional(),
  area: z.string().max(200).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  petType: z.enum(['cat', 'dog', 'bird', 'other'], { message: 'Select a pet type' }),
  petCount: z.number().int().min(1, 'Enter at least one pet').max(999),
  breed: z.string().max(120).optional().or(z.literal('')),
  vaccinationInterest: z.boolean(),
  communityClinicInterest: z.boolean(),
  communityPetShopInterest: z.boolean(),
  carePartnerInterest: z.boolean(),
  notes: z.string().max(2000).optional().or(z.literal('')),
  consent: z.literal(true, { message: 'You must provide consent to submit' }),
});

type FormValues = z.infer<typeof schema>;

export default function PetCensusForm() {
  const [zones, setZones] = useState<CommunityZonePublic[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [carePartnerInterested, setCarePartnerInterested] = useState(false);
  const [duplicateHint, setDuplicateHint] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    getPublicZones().then(setZones).catch(() => {});
  }, []);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      petType: 'cat',
      petCount: 1,
      vaccinationInterest: false,
      communityClinicInterest: false,
      communityPetShopInterest: false,
      carePartnerInterest: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setErrorMsg('');
    try {
      const result = await submitPetCensus({
        ownerName: data.ownerName,
        mobile: data.mobile,
        email: data.email || undefined,
        address: data.address || undefined,
        zoneId: data.zoneId || undefined,
        area: data.area || undefined,
        petType: data.petType,
        petCount: data.petCount,
        breed: data.breed || undefined,
        vaccinationInterest: data.vaccinationInterest,
        communityClinicInterest: data.communityClinicInterest,
        communityPetShopInterest: data.communityPetShopInterest,
        carePartnerInterest: data.carePartnerInterest,
        notes: data.notes || undefined,
        consent: true,
        source: 'PET_CENSUS_2026',
        sourceRoute: '/pet-census-2026',
      });
      setCarePartnerInterested(data.carePartnerInterest);
      setDuplicateHint(Boolean(result.duplicateHint?.possibleDuplicate));
      setSubmitted(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} className="text-(--bpa-green)" />
        </div>
        <h2 className="text-2xl font-bold text-(--bpa-navy) mb-3">Thank you for contributing to the census.</h2>
        <p className="text-gray-500 leading-relaxed max-w-md mx-auto">
          Your information will help BPA estimate community pet care needs, awareness priorities,
          vaccination campaign interest, and future Pet Smart Solution planning.
        </p>
        {duplicateHint && (
          <p className="mt-4 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3">
            We noticed a similar recent submission. We still saved this entry so BPA can review it gently.
          </p>
        )}
        {carePartnerInterested && (
          <div className="mt-6">
            <Link
              href="/community-pet-care/contribute"
              className="inline-flex items-center justify-center rounded-lg bg-(--bpa-green) px-5 py-3 text-sm font-semibold text-white hover:bg-(--bpa-green)"
            >
              Contribute ৳3,000 as a Care Partner
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {errorMsg && <Alert variant="error" title="Submission failed" message={errorMsg} />}

      <div className="grid sm:grid-cols-2 gap-5">
        <FormField label="Owner Name" required placeholder="Full name" error={errors.ownerName?.message} {...register('ownerName')} />
        <FormField label="Mobile Number" type="tel" required placeholder="01xxxxxxxxx" error={errors.mobile?.message} {...register('mobile')} />
      </div>

      <FormField label="Email Address" type="email" placeholder="your@email.com (optional)" error={errors.email?.message} {...register('email')} />

      <FormField label="Community Zone" as="select" error={errors.zoneId?.message} {...register('zoneId')}>
        <option value="">Select zone if known</option>
        {zones.map((z) => (
          <option key={z.id} value={z.id}>{z.name} - {z.city}, {z.district}</option>
        ))}
      </FormField>

      <FormField
        label="Area / Locality"
        placeholder="e.g. Mirpur DOHS, Uttara Sector 4 (optional)"
        error={errors.area?.message}
        {...register('area')}
      />

      <FormField
        label="Address"
        as="textarea"
        rows={2}
        placeholder="Your address (optional)"
        error={errors.address?.message}
        {...register('address')}
      />

      <div className="grid sm:grid-cols-2 gap-5">
        <FormField label="Pet Type" as="select" required error={errors.petType?.message} {...register('petType')}>
          <option value="cat">Cat</option>
          <option value="dog">Dog</option>
          <option value="bird">Bird</option>
          <option value="other">Other</option>
        </FormField>
        <FormField label="Pet Count" type="number" min={1} required error={errors.petCount?.message} {...register('petCount', { valueAsNumber: true })} />
      </div>

      <FormField label="Breed" placeholder="Breed or mix (optional)" error={errors.breed?.message} {...register('breed')} />

      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Interest signals</p>
        <div className="space-y-2.5">
          {[
            { name: 'vaccinationInterest' as const, label: 'Vaccination campaigns' },
            { name: 'communityClinicInterest' as const, label: 'Community clinic planning' },
            { name: 'communityPetShopInterest' as const, label: 'Community pet shop planning' },
            { name: 'carePartnerInterest' as const, label: 'Care Partner contribution of ৳3,000' },
          ].map(({ name, label }) => (
            <label key={name} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded" {...register(name)} />
              <span className="text-sm text-gray-600">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <FormField
        label="Notes"
        as="textarea"
        rows={3}
        placeholder="Anything BPA should consider for planning or awareness? (optional)"
        error={errors.notes?.message}
        {...register('notes')}
      />

      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" className="w-4 h-4 rounded mt-0.5 shrink-0" {...register('consent')} />
        <span className="text-sm text-gray-600 leading-relaxed">
          I consent to BPA collecting this information for Pet Census 2026 planning, awareness,
          vaccination campaign interest assessment, and future Pet Smart Solution integration signals.
        </span>
      </label>
      {errors.consent && (
        <p className="text-xs text-red-600 -mt-4">{errors.consent.message}</p>
      )}

      <p className="text-xs text-gray-500 leading-relaxed">
        This submission is not a medical request, clinic booking, treatment promise, or patient record.
      </p>

      <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
        Submit Pet Census Information
      </Button>
    </form>
  );
}
