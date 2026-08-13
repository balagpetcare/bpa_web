'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, UserPlus } from 'lucide-react';
import { getSafeReturnTo, storeReturnToForRedirectFlow, withReturnTo } from '@/lib/auth/return-to';
import { buildCentralAuthStartUrl } from '@/lib/auth/central-auth';

function SignUpContent() {
  const searchParams = useSearchParams();
  const next = getSafeReturnTo(searchParams.get('next'));
  const startUrl = buildCentralAuthStartUrl(next);

  return (
    <div className="rounded-[2rem] border border-gray-200 bg-white/90 shadow-xl shadow-gray-200/50 p-8 sm:p-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-4 py-1.5 text-sm font-semibold text-sky-700 mb-5">
          <UserPlus className="h-4 w-4" />
          WPA Account Creation
        </div>
        <h1 className="text-3xl font-bold text-(--bpa-navy) mb-3">Create Your Account Through WPA</h1>
        <p className="text-gray-600 leading-7">
          Bangladesh Pet Association does not keep a separate password or social-login system. Account creation and all
          provider sign-in options are handled by WPA Central Authentication.
        </p>
      </div>

      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 sm:p-6 mb-8">
        <p className="text-sm text-slate-600 leading-7">
          Continue to WPA to create an account with the options they currently support. Once registration or provider
          sign-in succeeds there, BPA will create or link your local profile automatically.
        </p>
      </div>

      <a
        href={startUrl}
        onClick={() => storeReturnToForRedirectFlow(next)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-(--bpa-navy) px-6 py-4 text-base font-bold text-white shadow-lg shadow-slate-300/40 transition hover:opacity-95"
      >
        Continue To WPA Sign In
        <ArrowRight className="h-5 w-5" />
      </a>

      <p className="mt-8 text-center text-gray-600 font-medium">
        Already have an account?{' '}
        <Link href={withReturnTo('/auth/sign-in', next)} className="text-(--bpa-navy) hover:text-(--bpa-green) transition-colors">
          Sign In
        </Link>
      </p>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20 text-(--bpa-navy)">Loading...</div>}>
      <SignUpContent />
    </Suspense>
  );
}
