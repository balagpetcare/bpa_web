'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, KeyRound, Loader2, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

export default function ChangePasswordPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/sign-in?next=/auth/change-password');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-(--bpa-navy)" size={32} />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('New password must be different from the current password.');
      return;
    }

    setSaving(true);
    try {
      const res = await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.success) {
        setSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError('Failed to change password.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <>
        <div className="mb-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-(--bpa-navy) mb-2">Password Changed</h1>
          <p className="text-gray-500 text-sm">
            Your password has been updated successfully.<br />
            <span className="text-gray-400">আপনার পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।</span>
          </p>
        </div>
        <Link
          href="/profile"
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-(--bpa-navy) text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-(--bpa-navy) mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-(--bpa-navy)/10 flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-(--bpa-navy)" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-(--bpa-navy)">Change Password</h1>
            <p className="text-gray-500 text-sm">পাসওয়ার্ড পরিবর্তন করুন</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Current Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Current Password <span className="font-normal text-gray-400">| বর্তমান পাসওয়ার্ড</span>
          </label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-(--bpa-navy)/20 focus:border-(--bpa-navy) transition-colors text-sm"
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowCurrent((v) => !v)}
              tabIndex={-1}
            >
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            New Password <span className="font-normal text-gray-400">| নতুন পাসওয়ার্ড</span>
          </label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-(--bpa-navy)/20 focus:border-(--bpa-navy) transition-colors text-sm"
              placeholder="Min. 8 characters"
              minLength={8}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowNew((v) => !v)}
              tabIndex={-1}
            >
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {newPassword.length > 0 && newPassword.length < 8 && (
            <p className="text-xs text-amber-600 mt-1">Password must be at least 8 characters.</p>
          )}
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Confirm New Password <span className="font-normal text-gray-400">| পাসওয়ার্ড নিশ্চিত করুন</span>
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-(--bpa-navy)/20 focus:border-(--bpa-navy) transition-colors text-sm"
            placeholder="Re-enter new password"
            autoComplete="new-password"
          />
          {confirmPassword.length > 0 && newPassword !== confirmPassword && (
            <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={saving || newPassword !== confirmPassword || newPassword.length < 8}
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-(--bpa-navy) text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Changing Password…</>
          ) : (
            <><KeyRound className="w-4 h-4" /> Change Password</>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/auth/forgot-password"
          className="text-sm font-medium text-gray-500 hover:text-(--bpa-navy) transition-colors"
        >
          Forgot current password? Reset it →
        </Link>
      </div>
    </>
  );
}
