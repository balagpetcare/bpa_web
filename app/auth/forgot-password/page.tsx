'use client';

import React, { useState } from 'react';
import { apiPost } from '@/lib/api';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiPost('/auth/password/forgot', { email });
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-(--bpa-navy) mb-2">Reset Password</h1>
        <p className="text-gray-500">পাসওয়ার্ড রিসেট করুন</p>
      </div>

      {sent ? (
        <div className="text-center py-4">
          <div className="bg-green-50 border border-green-100 text-green-700 p-6 rounded-xl mb-8">
            <h3 className="font-bold text-lg mb-2">Check your inbox</h3>
            <p className="text-sm">
              If an account exists for <span className="font-semibold">{email}</span>, we have sent a password reset link.
              <br/><br/>
              আপনার ইমেলে একটি পাসওয়ার্ড রিসেট লিঙ্ক পাঠানো হয়েছে।
            </p>
          </div>
          <Link href="/auth/sign-in" className="inline-flex justify-center w-full bg-(--bpa-navy) text-white py-3.5 rounded-xl font-bold hover:bg-opacity-90 transition-all focus:ring-4 focus:ring-(--bpa-navy)/30">
            Back to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="text-sm text-gray-600 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
            Enter your email address and we&apos;ll send you a link to reset your password.
            <br/>
            <span className="text-gray-500 mt-1 block">আপনার ইমেল ঠিকানা লিখুন এবং আমরা আপনাকে আপনার পাসওয়ার্ড রিসেট করার জন্য একটি লিঙ্ক পাঠাব।</span>
          </p>

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
              Email Address <span className="font-normal text-gray-500">| ইমেল ঠিকানা</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-(--bpa-navy)/20 focus:border-(--bpa-navy) transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-(--bpa-navy) text-white py-3.5 rounded-xl font-bold hover:bg-opacity-90 transition-all focus:ring-4 focus:ring-(--bpa-navy)/30 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? 'Sending Link...' : 'Send Reset Link'}
          </button>

          <div className="text-center mt-6">
            <Link href="/auth/sign-in" className="text-sm font-medium text-gray-500 hover:text-(--bpa-navy) transition-colors">
              Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </>
  );
}
