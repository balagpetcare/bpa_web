'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiPost } from '@/lib/api';
import Link from 'next/link';
import { Mail, Loader2 } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleResend = async () => {
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      await apiPost('/auth/email/resend-verification', { email });
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resend email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Mail size={40} className="text-blue-500" />
      </div>

      <h1 className="text-3xl font-bold text-(--bpa-navy) mb-4">Check your email</h1>
      <p className="text-gray-600 mb-2">We&apos;ve sent a verification link to:</p>
      <p className="font-semibold text-lg text-(--bpa-navy) mb-8">{email || 'your email address'}</p>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
          {error}
        </div>
      )}

      {sent ? (
        <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-100 text-green-700 text-sm font-medium">
          Verification email sent! Please check your inbox.
        </div>
      ) : (
        <button
          onClick={handleResend}
          disabled={loading || !email}
          className="w-full bg-white border-2 border-(--bpa-navy) text-(--bpa-navy) py-3 rounded-xl font-bold hover:bg-gray-50 transition-all focus:ring-4 focus:ring-(--bpa-navy)/10 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mb-6"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? 'Resending...' : 'Resend Verification Email'}
        </button>
      )}

      <p className="text-gray-500 text-sm">
        <Link href="/auth/sign-in" className="text-(--bpa-navy) hover:text-(--bpa-green) transition-colors font-medium">
          Back to Sign In
        </Link>
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-(--bpa-navy)" size={32} /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
