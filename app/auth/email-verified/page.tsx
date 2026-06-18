'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

function EmailVerifiedContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  const isSuccess = status === 'success';

  return (
    <div className="text-center py-8">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isSuccess ? 'bg-green-50' : 'bg-red-50'}`}>
        {isSuccess ? (
          <CheckCircle size={40} className="text-green-500" />
        ) : (
          <XCircle size={40} className="text-red-500" />
        )}
      </div>

      <h1 className="text-3xl font-bold text-(--bpa-navy) mb-4">
        {isSuccess ? 'Email Verified Successfully!' : 'Verification Failed'}
      </h1>
      
      <p className="text-gray-600 mb-8 max-w-sm mx-auto">
        {isSuccess 
          ? 'Your email address has been verified. You can now sign in to your account and access all features.' 
          : 'The verification link is invalid or has expired. Please request a new verification email.'}
      </p>

      <Link 
        href="/auth/sign-in" 
        className="w-full inline-block bg-(--bpa-navy) text-white py-3.5 rounded-xl font-bold hover:bg-opacity-90 transition-all focus:ring-4 focus:ring-(--bpa-navy)/30 mb-6"
      >
        Continue to Sign In
      </Link>
    </div>
  );
}

export default function EmailVerifiedPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-(--bpa-navy)" size={32} /></div>}>
      <EmailVerifiedContent />
    </Suspense>
  );
}
