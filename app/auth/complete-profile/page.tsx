'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function CompleteProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  if (!user) {
    router.push('/auth/sign-in');
    return null;
  }

  return (
    <div className="max-w-md mx-auto my-16 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h1 className="text-2xl font-bold text-center text-(--bpa-navy) mb-6">
          Complete Your Profile | তথ্য সম্পন্ন করুন
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          We need a few more details to complete your account.
          | আপনার অ্যাকাউন্ট সম্পন্ন করতে আরও কিছু তথ্য প্রয়োজন।
        </p>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address | ইমেল ঠিকানা</label>
            <input
              type="email"
              required={!user.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-(--bpa-navy) focus:border-(--bpa-navy)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mobile Number | মোবাইল নম্বর</label>
            <input
              type="tel"
              required={!user.phone}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-(--bpa-navy) focus:border-(--bpa-navy)"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-(--bpa-navy) text-white py-2 rounded-md font-medium hover:bg-opacity-90 transition-colors"
          >
            {loading ? 'Saving...' : 'Complete Profile | তথ্য সংরক্ষণ করুন'}
          </button>
        </form>
      </div>
    </div>
  );
}
