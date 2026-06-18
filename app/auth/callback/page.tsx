'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      // The cookie is already set by the backend.
      // We just need to refresh the user state and redirect.
      await refreshUser();
      router.push('/');
    };

    handleCallback();
  }, [refreshUser, router]);

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
