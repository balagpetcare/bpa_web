'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { completeAuthCallback } from '@/lib/auth/callback-flow';
import { CENTRAL_AUTH_POPUP_MESSAGE_TYPE } from '@/lib/auth/popup';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const handledRef = useRef(false);
  const [failed, setFailed] = useState(false);
  const callbackError = searchParams.get('error');
  const popupMode = searchParams.get('popup') === '1';

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const postPopupResult = (success: boolean) => {
      if (!popupMode || !window.opener) return;
      try {
        window.opener.postMessage(
          { type: CENTRAL_AUTH_POPUP_MESSAGE_TYPE, success },
          window.location.origin,
        );
      } catch {
        // ignore opener messaging failures; the parent also polls for popup close
      }
    };

    if (popupMode) {
      if (callbackError) {
        postPopupResult(false);
        setFailed(true);
        return;
      }

      void (async () => {
        try {
          await refreshUser();
          postPopupResult(true);
          try {
            window.close();
          } catch {
            // Popup blockers should not apply here, but if they do, the page still shows success.
          }
        } catch {
          postPopupResult(false);
          setFailed(true);
        }
      })();
      return;
    }

    if (callbackError) {
      setFailed(true);
      return;
    }

    completeAuthCallback(refreshUser)
      .then((destination) => router.replace(destination))
      .catch(() => setFailed(true));
  }, [callbackError, popupMode, refreshUser, router]);

  if (failed) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm px-4">
          <p className="text-gray-700 font-semibold mb-2">Couldn&apos;t complete sign-in</p>
          <p className="text-gray-500 text-sm mb-4">
            {callbackError === 'signin_failed'
              ? 'Sign-in was cancelled or could not be completed. Please try again.'
              : 'Something went wrong finishing your sign-in. Please try again.'}
          </p>
          <a href="/auth/sign-in" className="text-(--bpa-navy) font-semibold hover:underline">Back to Sign In</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-(--bpa-navy) mx-auto mb-4"></div>
        <p className="text-gray-600">
          {popupMode ? 'Completing popup sign in...' : 'Completing sign in...'} | সাইন ইন সম্পন্ন হচ্ছে...
        </p>
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
