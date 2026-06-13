'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Breadcrumb from '@/components/ui/Breadcrumb';

export default function CertVerifyLandingPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const t = token.trim();
    if (!t) { setError('Please enter a certificate number or verification token.'); return; }
    setError('');
    router.push(`/verify/cert/${encodeURIComponent(t)}`);
  }

  return (
    <>
      <section className="bg-gray-50 border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Verify Certificate' }]} />
          <h1 className="mt-4 text-4xl font-bold text-(--bpa-navy)">Certificate Verification</h1>
          <p className="mt-3 text-lg text-gray-500 max-w-xl">
            Verify the authenticity of a BPA vaccination certificate.
          </p>
        </div>
      </section>

      <div className="py-16">
        <div className="max-w-lg mx-auto px-4">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-(--bpa-green) rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={32} className="text-(--bpa-navy)" />
            </div>
            <p className="text-gray-500 text-sm">Enter the certificate number or verification token from the certificate.</p>
          </div>

          <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-4">
            {error && <Alert variant="error" message={error} />}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Certificate Number or Verification Token</label>
              <input
                type="text"
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="e.g. BPA-CERT-20260615-00001 or UUID token"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green)"
              />
            </div>
            <Button type="submit" variant="primary" size="md" className="w-full">
              <Search size={16} /> Verify Certificate
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-400">
            <Link href="/campaigns" className="text-(--bpa-green) hover:underline">Browse campaigns →</Link>
          </div>
        </div>
      </div>
    </>
  );
}
