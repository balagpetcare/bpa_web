'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { getSafeReturnTo, storeReturnToForRedirectFlow, withReturnTo } from '@/lib/auth/return-to';
import { buildCentralAuthStartUrl } from '@/lib/auth/central-auth';

function SignInContent() {
  const searchParams = useSearchParams();
  const next = getSafeReturnTo(searchParams.get('next'));
  const startUrl = buildCentralAuthStartUrl(next);

  return (
    <div className="rounded-[2rem] border border-gray-200 bg-white/90 shadow-xl shadow-gray-200/50 p-8 sm:p-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700 mb-5">
          <ShieldCheck className="h-4 w-4" />
          WPA Central Authentication
        </div>
        <h1 className="text-3xl font-bold text-(--bpa-navy) mb-3">Sign In To Bangladesh Pet Association</h1>
        <p className="text-gray-600 leading-7">
          BPA uses WPA Central Auth as its single sign-in system. Continue to the secure WPA sign-in page to use your
          email/password account or any provider currently enabled there.
        </p>
      </div>

      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 sm:p-6 mb-8">
        <p className="text-sm font-semibold text-slate-700 mb-3">Available on the WPA sign-in page when centrally enabled:</p>
        <p className="text-sm text-slate-600 leading-7">
          Email/password, Google, Facebook, Apple, X, Instagram, and any other provider already configured in WPA
          Central Auth.
        </p>
      </div>

      <a
        href={startUrl}
        onClick={() => storeReturnToForRedirectFlow(next)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-(--bpa-navy) px-6 py-4 text-base font-bold text-white shadow-lg shadow-slate-300/40 transition hover:opacity-95"
      >
        Continue To Secure Sign In
        <ArrowRight className="h-5 w-5" />
      </a>

      <p className="mt-5 text-sm text-gray-500 leading-6">
        Need a new account? Use the WPA sign-in page and choose the available registration or provider option there.
      </p>

      <p className="mt-8 text-center text-gray-600 font-medium">
        Looking for another route?{' '}
        <Link href={withReturnTo('/auth/sign-up', next)} className="text-(--bpa-navy) hover:text-(--bpa-green) transition-colors">
          Learn how account creation works
        </Link>
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20 text-(--bpa-navy)">Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}
