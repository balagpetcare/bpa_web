'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle, ChevronRight, ChevronLeft, User, Dog, Heart, ClipboardList } from 'lucide-react';
import FormField from '@/components/ui/FormField';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import LocationSelector, { type LocationValue } from '@/components/location/LocationSelector';
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

const STEPS = [
  { id: 'personal', label: 'Contact', icon: User },
  { id: 'pets', label: 'Pets', icon: Dog },
  { id: 'interests', label: 'Signals', icon: Heart },
];

export default function PetCensusForm() {
  const [zones, setZones] = useState<CommunityZonePublic[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [carePartnerInterested, setCarePartnerInterested] = useState(false);
  const [duplicateHint, setDuplicateHint] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [locationValue, setLocationValue] = useState<LocationValue>({});

  useEffect(() => {
    getPublicZones().then(setZones).catch(() => {});
  }, []);

  const { register, handleSubmit, trigger, formState: { errors, isSubmitting } } = useForm<FormValues>({
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
        ...data,
        email: data.email || undefined,
        address: data.address || undefined,
        zoneId: data.zoneId || undefined,
        area: data.area || undefined,
        breed: data.breed || undefined,
        notes: data.notes || undefined,
        ...locationValue,
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

  const nextStep = async () => {
    const fieldsByStep: (keyof FormValues)[][] = [
      ['ownerName', 'mobile', 'email', 'zoneId', 'area'],
      ['petType', 'petCount', 'breed', 'address'],
      ['consent'],
    ];

    const isStepValid = await trigger(fieldsByStep[currentStep]);
    if (isStepValid) {
      setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 400, behavior: 'smooth' });
      }
    }
  };

  const prevStep = () => {
    setCurrentStep((s) => Math.max(s - 1, 0));
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-16 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <CheckCircle size={56} className="text-(--bpa-green)" />
        </div>
        <h2 className="text-3xl font-bold text-(--bpa-navy) mb-4">Registration Successful</h2>
        <p className="text-gray-500 leading-relaxed max-w-md mx-auto text-lg">
          Thank you for contributing to the 2026 Pet Census. Your information helps BPA build better
          veterinary infrastructure for Dhaka.
        </p>
        
        {duplicateHint && (
          <div className="mt-8 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-2xl p-5 max-w-md mx-auto">
            <p className="font-semibold mb-1">Entry Received</p>
            We noticed a similar recent submission from your contact. We have still recorded this entry for review.
          </div>
        )}

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          {carePartnerInterested ? (
            <Link
              href="/community-pet-care/contribute"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-(--bpa-green) px-8 py-4 text-base font-bold text-white hover:bg-[#145530] transition-colors shadow-lg shadow-green-900/10"
            >
              Become a Care Partner
            </Link>
          ) : (
            <Link
              href="/community-pet-care"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-(--bpa-navy) px-8 py-4 text-base font-bold text-white hover:opacity-90 transition-opacity"
            >
              Explore Community Care
            </Link>
          )}
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto text-gray-400 hover:text-gray-600 font-medium px-8 py-4"
          >
            Register another pet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Stepper */}
      <div className="mb-12">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-(--bpa-green) -translate-y-1/2 z-0 transition-all duration-500 ease-in-out" 
            style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
          />
          
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx <= currentStep;
            const isCurrent = idx === currentStep;
            
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center group">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCurrent ? 'bg-(--bpa-green) text-white ring-4 ring-green-100 scale-110' : 
                    isActive ? 'bg-(--bpa-green) text-white' : 'bg-white text-gray-300 border-2 border-gray-100'
                  }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`absolute -bottom-7 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-300 ${
                  isActive ? 'text-(--bpa-navy)' : 'text-gray-300'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-16 space-y-8 bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-xl shadow-gray-200/40">
        {errorMsg && <Alert variant="error" title="Submission failed" message={errorMsg} />}

        {/* Step 0: Personal & Location */}
        {currentStep === 0 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="mb-8">
              <h3 className="text-xl font-black text-(--bpa-navy) mb-2">Personal & Location</h3>
              <p className="text-sm text-gray-500">How can we contact you and which zone do you belong to?</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <FormField label="Full Name" required placeholder="e.g. Rahat Khan" error={errors.ownerName?.message} {...register('ownerName')} />
              <FormField label="Mobile Number" type="tel" required placeholder="017xxxxxxxx" error={errors.mobile?.message} {...register('mobile')} />
            </div>
            <FormField label="Email Address" type="email" placeholder="your@email.com (optional)" error={errors.email?.message} {...register('email')} />

            <div>
              <p className="text-sm font-semibold text-(--bpa-navy) mb-3">Location (optional)</p>
              <LocationSelector
                value={locationValue}
                onChange={setLocationValue}
                showUnion
                showWard
                showAddressLine={false}
              />
            </div>

            <FormField label="BPA Community Zone" as="select" error={errors.zoneId?.message} {...register('zoneId')}>
              <option value="">Select zone if known</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>{z.name} — {z.city}, {z.district}</option>
              ))}
            </FormField>
            <FormField
              label="Area / Locality"
              placeholder="e.g. Mirpur DOHS, Uttara Sector 4"
              error={errors.area?.message}
              {...register('area')}
            />
          </div>
        )}

        {/* Step 1: Pets & Details */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="mb-8">
              <h3 className="text-xl font-black text-(--bpa-navy) mb-2">Household Pets</h3>
              <p className="text-sm text-gray-500">Details about the animals currently in your care.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <FormField label="Primary Pet Type" as="select" required error={errors.petType?.message} {...register('petType')}>
                <option value="cat">Cat</option>
                <option value="dog">Dog</option>
                <option value="bird">Bird</option>
                <option value="other">Other</option>
              </FormField>
              <FormField label="Total Pet Count" type="number" min={1} required error={errors.petCount?.message} {...register('petCount', { valueAsNumber: true })} />
            </div>
            <FormField label="Primary Breed" placeholder="e.g. Persian, Local Mix, Golden Retriever" error={errors.breed?.message} {...register('breed')} />
            
            <FormField
              label="Address"
              as="textarea"
              rows={2}
              placeholder="Building/Road info (optional)"
              error={errors.address?.message}
              {...register('address')}
            />
          </div>
        )}

        {/* Step 2: Interests & Submission */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="mb-8">
              <h3 className="text-xl font-black text-(--bpa-navy) mb-2">Interest & Consent</h3>
              <p className="text-sm text-gray-500">Signaling your interest helps us prioritize regional services.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: 'vaccinationInterest' as const, label: 'Vaccination Campaigns' },
                { name: 'communityClinicInterest' as const, label: 'Clinic Planning' },
                { name: 'communityPetShopInterest' as const, label: 'BPA Pet Shops' },
                { name: 'carePartnerInterest' as const, label: 'Become Care Partner' },
              ].map(({ name, label }) => (
                <label key={name} className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                  <input type="checkbox" className="w-5 h-5 rounded text-(--bpa-green) focus:ring-(--bpa-green)" {...register(name)} />
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </label>
              ))}
            </div>

            <FormField
              label="Additional Notes"
              as="textarea"
              rows={3}
              placeholder="Anything else BPA should consider? (optional)"
              error={errors.notes?.message}
              {...register('notes')}
            />

            <div className="p-5 bg-green-50 rounded-2xl border border-green-100">
              <label className="flex items-start gap-4 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 rounded mt-0.5 shrink-0 text-(--bpa-green) focus:ring-(--bpa-green)" {...register('consent')} />
                <span className="text-xs sm:text-sm text-green-900 leading-relaxed font-medium">
                  I consent to BPA collecting this information for Pet Census 2026 planning and future community healthcare integration.
                </span>
              </label>
              {errors.consent && (
                <p className="text-xs text-red-600 mt-2 font-bold ml-9">{errors.consent.message}</p>
              )}
            </div>
            <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">
              Secure Submission • Not a medical record
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="pt-8 border-t border-gray-50 flex flex-col sm:flex-row gap-4 items-center">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={prevStep}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 text-sm font-bold text-gray-400 hover:text-(--bpa-navy) transition-colors"
            >
              <ChevronLeft size={18} /> Back
            </button>
          )}
          
          <div className="flex-1 w-full">
            {currentStep < STEPS.length - 1 ? (
              <Button 
                type="button" 
                onClick={nextStep} 
                size="lg" 
                className="w-full rounded-xl font-bold bg-(--bpa-navy) hover:bg-[#1a2542]"
              >
                Continue to {STEPS[currentStep + 1].label} <ChevronRight size={18} className="ml-2" />
              </Button>
            ) : (
              <Button 
                type="submit" 
                size="lg" 
                className="w-full rounded-xl font-bold bg-(--bpa-green) hover:bg-[#145530]" 
                loading={isSubmitting}
              >
                Complete Registration <ClipboardList size={18} className="ml-2" />
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
