'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { completeAuthCallback } from '@/lib/auth/callback-flow';
import { isCentralAuthPopupAck, publishCentralAuthPopupResult, traceBpaAuthPopup } from '@/lib/auth/popup';
import { fetchCentralAuthPopupCompletionStatus } from '@/lib/auth/central-auth';

const POPUP_COMPLETION_STATUS_ATTEMPTS = 5;
const POPUP_COMPLETION_STATUS_INTERVAL_MS = 300;

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const handledRef = useRef(false);
  const [popupComplete, setPopupComplete] = useState(false);
  const [failed, setFailed] = useState(false);
  const callbackError = searchParams.get('error');
  const popupMode = searchParams.get('popup') === '1';
  const flowId = searchParams.get('flowId') ?? undefined;
  const completionToken = searchParams.get('completion') ?? undefined;

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    let closeTimer: number | null = null;
    let ackTimer: number | null = null;
    let closed = false;

    const closePopup = () => {
      if (closed) return;
      closed = true;
      traceBpaAuthPopup('BPA_AUTH_POPUP_CLOSING', { reason: 'ack_or_timeout', flowIdPresent: Boolean(flowId) });
      try {
        window.close();
      } catch {
        // Best-effort only; the success fallback UI remains visible.
      }
      window.setTimeout(() => setPopupComplete(true), 150);
    };

    const postPopupResult = (success: boolean) => {
      if (!popupMode) return;
      publishCentralAuthPopupResult({
        success,
        targetOrigin: window.location.origin,
        flowId,
      });
      traceBpaAuthPopup('BPA_AUTH_POPUP_MESSAGE_SENT', {
        success,
        flowIdPresent: Boolean(flowId),
        hasOpener: Boolean(window.opener),
        targetOrigin: window.location.origin,
      });
    };

    if (popupMode) {
      traceBpaAuthPopup('BPA_AUTH_CALLBACK_COMPLETION_PARAM_PRESENT', {
        flowIdPresent: Boolean(flowId),
        completionParamPresent: Boolean(completionToken),
      });
      traceBpaAuthPopup('BPA_AUTH_POPUP_CALLBACK_LOADED', {
        hasError: Boolean(callbackError),
        flowIdPresent: Boolean(flowId),
      });
      traceBpaAuthPopup('BPA_AUTH_POPUP_HAS_OPENER', {
        hasOpener: Boolean(window.opener),
        popupOrigin: window.location.origin,
      });

      if (callbackError) {
        postPopupResult(false);
        setFailed(true);
        return;
      }

      void (async () => {
        try {
          if (!flowId || !completionToken) {
            traceBpaAuthPopup('BPA_AUTH_CALLBACK_COMPLETION_ERROR_REASON', {
              reason: 'missing_flow_or_completion',
              flowIdPresent: Boolean(flowId),
              completionParamPresent: Boolean(completionToken),
            });
            postPopupResult(false);
            setFailed(true);
            return;
          }

          let status: 'PENDING' | 'SUCCESS' | 'FAILED' = 'PENDING';
          for (let attempt = 1; attempt <= POPUP_COMPLETION_STATUS_ATTEMPTS; attempt += 1) {
            traceBpaAuthPopup('BPA_AUTH_CALLBACK_COMPLETION_LOOKUP_STARTED', {
              flowIdPresent: true,
              attempt,
            });
            try {
              status = await fetchCentralAuthPopupCompletionStatus(flowId, completionToken);
            } catch (error) {
              const message = error instanceof Error ? error.message : 'lookup_failed';
              const statusMatch = /^lookup_http_(\d+)$/.exec(message);
              traceBpaAuthPopup('BPA_AUTH_CALLBACK_COMPLETION_LOOKUP_HTTP_STATUS', {
                flowIdPresent: true,
                attempt,
                httpStatus: statusMatch ? Number(statusMatch[1]) : null,
              });
              traceBpaAuthPopup('BPA_AUTH_CALLBACK_COMPLETION_ERROR_REASON', {
                reason: message,
                flowIdPresent: true,
                attempt,
              });
              if (attempt === POPUP_COMPLETION_STATUS_ATTEMPTS) {
                postPopupResult(false);
                setFailed(true);
                return;
              }
              await new Promise((resolve) => window.setTimeout(resolve, POPUP_COMPLETION_STATUS_INTERVAL_MS));
              continue;
            }
            traceBpaAuthPopup('BPA_AUTH_POPUP_COMPLETION_STATUS_RESOLVED', {
              flowIdPresent: true,
              status,
              attempt,
            });
            traceBpaAuthPopup('BPA_AUTH_CALLBACK_COMPLETION_STATUS', {
              flowIdPresent: true,
              status,
              attempt,
            });
            if (status !== 'PENDING') break;
            await new Promise((resolve) => window.setTimeout(resolve, POPUP_COMPLETION_STATUS_INTERVAL_MS));
          }

          if (status !== 'SUCCESS') {
            postPopupResult(false);
            setFailed(true);
            return;
          }

          postPopupResult(true);
          if (window.opener) {
            const handleAck = (event: MessageEvent<unknown>) => {
              if (event.origin !== window.location.origin) return;
              if (!isCentralAuthPopupAck(event.data, flowId)) return;
              traceBpaAuthPopup('BPA_AUTH_POPUP_ACK_RECEIVED', { flowIdPresent: Boolean(flowId) });
              window.removeEventListener('message', handleAck);
              if (ackTimer) window.clearTimeout(ackTimer);
              closePopup();
            };
            window.addEventListener('message', handleAck);
            ackTimer = window.setTimeout(() => {
              window.removeEventListener('message', handleAck);
              closePopup();
            }, 1_250);
          } else {
            ackTimer = window.setTimeout(closePopup, 1_250);
          }
          closeTimer = window.setTimeout(() => setPopupComplete(true), 1_500);
        } catch {
          postPopupResult(false);
          setFailed(true);
        }
      })();
      return () => {
        if (ackTimer) window.clearTimeout(ackTimer);
        if (closeTimer) window.clearTimeout(closeTimer);
      };
    }

    if (callbackError) {
      setFailed(true);
      return;
    }

    completeAuthCallback(refreshUser)
      .then((destination) => router.replace(destination))
      .catch(() => setFailed(true));
  }, [callbackError, completionToken, flowId, popupMode, refreshUser, router]);

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

  if (popupMode && popupComplete) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm px-4">
          <p className="text-gray-700 font-semibold mb-2">Sign-in complete</p>
          <p className="text-gray-500 text-sm">You can close this window.</p>
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
