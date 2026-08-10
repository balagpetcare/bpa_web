'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Clock, Search, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { getCampaignBySlug, getCampaignSessions, getCampaignSessionById, joinWaitlist } from '@/lib/api/campaigns';
import type { CampaignDetail, CampaignWaitlistEntry, CampaignSessionListItem } from '@/types/bpa.types';

const SESSION_PAGE_SIZE = 20;

export default function WaitlistFormWrapper() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const slug = params.slug;
  const preselectedSession = searchParams.get('session') ?? '';

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<CampaignWaitlistEntry | null>(null);

  const [sessionId, setSessionId] = useState(preselectedSession);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [petCount, setPetCount] = useState(1);

  // Session picker: paginated/searchable, never a full campaign.sessions
  // dump — see GET /public/campaigns/:slug/sessions.
  const [sessions, setSessions] = useState<CampaignSessionListItem[]>([]);
  const [sessionsPage, setSessionsPage] = useState(1);
  const [sessionsHasNext, setSessionsHasNext] = useState(false);
  const [sessionSearchInput, setSessionSearchInput] = useState('');
  const [sessionSearch, setSessionSearch] = useState('');
  const [loadingSessions, setLoadingSessions] = useState(true);
  // A deep-linked (?session=) session may not be on the first fetched page —
  // resolved separately by id so the user is never forced to search for it.
  const [preselectedResolved, setPreselectedResolved] = useState<CampaignSessionListItem | null>(null);

  // Campaign metadata only (status/pricing/title) — never the full sessions array.
  useEffect(() => {
    getCampaignBySlug(slug, undefined, undefined, false)
      .then(c => { setCampaign(c); setLoading(false); })
      .catch(() => { setError('Failed to load campaign.'); setLoading(false); });
  }, [slug]);

  useEffect(() => {
    if (!preselectedSession) return;
    getCampaignSessionById(slug, preselectedSession).then(setPreselectedResolved).catch(() => {});
  }, [slug, preselectedSession]);

  const fetchSessions = useCallback((page: number, search: string, mode: 'replace' | 'append') => {
    setLoadingSessions(true);
    getCampaignSessions(slug, { search: search || undefined, tab: 'upcoming', page, limit: SESSION_PAGE_SIZE })
      .then(({ items, meta }) => {
        setSessions((prev) => (mode === 'append' ? [...prev, ...items] : items));
        setSessionsPage(page);
        setSessionsHasNext(Boolean(meta.hasNext ?? (meta.page < meta.totalPages)));
      })
      .catch(() => { /* keep prior list on transient failure */ })
      .finally(() => setLoadingSessions(false));
  }, [slug]);

  useEffect(() => { fetchSessions(1, sessionSearch, 'replace'); }, [fetchSessions, sessionSearch]);

  function onSessionSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSessionSearch(sessionSearchInput.trim());
  }

  // Merge the deep-linked session into the visible list even if it isn't on
  // the current page/search results, so the user never has to search for it.
  const sessionOptions = useMemo(() => {
    if (!preselectedResolved || sessions.some((s) => s.id === preselectedResolved.id)) return sessions;
    return [preselectedResolved, ...sessions];
  }, [sessions, preselectedResolved]);

  if (loading) return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-2 border-(--bpa-navy) border-t-transparent" /></div>;
  if (!campaign) return <div className="text-center py-24 text-gray-500">Campaign not found.</div>;

  if (!['registration_open', 'registration_closed'].includes(campaign.status)) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <Alert variant="info" title="Waitlist Not Available" message="The waitlist is not available for this campaign right now." />
        <Link href={`/campaigns/${slug}`} className="mt-6 inline-flex items-center gap-2 text-sm text-(--bpa-green) hover:underline"><ArrowLeft size={14} /> Back to Campaign</Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!campaign) return;
    if (!sessionId) { setError('Please select a session.'); return; }
    if (!name.trim()) { setError('Name is required.'); return; }
    if (!mobile.trim() || mobile.length < 7) { setError('Valid mobile number is required.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const entry = await joinWaitlist({
        campaignId: campaign.id,
        sessionId,
        ownerName: name,
        mobile,
        email: email || undefined,
        petCount,
      });
      setSuccess(entry);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to join waitlist. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-(--bpa-green) rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-(--bpa-green)" />
            </div>
            <h1 className="text-2xl font-bold text-(--bpa-navy) mb-2">You&apos;re on the Waitlist!</h1>
            <p className="text-gray-500 mb-6">You are <strong>#{success.position}</strong> in the queue for {campaign.title}.</p>
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-left mb-6">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock size={14} className="text-(--bpa-green)" />
                <span>We will SMS you if a slot opens up.</span>
              </div>
            </div>
            <Link href={`/campaigns/${slug}`} className="inline-flex items-center gap-2 text-sm text-(--bpa-green) hover:underline">
              <ArrowLeft size={14} /> Back to Campaign
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-lg mx-auto px-4">
        <div className="mb-6">
          <Link href={`/campaigns/${slug}`} className="inline-flex items-center gap-1 text-sm text-(--bpa-green) hover:underline mb-4">
            <ArrowLeft size={14} /> Back to Campaign
          </Link>
          <h1 className="text-2xl font-bold text-(--bpa-green)">Join Waiting List</h1>
          <p className="text-sm text-gray-500 mt-1">{campaign.title}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-5">
          {error && <Alert variant="error" message={error} />}

          {/* Session */}
          <div>
            <label htmlFor="waitlist-session-search" className="block text-sm font-medium text-gray-700 mb-2">Session <span className="text-red-500">*</span></label>

            <form onSubmit={onSessionSearchSubmit} className="mb-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="waitlist-session-search"
                  type="search"
                  value={sessionSearchInput}
                  onChange={(e) => setSessionSearchInput(e.target.value)}
                  placeholder="Search venue, district or area…"
                  className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green)"
                />
              </div>
            </form>

            {sessionOptions.length === 0 && !loadingSessions ? (
              <p className="text-sm text-gray-400 text-center py-4">No upcoming sessions match your search.</p>
            ) : (
              <div className="space-y-2">
                {sessionOptions.map(s => (
                  <label key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${sessionId === s.id ? 'border-(--bpa-navy) bg-(--bpa-green)' : 'border-gray-200 hover:border-(--bpa-navy)'}`}>
                    <input type="radio" name="session" value={s.id} checked={sessionId === s.id} onChange={() => setSessionId(s.id)} className="accent-(--bpa-navy)" />
                    <div>
                      <p className="text-sm font-medium text-(--bpa-green)">{s.venue?.name ?? 'TBC'}</p>
                      <p className="text-xs text-gray-400">{new Date(s.sessionDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {s.startTime}–{s.endTime}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {sessionsHasNext && (
              <button
                type="button"
                onClick={() => fetchSessions(sessionsPage + 1, sessionSearch, 'append')}
                disabled={loadingSessions}
                className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-(--bpa-green) hover:underline disabled:opacity-60"
              >
                {loadingSessions && <Loader2 size={12} className="animate-spin" />} Load more sessions
              </button>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green)" />
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number <span className="text-red-500">*</span></label>
            <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} inputMode="tel" placeholder="e.g. 01712345678" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green)" />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green)" />
          </div>

          {/* Pet count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Pets <span className="text-red-500">*</span></label>
            <select value={petCount} onChange={e => setPetCount(Number(e.target.value))} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green)">
              {Array.from({ length: campaign.maxPetsPerBooking }, (_, i) => i + 1).map(n => (
                <option key={n} value={n}>{n} pet{n !== 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          <Button type="submit" variant="primary" size="md" className="w-full" loading={submitting}>
            Join Waiting List
          </Button>
        </form>
      </div>
    </div>
  );
}
