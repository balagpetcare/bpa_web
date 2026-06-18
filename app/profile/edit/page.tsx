'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Phone, Mail, Save, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

interface FormState {
  name: string;
  phone: string;
}

export default function EditProfilePage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<FormState>({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/sign-in?next=/profile/edit');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? '',
        phone: user.phone ? formatPhoneDisplay(user.phone) : '',
      });
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-(--bpa-navy)" size={32} />
      </div>
    );
  }

  function formatPhoneDisplay(raw: string): string {
    // Convert stored 8801XXXXXXXX → 01XXXXXXXX for display
    if (raw.startsWith('880')) return '0' + raw.slice(3);
    return raw;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const res = await apiFetch('/me/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim() || undefined,
        }),
      });

      if (res.success) {
        await refreshUser();
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      } else {
        setError('Failed to save changes.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f0f4f8 0%, #ffffff 300px)' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back link */}
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-(--bpa-navy) mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div
            className="px-6 py-5 border-b border-gray-100"
            style={{ background: 'linear-gradient(135deg, #1a2540 0%, #1a6b3c 100%)' }}
          >
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Edit Profile</h1>
                <p className="text-white/60 text-sm">প্রোফাইল সম্পাদনা করুন</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">

            {success && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm">
                <CheckCircle className="w-4 h-4 shrink-0" />
                Profile updated successfully! | প্রোফাইল আপডেট হয়েছে
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Full Name <span className="font-normal text-gray-400">| পূর্ণ নাম</span>
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-(--bpa-navy)/20 focus:border-(--bpa-navy) transition-colors text-sm"
                  placeholder="Your full name"
                  maxLength={120}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Mobile Number <span className="font-normal text-gray-400">| মোবাইল নম্বর</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-(--bpa-navy)/20 focus:border-(--bpa-navy) transition-colors text-sm"
                  placeholder="01XXXXXXXXX"
                  maxLength={14}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Enter your 11-digit Bangladesh mobile number (e.g. 01711XXXXXX)</p>
            </div>

            {/* Email — readonly */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address <span className="font-normal text-gray-400">| ইমেল</span>
                <span className="ml-2 text-xs font-normal text-gray-400">(cannot be changed here)</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="email"
                  value={user.email ?? ''}
                  readOnly
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-400 text-sm cursor-not-allowed"
                  placeholder="No email on file"
                />
              </div>
              {!user.email && (
                <p className="text-xs text-amber-600 mt-1">No email linked. Contact support to add an email address.</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-(--bpa-navy) text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                ) : (
                  <><Save className="w-4 h-4" /> Save Changes</>
                )}
              </button>
              <Link
                href="/profile"
                className="inline-flex items-center justify-center px-5 py-3 bg-gray-100 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </Link>
            </div>

            {/* Password link */}
            <div className="border-t border-gray-100 pt-4 text-center">
              <Link
                href="/auth/change-password"
                className="text-sm font-medium text-(--bpa-navy) hover:text-(--bpa-green) transition-colors"
              >
                Change Password →
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
