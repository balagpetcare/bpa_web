'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { completeAuthCallback } from '@/lib/auth/callback-flow';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const handledRef = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // Guards against React re-running this effect twice on one mount (strict
    // mode) or a stray re-render firing it again — this page must only ever
    // consume the stashed return path and redirect exactly once per visit.
    if (handledRef.current) return;
    handledRef.current = true;

    // Central Auth's callback puts a bearer token in this URL even though
    // the session is already established via an httpOnly cookie — it's
    // redundant and must never linger in the address bar or browser
    // history, so it's stripped immediately regardless of what happens next.
    if (searchParams.get('token')) {
      window.history.replaceState(null, '', '/auth/callback');
    }

    completeAuthCallback(refreshUser)
      .then((destination) => router.replace(destination))
      .catch(() => setFailed(true));
  }, [refreshUser, router, searchParams]);

  if (failed) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm px-4">
          <p className="text-gray-700 font-semibold mb-2">Couldn&apos;t complete sign-in</p>
          <p className="text-gray-500 text-sm mb-4">Something went wrong finishing your sign-in. Please try again.</p>
          <a href="/auth/sign-in" className="text-(--bpa-navy) font-semibold hover:underline">Back to Sign In</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-(--bpa-navy) mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in... | সাইন ইন সম্পন্ন হচ্ছে...</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
