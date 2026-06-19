'use client';

import React, { useState, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

function SignInContent() {
  const { login, requestOtp, verifyOtp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';

  const [method, setMethod] = useState<'email' | 'mobile'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await requestOtp(phone);
      setOtpSent(true);
      if (res.devOtp) {
        // In local development
        alert(`Dev OTP: ${res.devOtp}`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyOtp(phone, otp);
      router.push(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-(--bpa-navy) mb-2">Welcome Back</h1>
        <p className="text-gray-500">Sign in to your account | আপনার অ্যাকাউন্টে সাইন ইন করুন</p>
      </div>

      <div className="flex bg-gray-100 p-1 rounded-lg mb-8">
        <button
          className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all ${method === 'email' ? 'bg-white text-(--bpa-navy) shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => { setMethod('email'); setError(''); }}
        >
          Email | ইমেল
        </button>
        <button
          className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all ${method === 'mobile' ? 'bg-white text-(--bpa-navy) shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => { setMethod('mobile'); setError(''); }}
        >
          Mobile | মোবাইল
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-start gap-3">
          <div className="mt-0.5"><AlertCircleIcon /></div>
          <div>{error}</div>
        </div>
      )}

      {method === 'email' ? (
        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Email Address <span className="font-normal text-gray-500">| ইমেল</span>
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
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                Password <span className="font-normal text-gray-500">| পাসওয়ার্ড</span>
              </label>
              <Link href="/auth/forgot-password" className="text-sm font-medium text-(--bpa-navy) hover:text-(--bpa-green) transition-colors">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-(--bpa-navy)/20 focus:border-(--bpa-navy) transition-colors pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
            className="w-full bg-(--bpa-navy) text-white py-3.5 rounded-xl font-bold hover:bg-opacity-90 transition-all focus:ring-4 focus:ring-(--bpa-navy)/30 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-2"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      ) : (
        <div className="space-y-5">
          {!otpSent ? (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Mobile Number <span className="font-normal text-gray-500">| মোবাইল নম্বর</span>
                </label>
                <div className="flex relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">+880</span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-16 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-(--bpa-navy)/20 focus:border-(--bpa-navy) transition-colors"
                    placeholder="17XXXXXXXX"
                    maxLength={11}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || phone.length < 10}
                className="w-full bg-(--bpa-navy) text-white py-3.5 rounded-xl font-bold hover:bg-opacity-90 transition-all focus:ring-4 focus:ring-(--bpa-navy)/30 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-2"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-center">
                  Enter 6-digit OTP sent to +88{phone.startsWith('0') ? phone : `0${phone}`}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-(--bpa-navy)/20 focus:border-(--bpa-navy) transition-colors text-center text-2xl tracking-[0.5em] font-bold"
                  placeholder="------"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-(--bpa-green) text-white py-3.5 rounded-xl font-bold hover:bg-(--bpa-green-dark) transition-all focus:ring-4 focus:ring-(--bpa-green)/30 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-2"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </button>
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setOtp(''); setError(''); }}
                  className="text-sm font-medium text-gray-500 hover:text-(--bpa-navy) transition-colors"
                >
                  Change mobile number
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="mt-8 mb-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gray-50 text-gray-400 font-medium">Or continue with</span>
          </div>
        </div>

        <SocialLoginButtons />
      </div>

      <p className="mt-8 text-center text-gray-600 font-medium">
        Don&apos;t have an account?{' '}
        <Link href="/auth/sign-up" className="text-(--bpa-navy) hover:text-(--bpa-green) transition-colors">
          Sign Up
        </Link>
      </p>
    </>
  );
}

function AlertCircleIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-(--bpa-navy)" size={32} /></div>}>
      <SignInContent />
    </Suspense>
  );
}
