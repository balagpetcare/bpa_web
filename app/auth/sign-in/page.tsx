'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaFacebookF, FaGoogle, FaInstagram, FaXTwitter } from 'react-icons/fa6';
import { Mail, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { consumeStoredReturnTo, getSafeReturnTo, storeReturnToForRedirectFlow } from '@/lib/auth/return-to';
import { buildCentralAuthPopupStartUrl, buildCentralAuthStartUrl, type CentralAuthMethod } from '@/lib/auth/central-auth';
import {
  CENTRAL_AUTH_POPUP_ACK_TYPE,
  clearCentralAuthPopupStorageMarker,
  consumeCentralAuthPopupStorageMarker,
  getCentralAuthPopupEventRejectionReason,
  openCentralAuthPopup,
  openCentralAuthPopupBroadcastChannel,
  readCentralAuthPopupStorageMarker,
  isTrustedCentralAuthPopupEvent,
  parseCentralAuthPopupStorageEvent,
  traceBpaAuthPopup,
} from '@/lib/auth/popup';

type ProviderMethod = Exclude<CentralAuthMethod, 'email' | 'register'>;

type ProviderButton = {
  method: ProviderMethod;
  label: string;
  icon: React.ReactNode;
};

type PopupFlowState = 'IDLE' | 'WAITING' | 'RECONCILING_SESSION' | 'SUCCESS_RECEIVED' | 'REFRESHING_SESSION' | 'AUTHENTICATED' | 'CANCELLED' | 'FAILED';

const POPUP_RECONCILIATION_ATTEMPTS = 12;
const POPUP_RECONCILIATION_INTERVAL_MS = 1_000;

const FALLBACK_PROVIDERS: ProviderButton[] = [
  { method: 'google', label: 'Google', icon: <FaGoogle aria-hidden="true" className="h-5 w-5 text-[#4285F4]" /> },
  { method: 'facebook', label: 'Facebook', icon: <FaFacebookF aria-hidden="true" className="h-5 w-5 text-[#1877F2]" /> },
  { method: 'instagram', label: 'Instagram', icon: <FaInstagram aria-hidden="true" className="h-5 w-5 text-[#E4405F]" /> },
  { method: 'x', label: 'X', icon: <FaXTwitter aria-hidden="true" className="h-5 w-5 text-slate-950" /> },
];

function authBootstrapUrl() {
  return 'https://auth.worldpetsassociation.com/api/v1/auth/bootstrap?clientId=bpa-web';
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const popupRef = useRef<Window | null>(null);
  const pollRef = useRef<number | null>(null);
  const reconciliationRef = useRef<number | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const completedRef = useRef(false);
  const successSignalReceivedRef = useRef(false);
  const flowStateRef = useRef<PopupFlowState>('IDLE');
  const flowIdRef = useRef<string>('');
  const openedAtRef = useRef<number>(0);
  const [activeMethod, setActiveMethod] = useState<CentralAuthMethod | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [availableMethods, setAvailableMethods] = useState<Set<string> | null>(null);

  const next = getSafeReturnTo(searchParams.get('next'));
  const clearPopupPolling = useCallback(() => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const clearReconciliationTimer = useCallback(() => {
    if (reconciliationRef.current) {
      window.clearTimeout(reconciliationRef.current);
      reconciliationRef.current = null;
    }
  }, []);

  const closeBroadcastChannel = useCallback(() => {
    broadcastChannelRef.current?.close();
    broadcastChannelRef.current = null;
  }, []);

  const resolvePostAuthDestination = useCallback(() => {
    const destination = consumeStoredReturnTo(next);
    return destination === '/auth/sign-in' || destination.startsWith('/auth/sign-in?') ? '/' : destination;
  }, [next]);

  const navigateAfterAuth = useCallback(() => {
    const destination = resolvePostAuthDestination();
    traceBpaAuthPopup('BPA_AUTH_NAVIGATION_STARTED', {
      flowId: flowIdRef.current,
      destination,
      fromPath: window.location.pathname,
    });
    flowStateRef.current = 'AUTHENTICATED';
    completedRef.current = true;
    clearPopupPolling();
    clearReconciliationTimer();
    closeBroadcastChannel();
    clearCentralAuthPopupStorageMarker(flowIdRef.current || undefined);
    setActiveMethod(null);
    setError('');
    setNotice('');
    popupRef.current = null;
    router.replace(destination);
    window.setTimeout(() => router.refresh(), 0);
    window.setTimeout(() => {
      if (window.location.pathname === '/auth/sign-in') {
        window.location.replace(destination);
      }
    }, 900);
  }, [clearPopupPolling, clearReconciliationTimer, closeBroadcastChannel, resolvePostAuthDestination, router]);

  const providers = useMemo(() => {
    if (!availableMethods) return FALLBACK_PROVIDERS;
    return FALLBACK_PROVIDERS.filter((provider) => availableMethods.has(provider.method));
  }, [availableMethods]);

  useEffect(() => {
    if (authLoading || !user) return;
    navigateAfterAuth();
  }, [authLoading, user, navigateAfterAuth]);

  const confirmPopupSuccess = useCallback(async (reason: 'message' | 'storage' | 'broadcast' | 'marker' | 'popup_closed') => {
    if (flowStateRef.current === 'REFRESHING_SESSION' || flowStateRef.current === 'AUTHENTICATED') return;
    traceBpaAuthPopup('BPA_AUTH_SUCCESS_ACCEPTED', {
      flowId: flowIdRef.current,
      state: flowStateRef.current,
      reason,
    });
    flowStateRef.current = 'SUCCESS_RECEIVED';
    completedRef.current = true;
    successSignalReceivedRef.current = true;
    clearPopupPolling();
  }, [clearPopupPolling]);

  const reconcilePopupAuthentication = useCallback(async (reason: 'completion_signal' | 'popup_closed') => {
    if (flowStateRef.current === 'AUTHENTICATED') return;
    flowStateRef.current = 'RECONCILING_SESSION';
    clearPopupPolling();
    clearReconciliationTimer();

    let attempt = 0;
    const runAttempt = async (): Promise<void> => {
      if (flowStateRef.current === 'AUTHENTICATED') return;
      attempt += 1;

      const marker = consumeCentralAuthPopupStorageMarker(flowIdRef.current || undefined);
      if (marker?.success) {
        successSignalReceivedRef.current = true;
        traceBpaAuthPopup('BPA_AUTH_SUCCESS_ACCEPTED', {
          flowId: flowIdRef.current,
          state: flowStateRef.current,
          reason: 'marker',
        });
      }

      flowStateRef.current = 'REFRESHING_SESSION';
      traceBpaAuthPopup('BPA_AUTH_REFRESH_STARTED', {
        flowId: flowIdRef.current,
        reason,
        attempt,
        successSignalReceived: successSignalReceivedRef.current,
      });

      let authenticated = false;
      try {
        authenticated = Boolean(await refreshUser());
      } catch {
        authenticated = false;
      }

      traceBpaAuthPopup('BPA_AUTH_REFRESH_RESULT', {
        flowId: flowIdRef.current,
        authenticated,
        reason,
        attempt,
        successSignalReceived: successSignalReceivedRef.current,
      });

      if (authenticated) {
        navigateAfterAuth();
        return;
      }

      if (attempt >= POPUP_RECONCILIATION_ATTEMPTS) {
        if (!successSignalReceivedRef.current && !readCentralAuthPopupStorageMarker(flowIdRef.current || undefined)) {
          flowStateRef.current = 'CANCELLED';
          completedRef.current = true;
          closeBroadcastChannel();
          traceBpaAuthPopup('BPA_AUTH_POPUP_CANCELLED', {
            flowId: flowIdRef.current,
            elapsedMs: openedAtRef.current ? Date.now() - openedAtRef.current : null,
            attempts: attempt,
          });
          setActiveMethod(null);
          setNotice('The authentication window was closed before sign-in completed.');
          return;
        }

        flowStateRef.current = 'FAILED';
        completedRef.current = true;
        closeBroadcastChannel();
        setActiveMethod(null);
        setError('Sign-in completed, but your session could not be loaded. Please try again.');
        return;
      }

      flowStateRef.current = 'RECONCILING_SESSION';
      reconciliationRef.current = window.setTimeout(() => {
        void runAttempt();
      }, POPUP_RECONCILIATION_INTERVAL_MS);
    };

    await runAttempt();
  }, [clearPopupPolling, clearReconciliationTimer, closeBroadcastChannel, navigateAfterAuth, refreshUser]);

  useEffect(() => {
    let alive = true;
    fetch(authBootstrapUrl(), { headers: { Accept: 'application/json' } })
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        if (!alive) return;
        const rows = Array.isArray(body?.data?.providers) ? body.data.providers : [];
        const enabled = new Set<string>();
        for (const row of rows) {
          if (row?.enabled && typeof row.id === 'string') enabled.add(row.id.toLowerCase());
        }
        if (enabled.size > 0) setAvailableMethods(enabled);
      })
      .catch(() => {
        // Keep the last-known production provider set visible if bootstrap is temporarily unavailable.
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent<unknown>) => {
      traceBpaAuthPopup('BPA_AUTH_MESSAGE_RECEIVED', {
        flowId: flowIdRef.current,
        eventOrigin: event.origin,
        expectedOrigin: window.location.origin,
        sourceMatches: popupRef.current ? event.source === popupRef.current : null,
        hasPopupRef: Boolean(popupRef.current),
      });
      const rejectionReason = getCentralAuthPopupEventRejectionReason(
        event,
        window.location.origin,
        popupRef.current,
        flowIdRef.current || undefined,
      );
      if (rejectionReason) {
        traceBpaAuthPopup('BPA_AUTH_MESSAGE_REJECTED', {
          flowId: flowIdRef.current,
          reason: rejectionReason,
          eventOrigin: event.origin,
          expectedOrigin: window.location.origin,
        });
        return;
      }
      if (!isTrustedCentralAuthPopupEvent(event, window.location.origin, popupRef.current, flowIdRef.current || undefined)) return;

      if (!event.data.success) {
        flowStateRef.current = 'FAILED';
        completedRef.current = true;
        clearPopupPolling();
        clearReconciliationTimer();
        closeBroadcastChannel();
        setActiveMethod(null);
        setError('Sign-in could not be completed. Please try again.');
        return;
      }

      try {
        popupRef.current?.postMessage(
          { type: CENTRAL_AUTH_POPUP_ACK_TYPE, flowId: flowIdRef.current || undefined },
          window.location.origin,
        );
      } catch {
        // ACK failure is non-fatal; the popup has a timeout close fallback.
      }
      await confirmPopupSuccess('message');
      await reconcilePopupAuthentication('completion_signal');
    };

    traceBpaAuthPopup('BPA_AUTH_PARENT_LISTENER_READY', {
      flowId: flowIdRef.current,
      origin: window.location.origin,
    });
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [clearPopupPolling, clearReconciliationTimer, closeBroadcastChannel, confirmPopupSuccess, reconcilePopupAuthentication]);

  useEffect(() => {
    const handleStorage = async (event: StorageEvent) => {
      const message = parseCentralAuthPopupStorageEvent(event);
      if (!message) return;
      traceBpaAuthPopup('BPA_AUTH_MESSAGE_RECEIVED', {
        flowId: flowIdRef.current,
        channel: 'storage',
        messageFlowIdPresent: Boolean(message.flowId),
      });

      if (!message.success) {
        flowStateRef.current = 'FAILED';
        completedRef.current = true;
        clearPopupPolling();
        clearReconciliationTimer();
        closeBroadcastChannel();
        setActiveMethod(null);
        setError('Sign-in could not be completed. Please try again.');
        return;
      }

      await confirmPopupSuccess('storage');
      await reconcilePopupAuthentication('completion_signal');
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [clearPopupPolling, clearReconciliationTimer, closeBroadcastChannel, confirmPopupSuccess, reconcilePopupAuthentication]);

  useEffect(() => {
    if (!activeMethod || !flowIdRef.current) return;
    closeBroadcastChannel();
    const channel = openCentralAuthPopupBroadcastChannel(flowIdRef.current);
    if (!channel) return;
    broadcastChannelRef.current = channel;
    const handleBroadcast = async (event: MessageEvent) => {
      if (!isTrustedCentralAuthPopupEvent(
        { data: event.data, origin: window.location.origin, source: null },
        window.location.origin,
        null,
        flowIdRef.current || undefined,
      )) return;
      traceBpaAuthPopup('BPA_AUTH_MESSAGE_RECEIVED', {
        flowId: flowIdRef.current,
        channel: 'broadcast',
        messageFlowIdPresent: Boolean((event.data as { flowId?: string }).flowId),
      });
      if (!(event.data as { success: boolean }).success) return;
      await confirmPopupSuccess('broadcast');
      await reconcilePopupAuthentication('completion_signal');
    };
    channel.addEventListener('message', handleBroadcast);
    return () => {
      channel.removeEventListener('message', handleBroadcast);
      channel.close();
      if (broadcastChannelRef.current === channel) {
        broadcastChannelRef.current = null;
      }
    };
  }, [activeMethod, closeBroadcastChannel, confirmPopupSuccess, reconcilePopupAuthentication]);

  useEffect(() => {
    if (!activeMethod) return;

    pollRef.current = window.setInterval(() => {
      if (completedRef.current || (flowStateRef.current !== 'WAITING' && flowStateRef.current !== 'RECONCILING_SESSION')) {
        clearPopupPolling();
        return;
      }

      if (popupRef.current?.closed) {
        const closedPopup = popupRef.current;
        const elapsedMs = openedAtRef.current ? Date.now() - openedAtRef.current : null;
        traceBpaAuthPopup('BPA_AUTH_POPUP_APPARENTLY_CLOSED', {
          flowId: flowIdRef.current,
          elapsedMs,
          state: flowStateRef.current,
        });
        popupRef.current = null;
        clearPopupPolling();
        void (async () => {
          if (flowStateRef.current !== 'WAITING' && flowStateRef.current !== 'RECONCILING_SESSION') return;
          // `popup.closed === true` only means the original WindowProxy is no longer reliable.
          // The real popup may still be visible after cross-origin OAuth navigation.
          flowStateRef.current = 'RECONCILING_SESSION';
          await reconcilePopupAuthentication('popup_closed');
          if (popupRef.current === closedPopup) popupRef.current = null;
        })();
      }
    }, 500);

    return () => {
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [activeMethod, clearPopupPolling, reconcilePopupAuthentication]);

  const startAuth = (method: CentralAuthMethod) => {
    const flowId = `bpa_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    setError('');
    setNotice('');
    setActiveMethod(method);
    completedRef.current = false;
    successSignalReceivedRef.current = false;
    flowStateRef.current = 'WAITING';
    flowIdRef.current = flowId;
    openedAtRef.current = Date.now();
    clearReconciliationTimer();
    closeBroadcastChannel();
    clearCentralAuthPopupStorageMarker(flowId);
    storeReturnToForRedirectFlow(next);
    traceBpaAuthPopup('BPA_AUTH_PARENT_START', {
      flowId,
      method,
      parentPath: window.location.pathname,
      returnTo: next,
    });

    const popupStartUrl = buildCentralAuthPopupStartUrl(next, method, flowId);
    const fallbackStartUrl = buildCentralAuthStartUrl(next, method, flowId);
    const popup = openCentralAuthPopup(popupStartUrl);
    if (!popup) {
      flowStateRef.current = 'IDLE';
      traceBpaAuthPopup('BPA_AUTH_POPUP_BLOCKED', { flowId, method });
      window.location.assign(fallbackStartUrl);
      return;
    }
    popupRef.current = popup;
    traceBpaAuthPopup('BPA_AUTH_POPUP_OPENED', {
      flowId,
      method,
      popupStartHost: new URL(popupStartUrl).host,
    });
  };

  const disabled = Boolean(activeMethod);

  useEffect(() => () => {
    clearPopupPolling();
    clearReconciliationTimer();
    closeBroadcastChannel();
    if (flowIdRef.current) {
      clearCentralAuthPopupStorageMarker(flowIdRef.current);
    }
  }, [clearPopupPolling, clearReconciliationTimer, closeBroadcastChannel]);

  return (
    <main className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_24px_70px_rgba(15,23,42,0.14)] sm:p-9">
      <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-(--bpa-green)/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-12 h-52 w-52 rounded-full bg-(--bpa-navy)/10 blur-3xl" />

      <div className="relative text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-(--bpa-navy) text-xl font-black tracking-tight text-white shadow-lg shadow-slate-300/50">
          BPA
        </div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.24em] text-(--bpa-green)">
          Bangladesh Pet Association
        </p>
        <h1 className="text-2xl font-bold text-(--bpa-navy) sm:text-3xl">Sign in to Bangladesh Pet Association</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600">
          Continue securely with your WPA account.
        </p>
      </div>

      {error && (
        <div className="relative mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {notice && !error && (
        <div className="relative mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {notice}
        </div>
      )}

      <div className="relative mt-7 space-y-3">
        {providers.map((provider) => (
          <AuthChoiceButton
            key={provider.method}
            disabled={disabled}
            loading={activeMethod === provider.method}
            icon={provider.icon}
            label={`Continue with ${provider.label}`}
            onClick={() => startAuth(provider.method)}
          />
        ))}
      </div>

      <div className="relative my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">OR</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="relative space-y-4">
        <AuthChoiceButton
          disabled={disabled}
          loading={activeMethod === 'email'}
          icon={<Mail aria-hidden="true" className="h-5 w-5 text-(--bpa-navy)" />}
          label="Continue with Email"
          onClick={() => startAuth('email')}
        />

        <p className="text-center text-sm text-slate-600">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            disabled={disabled}
            onClick={() => startAuth('register')}
            className="font-semibold text-(--bpa-navy) underline-offset-4 transition hover:text-(--bpa-green) hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          >
            Create account
          </button>
        </p>

        <div className="flex items-center justify-center gap-2 pt-2 text-xs font-medium text-slate-500">
          <ShieldCheck aria-hidden="true" className="h-4 w-4 text-(--bpa-green)" />
          Secured by World Pets Association
        </div>
      </div>
    </main>
  );
}

function AuthChoiceButton({
  disabled,
  loading,
  icon,
  label,
  onClick,
}: {
  disabled: boolean;
  loading: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={loading}
      className="group flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-(--bpa-green)/20 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-65 disabled:shadow-sm sm:text-base"
    >
      {loading ? <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin text-(--bpa-navy)" /> : icon}
      <span>{label}</span>
    </button>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20 text-(--bpa-navy)">Loading...</div>}>
      <div className="mx-auto flex min-h-[calc(100vh-180px)] w-full max-w-[460px] items-center px-4 py-10 sm:px-0">
        <SignInContent />
      </div>
    </Suspense>
  );
}
