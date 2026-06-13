'use client';

import { Suspense } from 'react';
import RegistrationFormWrapper from '@/components/campaigns/RegistrationFormWrapper';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-2 border-(--bpa-green) border-t-transparent" /></div>}>
      <RegistrationFormWrapper />
    </Suspense>
  );
}
