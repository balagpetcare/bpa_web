'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { initializeDonation, DonationPurpose, DonationCampaign } from '@/lib/api/donations';
import { ApiError } from '@/lib/api';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Alert from '@/components/ui/Alert';
import { Heart, Loader2, ShieldCheck } from 'lucide-react';

interface DonationFormProps {
  purposes: DonationPurpose[];
  campaigns: DonationCampaign[];
}

const PRESET_AMOUNTS = [100, 300, 500, 1000, 3000, 5000, 10000];

const COUNTRIES = [
  'Bangladesh', 'India', 'Pakistan', 'United Kingdom', 'United States',
  'Canada', 'Australia', 'Germany', 'France', 'Singapore', 'UAE', 'Saudi Arabia', 'Other',
];

export default function DonationForm({ purposes, campaigns }: DonationFormProps) {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  
  const [amount, setAmount] = useState<number | string>(
    searchParams.get('amount') || 1000
  );
  const [donorName, setDonorName] = useState(user?.name || '');
  const [donorEmail, setDonorEmail] = useState(user?.email || '');
  const [donorPhone, setDonorPhone] = useState(user?.phone || '');
  const [donorCountry, setDonorCountry] = useState('Bangladesh');
  const [donorType, setDonorType] = useState<'INDIVIDUAL' | 'ORGANIZATION'>('INDIVIDUAL');
  const [organizationName, setOrganizationName] = useState('');
  
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showOnDonorWall, setShowOnDonorWall] = useState(true);
  const [message, setMessage] = useState('');
  
  const [purposeId, setPurposeId] = useState(searchParams.get('purpose') || '');
  const [campaignId, setCampaignId] = useState(searchParams.get('campaign') || '');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync if auth state resolves late
  useEffect(() => {
    if (user && !donorName) setDonorName(user.name || '');
    if (user && !donorEmail) setDonorEmail(user.email || '');
    if (user && !donorPhone) setDonorPhone(user.phone || '');
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount < 50) {
        throw new Error('Minimum donation amount is BDT 50.');
      }
      
      if (!donorName) throw new Error('Donor name is required.');

      const result = await initializeDonation({
        amount: numAmount,
        currency: 'BDT',
        purposeId: purposeId || undefined,
        campaignId: campaignId || undefined,
        donorName,
        donorEmail,
        donorPhone,
        donorCountry,
        donorType: isAnonymous ? 'ANONYMOUS' : donorType,
        organizationName: donorType === 'ORGANIZATION' ? organizationName : undefined,
        isAnonymous,
        showOnDonorWall,
        message,
        source: searchParams.get('source') || undefined,
        qrSlug: searchParams.get('qr') || undefined,
      });

      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        throw new Error('Could not initialize payment gateway.');
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        const body = err.data as Record<string, unknown> | undefined;
        const errorObj = body?.error as Record<string, unknown> | undefined;
        const message =
          (errorObj?.message as string | undefined) ||
          (body?.message as string | undefined) ||
          err.message ||
          'An unexpected error occurred.';
        const refNo = body?.donationReferenceNo as string | undefined;
        setError(refNo ? `${message} (Reference: ${refNo})` : message);
      } else {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      }
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden flex flex-col h-full">
      <div className="bg-(--bpa-navy) p-8 text-white">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
          <Heart className="text-(--bpa-green) fill-current" />
          Make a Donation
        </h2>
        <p className="text-gray-300 text-sm">Your secure contribution is processed via EPS Gateway.</p>
      </div>

      <div className="p-8 flex-1 flex flex-col gap-8">
        {error && <Alert variant="error" message={error} />}

        {/* Amount Selection */}
        <section>
          <label className="block text-sm font-bold text-gray-700 mb-3">1. Select Amount (BDT)</label>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {PRESET_AMOUNTS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAmount(a)}
                className={`py-2.5 text-sm font-bold rounded-xl border transition-all ${
                  Number(amount) === a
                    ? 'bg-(--bpa-green) border-(--bpa-green) text-white shadow-md'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-(--bpa-green) hover:text-(--bpa-green)'
                }`}
              >
                ৳{a.toLocaleString()}
              </button>
            ))}
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">৳</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Custom Amount (Min 50)"
              className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-(--bpa-green) outline-none transition-all font-bold text-lg"
              min="50"
              required
            />
          </div>
        </section>

        {/* Cause Selection */}
        <section className="grid sm:grid-cols-2 gap-4">
          <FormField label="2. Specific Campaign (Optional)">
            <select
              value={campaignId}
              onChange={(e) => {
                setCampaignId(e.target.value);
                if (e.target.value) setPurposeId('');
              }}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-(--bpa-green)"
            >
              <option value="">No specific campaign</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>{c.titleEn}</option>
              ))}
            </select>
          </FormField>
          
          <FormField label="Or Donation Purpose">
            <select
              value={purposeId}
              onChange={(e) => {
                setPurposeId(e.target.value);
                if (e.target.value) setCampaignId('');
              }}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-(--bpa-green)"
              disabled={!!campaignId}
            >
              <option value="">General Welfare Fund</option>
              {purposes.map((p) => (
                <option key={p.id} value={p.id}>{p.titleEn}</option>
              ))}
            </select>
          </FormField>
        </section>

        <hr className="border-gray-100" />

        {/* Donor Info */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-gray-700">3. Donor Details</label>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setDonorType('INDIVIDUAL')}
                className={`px-3 py-1 text-xs font-bold rounded ${donorType === 'INDIVIDUAL' ? 'bg-white shadow-sm text-(--bpa-navy)' : 'text-gray-500'}`}
              >
                Individual
              </button>
              <button
                type="button"
                onClick={() => setDonorType('ORGANIZATION')}
                className={`px-3 py-1 text-xs font-bold rounded ${donorType === 'ORGANIZATION' ? 'bg-white shadow-sm text-(--bpa-navy)' : 'text-gray-500'}`}
              >
                Organization
              </button>
            </div>
          </div>

          {donorType === 'ORGANIZATION' && (
            <FormField label="Organization Name" required>
              <input
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Company / Foundation Name"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-(--bpa-green)"
                required={donorType === 'ORGANIZATION'}
              />
            </FormField>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Full Name" required>
              <input
                type="text"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-(--bpa-green)"
                required
              />
            </FormField>
            <FormField label="Phone Number (Optional)">
              <input
                type="tel"
                value={donorPhone}
                onChange={(e) => setDonorPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-(--bpa-green)"
              />
            </FormField>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Email Address (For PDF Receipt)">
              <input
                type="email"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-(--bpa-green)"
              />
            </FormField>
            <FormField label="Country">
              <select
                value={donorCountry}
                onChange={(e) => setDonorCountry(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-(--bpa-green)"
              >
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>
          </div>

          <FormField label="Message of Support (Optional)">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Leave a message for the team or animals..."
              rows={2}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-(--bpa-green) resize-none"
            />
          </FormField>
        </section>

        {/* Preferences */}
        <section className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnDonorWall}
              onChange={(e) => setShowOnDonorWall(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-(--bpa-green) focus:ring-(--bpa-green)"
            />
            <span className="text-sm text-gray-700 font-medium">Show my donation on the public Donor Wall</span>
          </label>
          {showOnDonorWall && (
            <label className="flex items-center gap-3 cursor-pointer pl-8">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-(--bpa-green) focus:ring-(--bpa-green)"
              />
              <span className="text-sm text-gray-600">Keep my name anonymous (Shows as "Anonymous")</span>
            </label>
          )}
        </section>

        {/* Submit */}
        <div className="mt-auto">
          <Button
            type="submit"
            className="w-full py-5 text-lg font-bold rounded-xl shadow-lg shadow-(--bpa-green)/20"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                Securely Redirecting...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Donate ৳{Number(amount).toLocaleString()}
                <ShieldCheck size={20} />
              </span>
            )}
          </Button>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {[
              { icon: ShieldCheck, label: 'Secure EPS Payment' },
              { icon: Heart, label: 'Official BPA Receipt' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-3 py-2">
                <Icon size={14} className="text-(--bpa-green) shrink-0" />
                <span className="text-xs text-gray-500 font-medium leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}
