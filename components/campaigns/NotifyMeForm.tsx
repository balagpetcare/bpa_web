'use client';

import { useState } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { submitContactInquiry } from '@/lib/api/contact-inquiry';

interface NotifyMeFormProps {
  areaLabel: string;
  buttonLabel?: string;
  confirmedLabel?: string;
}

// Lightweight "notify me" affordance for empty-venue states. There is no
// dedicated subscription system yet, so this creates a real, actionable
// contact inquiry ticket (visible to BPA staff) rather than a fake promise.
export default function NotifyMeForm({ areaLabel, buttonLabel, confirmedLabel }: NotifyMeFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await submitContactInquiry({
        name: name.trim(),
        email: `notify-${Date.now()}@no-email.bpa`,
        phone: phone.trim(),
        subject: `Notify me: vaccination camp interest — ${areaLabel}`,
        message: `${name.trim()} (${phone.trim()}) would like to be notified when a campaign venue/session opens in "${areaLabel}".`,
        consentGiven: true,
      });
      setDone(true);
    } catch {
      setError('Could not submit right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 text-sm text-(--bpa-green) font-medium">
        <CheckCircle2 size={16} />
        {confirmedLabel ?? `We'll notify you when a campaign starts in ${areaLabel}.`}
      </div>
    );
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Bell size={14} className="mr-1.5" />
        {buttonLabel ?? 'Notify me when a campaign starts here'}
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--bpa-green)"
        required
      />
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Mobile number"
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--bpa-green)"
        required
      />
      <Button type="submit" variant="primary" size="sm" disabled={submitting}>
        {submitting ? 'Submitting…' : 'Notify me'}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}
