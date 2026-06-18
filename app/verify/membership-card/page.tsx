'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

export default function MembershipCardVerifyLandingPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const t = token.trim();
    if (!t) { setError('Please enter a QR token or card number.'); return; }
    setError('');
    router.push(`/verify/membership-card/${encodeURIComponent(t)}`);
  }

  return (
    <>
      <section className="bg-gray-50 border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-400 mb-4 flex gap-2 items-center">
            <Link href="/" className="hover:text-(--bpa-green)">Home</Link>
            <span>/</span>
            <span className="text-gray-600">Verify Membership Card</span>
          </nav>
          <h1 className="text-4xl font-bold text-(--bpa-navy)">Verify Membership Card</h1>
          <p className="mt-3 text-lg text-gray-500 max-w-xl">
            Verify the authenticity and status of a BPA Community Care Partner Card.
          </p>
        </div>
      </section>

      <div className="py-16">
        <div className="max-w-lg mx-auto px-4">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-(--bpa-green) rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={32} className="text-white" />
            </div>
            <p className="text-gray-500 text-sm">
              Scan the QR code on the card or enter the verification token printed on the card.
            </p>
          </div>

          <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-4">
            {error && <Alert variant="error" message={error} />}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">QR Token or Card Number</label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste verification token here"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-(--bpa-green)"
              />
            </div>
            <Button type="submit" variant="primary" size="md" className="w-full">
              <Search size={16} /> Verify Card
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-400 space-y-1">
            <p>
              <Link href="/membership/lookup" className="text-(--bpa-green) hover:underline">
                Look up your membership by card number + mobile →
              </Link>
            </p>
            <p>
              <Link href="/verify/care-card" className="text-(--bpa-green) hover:underline">
                Verify a Care Partner Card (৳3,000 contribution) →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
