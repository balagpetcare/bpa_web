'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { consumeStoredReturnTo, getSafeReturnTo, storeReturnToForRedirectFlow, withReturnTo } from '@/lib/auth/return-to';
import { buildCentralAuthPopupStartUrl, buildCentralAuthStartUrl } from '@/lib/auth/central-auth';
import { openCentralAuthPopup, isTrustedCentralAuthPopupEvent } from '@/lib/auth/popup';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const popupRef = useRef<Window | null>(null);
  const pollRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const next = getSafeReturnTo(searchParams.get('next'));
  const popupStartUrl = buildCentralAuthPopupStartUrl(next);
  const fallbackStartUrl = buildCentralAuthStartUrl(next);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent<unknown>) => {
      if (!isTrustedCentralAuthPopupEvent(event, window.location.origin, popupRef.current)) return;
      if (completedRef.current) return;

      completedRef.current = true;

      if (!event.data.success) {
        setLoading(false);
        setError('Sign-in could not be completed. Please try again.');
        return;
      }

      try {
        await refreshUser();
        const destination = consumeStoredReturnTo();
        setLoading(false);
        popupRef.current = null;
        router.replace(destination);
      } catch {
        setLoading(false);
        setError('We could not confirm your sign-in yet. Please try again.');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [refreshUser, router]);

  useEffect(() => {
    if (!loading) return;

    pollRef.current = window.setInterval(() => {
      if (completedRef.current) {
        if (pollRef.current) window.clearInterval(pollRef.current);
        pollRef.current = null;
        return;
      }

      if (popupRef.current?.closed) {
        completedRef.current = true;
        setLoading(false);
        setNotice('Sign-in was closed. You can try again when ready.');
        popupRef.current = null;
        if (pollRef.current) window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }, 500);

    return () => {
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [loading]);

  const startPopupSignIn = () => {
    setError('');
    setNotice('');
    completedRef.current = false;
    storeReturnToForRedirectFlow(next);
    const popup = openCentralAuthPopup(popupStartUrl);
    if (!popup) {
      window.location.assign(fallbackStartUrl);
      return;
    }
    popupRef.current = popup;
    setLoading(true);
  };

  return (
    <div className="rounded-[2rem] border border-gray-200 bg-white/90 shadow-xl shadow-gray-200/50 p-8 sm:p-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700 mb-5">
          <ShieldCheck className="h-4 w-4" />
          WPA Central Authentication
        </div>
        <h1 className="text-3xl font-bold text-(--bpa-navy) mb-3">Sign In To Bangladesh Pet Association</h1>
        <p className="text-gray-600 leading-7">
          Use the secure WPA hosted login in a popup. If the popup is blocked, BPA falls back to the standard full-page
          Central Auth redirect.
        </p>
      </div>

      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 sm:p-6 mb-8 space-y-3">
        <p className="text-sm font-semibold text-slate-700">What to expect</p>
        <p className="text-sm text-slate-600 leading-7">
          Your credentials stay inside WPA Central Auth. BPA only receives the final callback and creates its own
          session server-side.
        </p>
        <p className="text-sm text-slate-600 leading-7">
          Available sign-in methods follow the WPA hosted login policy: email/password, OTP, phone, registration, and
          any providers currently enabled there.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {notice && !error && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {notice}
        </div>
      )}

      <button
        type="button"
        onClick={startPopupSignIn}
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-(--bpa-navy) px-6 py-4 text-base font-bold text-white shadow-lg shadow-slate-300/40 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
        {loading ? 'Waiting For Sign-In...' : 'Open Secure Popup'}
      </button>

      <a
        href={fallbackStartUrl}
        onClick={() => storeReturnToForRedirectFlow(next)}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-base font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
      >
        Use Full-Page Sign-In
      </a>

      <p className="mt-5 text-sm text-gray-500 leading-6">
        Need a new account?{' '}
        <Link href={withReturnTo('/auth/sign-up', next)} className="text-(--bpa-navy) hover:text-(--bpa-green) transition-colors">
          Continue to WPA registration
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
