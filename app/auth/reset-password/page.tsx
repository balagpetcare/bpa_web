'use client';

import React, { useState, Suspense } from 'react';
import { apiPost } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match | পাসওয়ার্ড মেলেনি');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await apiPost('/auth/password/reset', { token, password });
      setSuccess(true);
      setTimeout(() => router.push('/auth/sign-in'), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-xl">
          <h3 className="font-bold text-lg mb-2">Invalid Link</h3>
          <p className="text-sm">
            This password reset link is invalid or has expired.
            <br/><br/>
            এই পাসওয়ার্ড রিসেট লিঙ্কটি ইনভ্যালিড অথবা মেয়াদ শেষ হয়ে গেছে।
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-(--bpa-navy) mb-2">Set New Password</h1>
        <p className="text-gray-500">নতুন পাসওয়ার্ড সেট করুন</p>
      </div>

      {success ? (
        <div className="text-center py-4">
          <div className="bg-green-50 border border-green-100 text-green-700 p-6 rounded-xl mb-6">
            <h3 className="font-bold text-lg mb-2">Password Reset Successful</h3>
            <p className="text-sm">
              Your password has been successfully updated. Redirecting you to sign in...
              <br/><br/>
              পাসওয়ার্ড রিসেট সফল হয়েছে! সাইন ইন পেজে রিডাইরেক্ট করা হচ্ছে...
            </p>
          </div>
          <Loader2 className="animate-spin text-(--bpa-green) mx-auto" size={32} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>{error}</div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              New Password <span className="font-normal text-gray-500">| নতুন পাসওয়ার্ড</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-(--bpa-navy)/20 focus:border-(--bpa-navy) transition-colors pr-10"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Confirm Password <span className="font-normal text-gray-500">| নিশ্চিত করুন</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-(--bpa-navy)/20 focus:border-(--bpa-navy) transition-colors pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-(--bpa-navy) text-white py-3.5 rounded-xl font-bold hover:bg-opacity-90 transition-all focus:ring-4 focus:ring-(--bpa-navy)/30 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-(--bpa-navy)" size={32} /></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
