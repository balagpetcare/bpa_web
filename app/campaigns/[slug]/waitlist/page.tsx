'use client';

import { Suspense } from 'react';
import WaitlistFormWrapper from '@/components/campaigns/WaitlistFormWrapper';

export default function WaitlistPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-2 border-(--bpa-green) border-t-transparent" /></div>}>
      <WaitlistFormWrapper />
    </Suspense>
  );
}
