'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, Plus, Trash2, Syringe, User,
  CheckCircle, MapPin, CalendarDays, Clock, Search, Building2, Download,
} from 'lucide-react';
import { AutoDownloadFile } from '@/components/common/AutoDownloadFile';
import Button from '@/components/ui/Button';
import { getApiOrigin } from '@/lib/utils/api-url';
import Alert from '@/components/ui/Alert';
import type { LocationValue } from '@/components/location/LocationSelector';
import BookingLocationPicker from '@/components/location/BookingLocationPicker';
import NotifyMeForm from '@/components/campaigns/NotifyMeForm';
import { getCampaignBySlug, createGuestPets, registerForCampaign } from '@/lib/api/campaigns';
import { ApiError } from '@/lib/api';
import { normalizeCampaignPricing, formatMoney } from '@/lib/utils/format';
import { getPublicSiteSettings, type PublicSiteSettings } from '@/lib/api/site-settings';
import type { CampaignDetail, CampaignSession, CampaignVenue, GuestPet, PetType, PetGender } from '@/types/bpa.types';

// ─── Constants ────────────────────────────────────────────────────────────────

const PET_TYPES: { value: PetType; label: string }[] = [
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
  { value: 'bird', label: 'Bird' },
  { value: 'rabbit', label: 'Rabbit' },
  { value: 'guinea_pig', label: 'Guinea Pig' },
  { value: 'fish', label: 'Fish' },
  { value: 'reptile', label: 'Reptile' },
  { value: 'other', label: 'Other' },
];

const GENDERS: { value: PetGender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'unknown', label: 'Unknown' },
];

const STEP_LABELS = ['Location', 'Date', 'Time Slot', 'Your Info', 'Pets', 'Review'] as const;
const TOTAL_STEPS = 6;

const PERIOD_CONFIG = {
  morning:   { label: 'Morning',   sub: '6 AM – 12 PM' },
  afternoon: { label: 'Afternoon', sub: '12 PM – 5 PM' },
  evening:   { label: 'Evening',   sub: '5 PM onwards' },
} as const;

type SlotPeriod = keyof typeof PERIOD_CONFIG;

// ─── Types ────────────────────────────────────────────────────────────────────

interface OwnerInfo { name: string; mobile: string; email: string; address: string }
interface PetInfo extends GuestPet { _id: string }

interface VenueGroup {
  venue: CampaignVenue;
  available: number;
  totalCapacity: number;
  dateCount: number;
}

interface DateOption {
  date: string;
  available: number;
  totalCapacity: number;
  slotCount: number;
}

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function emptyPet(t: PetType = 'dog'): PetInfo {
  return { _id: Math.random().toString(36).slice(2), name: '', petType: t, gender: 'male' };
}

/**
 * Parses any date value (ISO timestamp, date-only string, Date object) to a
 * valid Date, or null if unparseable. Never throws.
 *
 * Handles the two common shapes from Prisma JSON:
 *   "2026-06-16T00:00:00.000Z"  — full ISO timestamp
 *   "2026-06-16"                — date-only string
 */
function parseValidDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value !== 'string') return null;
  // Normalise: if it looks like YYYY-MM-DD with no time, append T00:00:00
  // so the parser treats it as local midnight rather than UTC midnight.
  const normalised = /^\d{4}-\d{2}-\d{2}$/.test(value.trim())
    ? value.trim() + 'T00:00:00'
    : value.trim();
  const d = new Date(normalised);
  if (Number.isNaN(d.getTime())) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[BPA] parseValidDate: unparseable value →', value);
    }
    return null;
  }
  return d;
}

/**
 * Extracts a canonical YYYY-MM-DD local date key from a session.
 * Falls back from sessionDate → startTime combo, then skips if still invalid.
 */
function sessionDateKey(s: CampaignSession): string | null {
  // Try sessionDate first (may be "2026-06-16" or "2026-06-16T00:00:00.000Z")
  const raw = s.sessionDate as unknown;
  const d = parseValidDate(raw);
  if (!d) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[BPA] Invalid session date skipped', s);
    }
    return null;
  }
  // Normalise to YYYY-MM-DD in local time so grouping is consistent
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${da}`;
}

function getPeriod(startTime: string): SlotPeriod {
  const h = parseInt((startTime ?? '').split(':')[0], 10);
  if (!Number.isFinite(h)) return 'morning';
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function fmt12(t: string): string {
  if (!t) return '';
  const parts = t.split(':').map(Number);
  const h = parts[0] ?? 0;
  const m = parts[1] ?? 0;
  if (!Number.isFinite(h) || !Number.isFinite(m)) return t;
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

/**
 * Formats a YYYY-MM-DD date key for display. Returns '' on invalid input
 * so callers can guard with `if (!label)`.
 */
function fmtDate(dateKey: string, opts?: Intl.DateTimeFormatOptions): string {
  const d = parseValidDate(dateKey);
  if (!d) return '';
  return d.toLocaleDateString('en-GB', opts ?? {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function buildVenueGroups(sessions: CampaignSession[]): VenueGroup[] {
  const map = new Map<string, VenueGroup>();
  for (const s of sessions) {
    if (!s.isActive || !s.venue || !sessionDateKey(s)) continue;
    const id = s.venue.id;
    if (!map.has(id)) map.set(id, { venue: s.venue, available: 0, totalCapacity: 0, dateCount: 0 });
    const g = map.get(id)!;
    g.totalCapacity += s.capacity;
    g.available += Math.max(0, s.capacity - s.bookedCount);
  }
  for (const [venueId, g] of map) {
    const dates = new Set(
      sessions
        .filter(s => s.isActive && s.venue?.id === venueId && s.capacity > s.bookedCount)
        .map(s => sessionDateKey(s))
        .filter(Boolean),
    );
    g.dateCount = dates.size;
  }
  return [...map.values()].sort((a, b) => b.available - a.available);
}

function buildDateOptions(sessions: CampaignSession[], venueId: string): DateOption[] {
  const map = new Map<string, DateOption>();
  for (const s of sessions) {
    if (!s.isActive || s.venue?.id !== venueId) continue;
    const key = sessionDateKey(s);
    if (!key) continue;
    if (!map.has(key)) map.set(key, { date: key, available: 0, totalCapacity: 0, slotCount: 0 });
    const d = map.get(key)!;
    d.available += Math.max(0, s.capacity - s.bookedCount);
    d.totalCapacity += s.capacity;
    d.slotCount++;
  }
  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function buildSlots(sessions: CampaignSession[], venueId: string, dateKey: string): CampaignSession[] {
  return sessions
    .filter(s => s.isActive && s.venue?.id === venueId && sessionDateKey(s) === dateKey)
    .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''));
}

// ─── UI primitives ────────────────────────────────────────────────────────────

function CapacityPill({ available, total }: { available: number; total: number }) {
  const pct = total > 0 ? Math.round((available / total) * 100) : 0;
  const cls = available <= 0 ? 'text-red-500' : pct <= 20 ? 'text-amber-600' : 'text-emerald-600';
  return <span className={`text-[11px] font-bold ${cls}`}>{available <= 0 ? 'Full' : `${available} left`}</span>;
}

function MiniBar({ available, total }: { available: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round(((total - available) / total) * 100)) : 0;
  const color = pct >= 100 ? 'bg-red-400' : pct >= 80 ? 'bg-amber-400' : 'bg-(--bpa-green)';
  return (
    <div className="h-1 bg-gray-100 rounded-full overflow-hidden mt-2">
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function StepProgress({ step }: { step: number }) {
  const pct = Math.round(((step - 1) / (TOTAL_STEPS - 1)) * 100);
  return (
    <div className="mb-7">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-(--bpa-green) uppercase tracking-widest">Step {step} / {TOTAL_STEPS}</span>
        <span className="text-xs font-semibold text-(--bpa-navy)">{STEP_LABELS[step - 1]}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-(--bpa-green) rounded-full transition-all duration-500 ease-out" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex mt-1.5">
        {STEP_LABELS.map((_, i) => {
          const n = i + 1;
          return (
            <div key={n} className="flex-1 flex justify-center">
              <div className={`w-1.5 h-1.5 rounded-full transition-all ${n < step ? 'bg-(--bpa-green)' : n === step ? 'bg-(--bpa-green) scale-125' : 'bg-gray-200'}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SelectionCrumb({
  venue, date, session, onClear,
}: {
  venue: CampaignVenue | null;
  date: string;
  session: CampaignSession | null;
  onClear: (field: 'venue' | 'date' | 'slot') => void;
}) {
  if (!venue) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mb-5 p-3 bg-gray-50 rounded-xl border border-gray-200">
      <button type="button" onClick={() => onClear('venue')}
        className="inline-flex items-center gap-1 text-[11px] font-medium bg-white border border-gray-200 text-(--bpa-navy) px-2.5 py-1.5 rounded-lg hover:border-red-300 hover:text-red-600 transition-colors group">
        <MapPin size={9} className="text-(--bpa-green) group-hover:text-red-500 shrink-0" />
        <span className="truncate max-w-[120px]">{venue.name}</span>
        <span className="text-gray-300 ml-0.5">×</span>
      </button>
      {date && (
        <button type="button" onClick={() => onClear('date')}
          className="inline-flex items-center gap-1 text-[11px] font-medium bg-white border border-gray-200 text-(--bpa-navy) px-2.5 py-1.5 rounded-lg hover:border-red-300 hover:text-red-600 transition-colors group">
          <CalendarDays size={9} className="text-(--bpa-green) group-hover:text-red-500 shrink-0" />
          {parseValidDate(date)?.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) ?? date}
          <span className="text-gray-300 ml-0.5">×</span>
        </button>
      )}
      {session && (
        <button type="button" onClick={() => onClear('slot')}
          className="inline-flex items-center gap-1 text-[11px] font-medium bg-white border border-gray-200 text-(--bpa-navy) px-2.5 py-1.5 rounded-lg hover:border-red-300 hover:text-red-600 transition-colors group">
          <Clock size={9} className="text-(--bpa-green) group-hover:text-red-500 shrink-0" />
          {fmt12(session.startTime)}
          <span className="text-gray-300 ml-0.5">×</span>
        </button>
      )}
    </div>
  );
}

function PetForm({ pet, index, onChange, onRemove, canRemove, petTypes, lockedType }: {
  pet: PetInfo; index: number;
  onChange: (id: string, field: keyof PetInfo, value: string | number) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
  petTypes: { value: PetType; label: string }[];
  lockedType: { value: PetType; label: string } | null;
}) {
  const f = (field: keyof PetInfo) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange(pet._id, field, e.target.type === 'number' ? Number(e.target.value) : e.target.value);
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-(--bpa-navy) text-sm flex items-center gap-1.5">
          <span className="w-5 h-5 bg-(--bpa-green) text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">{index + 1}</span>
          Pet {index + 1}
        </h4>
        {canRemove && (
          <button type="button" onClick={() => onRemove(pet._id)} className="text-red-400 hover:text-red-600 p-1 transition-colors">
            <Trash2 size={14} />
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Name <span className="text-red-500">*</span></label>
          <input value={pet.name} onChange={f('name')} placeholder="e.g. Buddy" required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green)" />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Type <span className="text-red-500">*</span></label>
          {lockedType ? (
            <div className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-500 flex items-center gap-1.5 cursor-not-allowed">
              <span className="font-semibold text-(--bpa-navy)">{lockedType.label}</span>
              <span className="text-gray-400 text-[10px]">· locked</span>
            </div>
          ) : (
            <select value={pet.petType} onChange={f('petType')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green) bg-white">
              {petTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Gender <span className="text-red-500">*</span></label>
          <select value={pet.gender} onChange={f('gender')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green) bg-white">
            {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Age (months)</label>
          <input type="number" min={0} value={pet.approxAge ?? ''} onChange={f('approxAge')} placeholder="e.g. 12"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green)" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Breed</label>
          <input value={pet.breed ?? ''} onChange={f('breed')} placeholder="e.g. Labrador"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green)" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Weight (kg)</label>
          <input type="number" step="0.1" min={0.1} value={pet.weightKg ?? ''} onChange={f('weightKg')} placeholder="e.g. 5.5"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green)" />
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RegistrationFormWrapper() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug;
  const preselectedSessionId = searchParams.get('session') ?? '';

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [siteSettings, setSiteSettings] = useState<PublicSiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [paymentUnavailable, setPaymentUnavailable] = useState(false);
  const [pendingBookingNumber, setPendingBookingNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');

  // Step 1 starts with a location-first picker (Dhaka City / Outside Dhaka);
  // once chosen, the backend filters this campaign's own sessions down to a
  // single best-matching proximity tier (never mixing tiers).
  const [bookingLocationId, setBookingLocationId] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

  // Hierarchical selection
  const [selectedVenueId, setSelectedVenueId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('');

  // Form data
  const [owner, setOwner] = useState<OwnerInfo>({ name: '', mobile: '', email: '', address: '' });
  const [ownerLocationValue, setOwnerLocationValue] = useState<LocationValue>({});
  const [pets, setPets] = useState<PetInfo[]>([emptyPet()]);

  useEffect(() => {
    Promise.all([
      getCampaignBySlug(slug),
      getPublicSiteSettings(),
    ])
      .then(([c, settings]) => {
        setCampaign(c);
        setSiteSettings(settings);
        if (preselectedSessionId && c) {
          const s = c.sessions.find(x => x.id === preselectedSessionId);
          if (s?.venue) {
            setSelectedVenueId(s.venue.id);
            setSelectedDate(sessionDateKey(s) ?? '');
            setSelectedSessionId(s.id);
            setStep(4);
          }
        }
        setLoading(false);
      })
      .catch(() => { setError('Failed to load campaign.'); setLoading(false); });
  }, [slug, preselectedSessionId]);

  // Once a location is chosen (and it's not the "skip" escape hatch), ask the
  // backend to filter this campaign's sessions to the single best-matching
  // geographic tier (exact -> upazila/zone -> district/city corp -> division,
  // or an explicit empty state). The backend never mixes tiers and never
  // falls back to unrelated venues elsewhere in the campaign.
  useEffect(() => {
    if (!bookingLocationId || bookingLocationId === 'skip') return;
    setLocationLoading(true);
    getCampaignBySlug(slug, bookingLocationId)
      .then((c) => setCampaign(c))
      .catch(() => setError('Failed to load venues for your location.'))
      .finally(() => setLocationLoading(false));
  }, [slug, bookingLocationId]);

  // ── Derived data (all client-side, zero extra API calls) ──────────────────

  const activeSessions = useMemo(() => campaign?.sessions.filter(s => s.isActive) ?? [], [campaign]);

  const venueGroups = useMemo(() => buildVenueGroups(activeSessions), [activeSessions]);

  // The backend already restricted venueGroups to a single proximity tier —
  // this is a free-text refinement within that tier only, not a re-rank.
  const filteredVenues = useMemo(() => {
    const q = locationSearch.toLowerCase().trim();
    if (!q) return venueGroups;
    return venueGroups.filter(g =>
      g.venue.name.toLowerCase().includes(q) ||
      g.venue.zone?.name.toLowerCase().includes(q) ||
      g.venue.zone?.cityCorporation?.name.toLowerCase().includes(q) ||
      (g.venue.locationPath ?? []).some(l => l.nameEn.toLowerCase().includes(q)) ||
      (g.venue.address ?? '').toLowerCase().includes(q),
    );
  }, [venueGroups, locationSearch]);

  const venueMatchMessage = bookingLocationId && bookingLocationId !== 'skip'
    ? campaign?.venueMatch?.message
    : undefined;
  const isExactMatch = campaign?.venueMatch?.tier === 'exact';

  const dateOptions = useMemo(() => buildDateOptions(activeSessions, selectedVenueId), [activeSessions, selectedVenueId]);
  const slotOptions = useMemo(() => buildSlots(activeSessions, selectedVenueId, selectedDate), [activeSessions, selectedVenueId, selectedDate]);

  const selectedVenue = useMemo(() => venueGroups.find(g => g.venue.id === selectedVenueId)?.venue ?? null, [venueGroups, selectedVenueId]);
  const selectedSession = useMemo(() => slotOptions.find(s => s.id === selectedSessionId) ?? null, [slotOptions, selectedSessionId]);

  // The booking's location context comes from the venue the user already
  // picked in step 1 — never re-asked in "Your Info" (requirement: no
  // re-prompt for location as an optional field).
  useEffect(() => {
    if (!selectedVenue?.locationPath?.length) return;
    const byType = new Map(selectedVenue.locationPath.map(l => [l.type, l.id]));
    setOwnerLocationValue({
      divisionId: byType.get('DIVISION'),
      districtId: byType.get('DISTRICT'),
      upazilaId: byType.get('UPAZILA') ?? byType.get('THANA'),
      unionId: byType.get('UNION') ?? byType.get('POURASHAVA'),
      cityCorporationId: byType.get('CITY_CORPORATION'),
      cityZoneId: byType.get('CITY_ZONE'),
      wardId: byType.get('WARD'),
    });
  }, [selectedVenue]);

  const slotsByPeriod = useMemo(() =>
    slotOptions.reduce((acc, s) => {
      const p = getPeriod(s.startTime);
      acc[p] = [...(acc[p] ?? []), s];
      return acc;
    }, {} as Partial<Record<SlotPeriod, CampaignSession[]>>),
  [slotOptions]);

  const allowedPetTypes = useMemo(() => {
    if (!campaign?.allowedPetTypes?.length) return PET_TYPES;
    const allowedLower = campaign.allowedPetTypes.map(t => t.toLowerCase());
    return PET_TYPES.filter(t => allowedLower.includes(t.value.toLowerCase()));
  }, [campaign]);

  // When there's only one allowed type, auto-assign it to all pets
  const singleLockedType = allowedPetTypes.length === 1 ? allowedPetTypes[0] : null;

  // ── Side Effects ──────────────────────────────────────────────────────────

  // Force pet type normalization and clear stale errors when singleLockedType exists
  useEffect(() => {
    if (singleLockedType && pets.length > 0) {
      const needsUpdate = pets.some(p => p.petType !== singleLockedType.value);
      if (needsUpdate) {
        setPets(current => current.map(p => ({ ...p, petType: singleLockedType.value })));
      }
      // Clear error if it's a stale "only accepts" message
      if (error.includes('only accepts') && error.includes(singleLockedType.label)) {
        setError('');
      }
    }
  }, [singleLockedType, pets.length, error]);

  const maxPets = useMemo(() => {
    if (!campaign) return 1;
    const slotLimit = selectedSession ? Math.max(0, selectedSession.capacity - selectedSession.bookedCount) : campaign.maxPetsPerBooking;
    return Math.min(campaign.maxPetsPerBooking, slotLimit);
  }, [campaign, selectedSession]);

  const pricing = useMemo(() => normalizeCampaignPricing(campaign), [campaign]);

  // ── Navigation ────────────────────────────────────────────────────────────

  function clearSelection(field: 'venue' | 'date' | 'slot') {
    setError('');
    if (field === 'venue') { setSelectedVenueId(''); setSelectedDate(''); setSelectedSessionId(''); setStep(1); }
    else if (field === 'date') { setSelectedDate(''); setSelectedSessionId(''); setStep(2); }
    else { setSelectedSessionId(''); setStep(3); }
  }

  function validateStep(s: number): string {
    if (s === 1 && !selectedVenueId) return 'Please select a location.';
    if (s === 2 && !selectedDate) return 'Please select a date.';
    if (s === 3 && !selectedSessionId) return 'Please select a time slot.';
    if (s === 4) {
      if (!owner.name.trim()) return 'Your name is required.';
      if (!owner.mobile.trim() || owner.mobile.length < 7) return 'A valid mobile number is required.';
    }
    if (s === 5) {
      if (pets.some(p => !p.name.trim())) return 'All pets must have a name.';
      if (campaign?.allowedPetTypes?.length) {
        const allowedLower = campaign.allowedPetTypes.map(t => t.toLowerCase());
        const bad = pets.filter(p => !allowedLower.includes(p.petType.toLowerCase()));
        if (bad.length && !singleLockedType) {
          return `${bad.map(p => p.name || 'Pet').join(', ')}: this campaign only accepts ${allowedPetTypes.map(t => t.label).join(', ')}.`;
        }
      }
      if (selectedSession && pets.length > maxPets) return `Only ${maxPets} slot${maxPets !== 1 ? 's' : ''} left. Reduce pet count.`;
    }
    return '';
  }

  function next() {
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setError('');
    setStep(s => s + 1);
  }

  function prev() { setError(''); setStep(s => s - 1); }

  function addPet() {
    if (pets.length >= maxPets) return;
    const defaultType = singleLockedType?.value ?? allowedPetTypes[0]?.value ?? 'dog';
    setPets(p => [...p, emptyPet(defaultType)]);
  }
  function removePet(id: string) { setPets(p => p.filter(x => x._id !== id)); }
  function updatePet(id: string, field: keyof PetInfo, value: string | number) {
    setPets(p => p.map(x => x._id === id ? { ...x, [field]: value } : x));
  }

  async function handleSubmit() {
    const err = validateStep(5);
    if (err) { setError(err); return; }
    setError('');
    setSubmitting(true);
    if (!campaign) { setSubmitting(false); return; }
    try {
      // Final normalization of pet types before submission
      const normalizedPets = pets.map(p => ({
        ...p,
        petType: singleLockedType ? singleLockedType.value : p.petType
      }));

      const guestData = await createGuestPets(
        { ownerName: owner.name, mobile: owner.mobile, email: owner.email || undefined, address: owner.address || undefined, ...ownerLocationValue },
        normalizedPets.map(({ _id: _unused, ...p }) => ({
          name: p.name, petType: p.petType, gender: p.gender,
          approxAge: p.approxAge, breed: p.breed || undefined, color: p.color, weightKg: p.weightKg,
        })),
      );
      const result = await registerForCampaign({
        campaignId: campaign.id, sessionId: selectedSessionId,
        ownerName: owner.name, mobile: owner.mobile,
        email: owner.email || undefined, address: owner.address || undefined,
        petIds: guestData.petIds,
      });
      if (result.paymentGatewayUnavailable) {
        // Booking created but payment gateway unavailable or failed — show manual payment instructions
        setPendingBookingNumber(result.registration.bookingNumber);
        setPaymentUnavailable(true);
        setSubmitting(false);
        return;
      }
      if (!result.isFree && result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        router.push(`/campaigns/${slug}/booking/${result.registration.bookingNumber}`);
      }
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 429) {
        setError('Too many attempts. Please wait a few minutes before trying again.');
      } else {
        // Don't expose technical error messages to the customer
        setError(
          siteSettings?.registrationErrorMessage ??
          'Online registration/payment is temporarily unavailable. Please call BPA support for assistance.',
        );
      }
      setSubmitting(false);
    }
  }

  // ── Early exits ───────────────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen bg-gray-50 pt-24 flex justify-center pt-32">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-(--bpa-green) border-t-transparent" />
    </div>
  );

  if (!campaign) return (
    <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center text-gray-500 text-sm">
      Campaign not found.
    </div>
  );

  // Booking created but online payment couldn't be initialised — show manual payment / visit center instructions
  if (paymentUnavailable) {
    const phone = siteSettings?.supportPhone ?? siteSettings?.officialPhone;
    const whatsapp = siteSettings?.whatsappNumber;
    const apiBase = getApiOrigin();
    const pdfUrl = pendingBookingNumber
      ? `${apiBase}/api/v1/public/campaign-registrations/booking/${encodeURIComponent(pendingBookingNumber)}/slip.pdf`
      : null;
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-10">
        {pdfUrl && pendingBookingNumber && (
          <AutoDownloadFile
            url={pdfUrl}
            filename={`BPA-Booking-Slip-${pendingBookingNumber}.pdf`}
            storageKey={`bpa_booking_slip_downloaded_${pendingBookingNumber}`}
            delayMs={700}
          />
        )}
        <div className="max-w-lg mx-auto px-4 py-10">
          <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-7">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-(--bpa-navy) mb-1 text-center">Booking Confirmed!</h2>
            <p className="text-sm text-gray-500 text-center mb-5">
              আপনার বুকিং সংরক্ষিত হয়েছে। Your registration is saved.
            </p>

            {pendingBookingNumber && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-4 mb-5">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Booking Reference</p>
                <p className="font-mono font-extrabold text-(--bpa-navy) text-2xl tracking-wider">{pendingBookingNumber}</p>
                <p className="text-xs text-gray-500 mt-1">Save this reference — you&apos;ll need it at the vaccination center.</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-4 mb-5 text-sm">
              <p className="font-bold text-blue-800 mb-2">Visit the vaccination center to pay</p>
              <p className="text-blue-700 mb-2">
                Online payment is temporarily unavailable. You can visit the vaccination center on your selected date
                and pay at the venue. Show your booking reference at the entrance.
              </p>
              <p className="text-blue-600 text-xs">
                অনলাইন পেমেন্ট সাময়িকভাবে উপলব্ধ নেই। আপনি নির্ধারিত তারিখে টিকাদান কেন্দ্রে গিয়ে সরাসরি পেমেন্ট করতে পারবেন।
                প্রবেশদ্বারে আপনার বুকিং রেফারেন্স দেখান।
              </p>
            </div>

            <div className="space-y-2.5">
              {pdfUrl && (
                <div>
                  <p className="text-xs text-gray-400 mb-1.5 text-center">
                    Your booking slip download should start automatically. If not, tap below.
                  </p>
                  <p className="text-xs text-gray-400 mb-2 text-center">
                    আপনার বুকিং স্লিপ স্বয়ংক্রিয়ভাবে ডাউনলোড শুরু হবে। না হলে নিচের বাটনে চাপ দিন।
                  </p>
                  <a
                    href={pdfUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-(--bpa-green) text-white font-bold px-5 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm"
                  >
                    <Download size={15} /> Download Booking Slip PDF
                  </a>
                </div>
              )}
              {phone && (
                <a
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  className="flex items-center justify-center gap-2 bg-(--bpa-navy) text-white font-bold px-5 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm"
                >
                  <span>📞</span> Call BPA Support: {phone}
                </a>
              )}
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold px-5 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm"
                >
                  <span>💬</span> WhatsApp: {whatsapp}
                </a>
              )}
              {!phone && !whatsapp && !pdfUrl && (
                <p className="text-sm text-gray-500 text-center">Please contact BPA to confirm your booking details.</p>
              )}
            </div>

            <div className="mt-6 text-center">
              <Link href={`/campaigns/${slug}`} className="text-sm text-(--bpa-green) hover:underline inline-flex items-center gap-1">
                <ArrowLeft size={13} /> Back to Campaign
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (campaign.status !== 'registration_open') return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-10">
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <Alert variant="info" title="Registration Not Open" message="This campaign is not currently accepting registrations." />
        <Link href={`/campaigns/${slug}`} className="mt-6 inline-flex items-center gap-2 text-sm text-(--bpa-green) hover:underline">
          <ArrowLeft size={14} /> Back to Campaign
        </Link>
      </div>
    </div>
  );

  const { campaignFee, serviceTotal, savings, discountPercent, hasDiscount, isFree } = pricing;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4">

        {/* Page header */}
        <div className="mb-5">
          <Link href={`/campaigns/${slug}`}
            className="inline-flex items-center gap-1 text-sm text-(--bpa-green) hover:underline mb-3">
            <ArrowLeft size={14} /> Back to Campaign
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-(--bpa-navy) leading-tight">{campaign.title}</h1>
          <p className="text-xs text-gray-500 mt-1">Guest Registration — no account required</p>
        </div>

        {/* Campaign summary card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-5">
          {/* Header row with BPA logo + campaign name */}
          <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-gray-100">
            {/* Logo — use admin-configured logo if available, else BPA text badge */}
            <div className="shrink-0 flex items-center gap-2">
              {siteSettings?.primaryLogoUrl ? (
                <img
                  src={siteSettings.primaryLogoUrl}
                  alt={siteSettings.siteName ?? 'BPA'}
                  className="h-9 w-auto object-contain"
                />
              ) : (
                <>
                  <div className="w-9 h-9 rounded-full bg-(--bpa-green) flex items-center justify-center">
                    <span className="text-white text-xs font-extrabold leading-none tracking-tight">BPA</span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-[9px] font-bold text-(--bpa-navy) uppercase tracking-widest leading-none">Bangladesh</p>
                    <p className="text-[9px] font-bold text-(--bpa-navy) uppercase tracking-widest leading-none">Pet Association</p>
                  </div>
                </>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-(--bpa-navy) text-sm leading-snug truncate">{campaign.title}</h2>
              {singleLockedType && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 mt-0.5">
                  <span>This campaign is for {singleLockedType.label}s only</span>
                </span>
              )}
            </div>
          </div>

          {/* Services list */}
          {campaign.services.length > 0 && (
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Included Services</p>
              <ul className="space-y-1.5">
                {campaign.services.map(s => (
                  <li key={s.id} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-(--bpa-navy) flex items-center gap-1.5">
                      <CheckCircle size={10} className="text-(--bpa-green) shrink-0" />{s.name}
                    </span>
                    {s.priceBdt != null && s.priceBdt > 0 && (
                      <span className="text-[11px] font-semibold text-gray-400">৳{s.priceBdt.toLocaleString()}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pricing row */}
          <div className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">Registration fee / pet</p>
              <div className="flex items-baseline gap-2 flex-wrap">
                {isFree ? (
                  <span className="text-base font-extrabold text-(--bpa-green)">Free</span>
                ) : (
                  <>
                    <span className="text-lg font-extrabold text-(--bpa-navy)">{formatMoney(campaignFee)}</span>
                    {hasDiscount && (
                      <>
                        <span className="text-xs text-gray-300 line-through">{formatMoney(serviceTotal)}</span>
                        <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">{discountPercent}% OFF</span>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
            {hasDiscount && !isFree && (
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">You save</p>
                <p className="text-sm font-bold text-emerald-600">{formatMoney(savings)} / pet</p>
              </div>
            )}
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7">
          <StepProgress step={step} />

          {/* Selection breadcrumb — steps 2 onwards */}
          {step >= 2 && (
            <SelectionCrumb
              venue={selectedVenue}
              date={step >= 3 ? selectedDate : ''}
              session={step >= 4 ? selectedSession : null}
              onClear={clearSelection}
            />
          )}

          {error && (
            <div className="mb-5">
              <Alert variant="error" message={error} />
              {siteSettings?.supportPhone && (
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                  <span>📞</span>
                  <span>Need help? </span>
                  <a href={`tel:${siteSettings.supportPhone.replace(/\s/g, '')}`} className="font-bold text-(--bpa-navy) hover:underline">
                    Call BPA Support: {siteSettings.supportPhone}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════
              STEP 1 · Location
          ════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div>
              <h2 className="text-base font-bold text-(--bpa-navy) mb-0.5">Select a Location</h2>

              {venueGroups.length === 0 && bookingLocationId && bookingLocationId !== 'skip' ? (
                <div className="text-center py-10 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <Building2 size={28} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm font-semibold text-(--bpa-navy) mb-1">
                    No venue is currently available near your selected location
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Try a different location, or let us notify you when one opens up nearby.
                  </p>
                  <div className="flex flex-col items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setBookingLocationId('')}
                      className="text-xs font-semibold text-(--bpa-green) hover:underline"
                    >
                      Change location
                    </button>
                    <NotifyMeForm areaLabel={campaign?.title ?? 'this campaign'} />
                  </div>
                </div>
              ) : venueGroups.length === 0 ? (
                <div className="text-center py-10 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <Building2 size={28} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm font-semibold text-(--bpa-navy) mb-1">No venue created for this area yet</p>
                  <p className="text-xs text-gray-500 mb-4">
                    This campaign doesn&apos;t have a scheduled venue right now. Check back soon, or let us notify you.
                  </p>
                  <div className="flex justify-center">
                    <NotifyMeForm areaLabel={campaign?.title ?? 'this campaign'} />
                  </div>
                </div>
              ) : !bookingLocationId ? (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-4">
                    Tell us your location so we can show the closest venues for this campaign first.
                  </p>
                  <BookingLocationPicker onSelect={(id) => setBookingLocationId(id)} />
                  <button
                    type="button"
                    onClick={() => setBookingLocationId('skip')}
                    className="mt-3 text-xs text-gray-400 hover:text-(--bpa-green) hover:underline"
                  >
                    Skip — show me all venues for this campaign
                  </button>
                </div>
              ) : locationLoading ? (
                <div className="text-center py-10 text-sm text-gray-400">Finding venues near you…</div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-gray-500">
                      {venueGroups.length} venue{venueGroups.length !== 1 ? 's' : ''} available
                    </p>
                    <button
                      type="button"
                      onClick={() => setBookingLocationId('')}
                      className="text-xs font-semibold text-(--bpa-green) hover:underline shrink-0"
                    >
                      Change location
                    </button>
                  </div>

                  {venueMatchMessage && !isExactMatch && (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                      {venueMatchMessage}
                    </p>
                  )}

                  {venueGroups.length > 4 && (
                    <div className="relative mb-4">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        value={locationSearch}
                        onChange={e => setLocationSearch(e.target.value)}
                        placeholder="Search by venue, zone or area…"
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-(--bpa-green)"
                      />
                    </div>
                  )}

                  {filteredVenues.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">No venues match your search.</p>
                  ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredVenues.map(({ venue, available, totalCapacity, dateCount }) => {
                    const full = available <= 0;
                    const selected = selectedVenueId === venue.id;
                    return (
                      <button
                        key={venue.id}
                        type="button"
                        disabled={full}
                        onClick={() => {
                          setSelectedVenueId(venue.id);
                          setSelectedDate('');
                          setSelectedSessionId('');
                          setError('');
                          // Auto-advance after brief visual confirmation
                          setTimeout(() => setStep(2), 160);
                        }}
                        className={`text-left rounded-xl border-2 p-4 transition-all focus:outline-none ${
                          selected
                            ? 'border-(--bpa-green) bg-(--bpa-green-light) shadow-sm'
                            : full
                            ? 'border-gray-200 bg-gray-50 opacity-40 cursor-not-allowed'
                            : 'border-gray-200 hover:border-(--bpa-green)/60 hover:shadow-sm active:scale-[0.99]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <Building2 size={12} className={selected ? 'text-(--bpa-green) shrink-0' : 'text-gray-400 shrink-0'} />
                              <p className="font-bold text-(--bpa-navy) text-sm truncate">{venue.name}</p>
                            </div>
                            {venue.locationPath && venue.locationPath.length > 0 ? (
                              <p className="text-[11px] text-gray-400 ml-[18px]">
                                {venue.locationPath.map(l => l.nameEn).join(' › ')}
                              </p>
                            ) : venue.zone && (
                              <p className="text-[11px] text-gray-400 ml-[18px]">
                                {venue.zone.name}{venue.zone.cityCorporation ? `, ${venue.zone.cityCorporation.name}` : ''}
                              </p>
                            )}
                            {venue.address && (
                              <p className="text-[11px] text-gray-400 ml-[18px] mt-0.5 truncate">{venue.address}</p>
                            )}
                          </div>
                          <div className="shrink-0 text-right">
                            <CapacityPill available={available} total={totalCapacity} />
                            {!full && <p className="text-[10px] text-gray-400 mt-0.5">{dateCount} date{dateCount !== 1 ? 's' : ''}</p>}
                          </div>
                        </div>
                        <MiniBar available={available} total={totalCapacity} />
                      </button>
                    );
                  })}
                </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════
              STEP 2 · Date
          ════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div>
              <h2 className="text-base font-bold text-(--bpa-navy) mb-0.5">Select a Date</h2>
              <p className="text-xs text-gray-500 mb-4">
                {dateOptions.filter(d => d.available > 0).length} date{dateOptions.filter(d => d.available > 0).length !== 1 ? 's' : ''} available at {selectedVenue?.name}
              </p>

              {/* Horizontal scrollable date chips */}
              {dateOptions.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No available dates for this location.</p>
              ) : (
                <div className="flex gap-2.5 overflow-x-auto pb-3 -mx-1 px-1 snap-x snap-mandatory">
                  {dateOptions.map(opt => {
                    // opt.date is guaranteed YYYY-MM-DD from sessionDateKey()
                    const d = parseValidDate(opt.date);
                    // Skip chips where the date is somehow still invalid (defensive)
                    if (!d) return null;

                    const full = opt.available <= 0;
                    const sel = selectedDate === opt.date;
                    const bookedPct = opt.totalCapacity > 0
                      ? Math.min(100, Math.round(((opt.totalCapacity - opt.available) / opt.totalCapacity) * 100))
                      : 0;
                    const barColor = bookedPct >= 100 ? 'bg-red-400' : bookedPct >= 80 ? 'bg-amber-400' : 'bg-white/60';
                    const barColorInactive = bookedPct >= 100 ? 'bg-red-400' : bookedPct >= 80 ? 'bg-amber-400' : 'bg-(--bpa-green)';

                    return (
                      <button
                        key={opt.date}
                        type="button"
                        disabled={full}
                        onClick={() => {
                          setSelectedDate(opt.date);
                          setSelectedSessionId('');
                          setError('');
                          setTimeout(() => setStep(3), 160);
                        }}
                        className={`shrink-0 snap-start flex flex-col items-center w-[72px] rounded-2xl border-2 pt-3 pb-2.5 px-1.5 transition-all focus:outline-none ${
                          sel
                            ? 'border-(--bpa-green) bg-(--bpa-green) shadow-md'
                            : full
                            ? 'border-gray-200 bg-gray-50 opacity-40 cursor-not-allowed'
                            : 'border-gray-200 hover:border-(--bpa-green)/60 hover:shadow-sm active:scale-[0.98]'
                        }`}
                      >
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${sel ? 'text-white/70' : 'text-gray-400'}`}>
                          {d.toLocaleDateString('en-GB', { weekday: 'short' })}
                        </span>
                        <span className={`text-[26px] font-extrabold leading-tight ${sel ? 'text-white' : 'text-(--bpa-navy)'}`}>
                          {d.getDate()}
                        </span>
                        <span className={`text-[10px] font-semibold ${sel ? 'text-white/80' : 'text-gray-500'}`}>
                          {d.toLocaleDateString('en-GB', { month: 'short' })}
                        </span>
                        {/* mini capacity bar */}
                        <div className={`mt-1.5 w-full h-0.5 rounded-full ${sel ? 'bg-white/20' : 'bg-gray-100'}`}>
                          <div className={`h-full rounded-full ${sel ? barColor : barColorInactive}`} style={{ width: `${bookedPct}%` }} />
                        </div>
                        <span className={`text-[10px] font-bold mt-1.5 ${
                          sel ? 'text-white' : full ? 'text-red-500' : opt.available <= 10 ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {full ? 'Full' : opt.available}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Selected date confirmation */}
              {selectedDate && (
                <div className="mt-4 flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <CalendarDays size={15} className="text-(--bpa-green) shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-(--bpa-navy)">
                      {fmtDate(selectedDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {dateOptions.find(d => d.date === selectedDate)?.slotCount ?? 0} time slot{(dateOptions.find(d => d.date === selectedDate)?.slotCount ?? 0) !== 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════
              STEP 3 · Time Slot
          ════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div>
              <h2 className="text-base font-bold text-(--bpa-navy) mb-0.5">Select a Time Slot</h2>
              <p className="text-xs text-gray-500 mb-4">
                {slotOptions.filter(s => s.capacity > s.bookedCount).length} slot{slotOptions.filter(s => s.capacity > s.bookedCount).length !== 1 ? 's' : ''} on {fmtDate(selectedDate, { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>

              {slotOptions.length === 0 ? (
                <Alert variant="info" message="No active sessions on this date. Go back and select a different date." />
              ) : (
                <div className="space-y-5">
                  {(['morning', 'afternoon', 'evening'] as SlotPeriod[])
                    .filter(p => slotsByPeriod[p]?.length)
                    .map(period => (
                      <div key={period}>
                        <div className="flex items-center gap-2 mb-2.5">
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{PERIOD_CONFIG[period].label}</span>
                          <span className="text-[11px] text-gray-300">{PERIOD_CONFIG[period].sub}</span>
                        </div>
                        <div className="space-y-2">
                          {(slotsByPeriod[period] ?? []).map(s => {
                            const available = s.capacity - s.bookedCount;
                            const full = available <= 0;
                            const sel = selectedSessionId === s.id;
                            const pct = Math.round((s.bookedCount / s.capacity) * 100);
                            const barColor = pct >= 100 ? 'bg-red-400' : pct >= 80 ? 'bg-amber-400' : 'bg-(--bpa-green)';
                            return (
                              <button
                                key={s.id}
                                type="button"
                                disabled={full}
                                onClick={() => {
                                  setSelectedSessionId(s.id);
                                  setError('');
                                  setTimeout(() => setStep(4), 160);
                                }}
                                className={`w-full text-left rounded-xl border-2 px-4 py-3.5 transition-all focus:outline-none ${
                                  sel
                                    ? 'border-(--bpa-green) bg-(--bpa-green-light) shadow-sm'
                                    : full
                                    ? 'border-gray-200 bg-gray-50 opacity-40 cursor-not-allowed'
                                    : 'border-gray-200 hover:border-(--bpa-green)/60 hover:shadow-sm active:scale-[0.99]'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${sel ? 'bg-(--bpa-green) text-white' : 'bg-gray-100 text-gray-500'}`}>
                                      <Clock size={15} />
                                    </div>
                                    <div>
                                      <p className="font-bold text-(--bpa-navy) text-sm">{fmt12(s.startTime)} – {fmt12(s.endTime)}</p>
                                      {s.notes && <p className="text-[11px] text-gray-400 mt-0.5">{s.notes}</p>}
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <CapacityPill available={available} total={s.capacity} />
                                    <p className="text-[10px] text-gray-400">{s.capacity} total</p>
                                  </div>
                                </div>
                                <div className="mt-2.5 h-1 bg-gray-100 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${Math.min(100, pct)}%` }} />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════
              STEP 4 · Owner Info
          ════════════════════════════════════════════════════ */}
          {step === 4 && (
            <div>
              <h2 className="text-base font-bold text-(--bpa-navy) mb-0.5 flex items-center gap-2">
                <User size={16} className="text-(--bpa-green)" /> Your Information
              </h2>
              <p className="text-xs text-gray-500 mb-5">No account required. We&apos;ll use this to send your confirmation.</p>
              <div className="space-y-4">
                {[
                  { label: 'Full Name', key: 'name', type: 'text', required: true, placeholder: 'e.g. Rahim Uddin', hint: '' },
                  { label: 'Mobile Number', key: 'mobile', type: 'tel', required: true, placeholder: 'e.g. 01712345678', hint: 'Bangladesh mobile format: 01XXXXXXXXX' },
                  { label: 'Email (optional)', key: 'email', type: 'email', required: false, placeholder: 'e.g. rahim@email.com', hint: '' },
                  { label: 'Address (optional)', key: 'address', type: 'text', required: false, placeholder: 'e.g. Mirpur, Dhaka', hint: '' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {f.label}{f.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <input
                      type={f.type}
                      value={owner[f.key as keyof OwnerInfo]}
                      onChange={e => setOwner(o => ({ ...o, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      inputMode={f.type === 'tel' ? 'tel' : undefined}
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green)"
                    />
                    {f.hint && (
                      <p className="mt-1 text-xs text-gray-400">{f.hint}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════
              STEP 5 · Pets
          ════════════════════════════════════════════════════ */}
          {step === 5 && (
            <div>
              <h2 className="text-base font-bold text-(--bpa-navy) mb-0.5 flex items-center gap-2">
                <Syringe size={16} className="text-(--bpa-green)" /> Your Pet(s)
              </h2>
              <p className="text-xs text-gray-500 mb-1">Up to {maxPets} pet{maxPets !== 1 ? 's' : ''} per booking.</p>
              {singleLockedType ? (
                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2 mb-3">
                  <span className="text-base">🔒</span>
                  <span>This campaign is only for <strong>{singleLockedType.label}s</strong>. Pet type has been pre-selected.</span>
                </div>
              ) : campaign.allowedPetTypes?.length > 0 && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2 mb-3">
                  This campaign accepts: <strong>{allowedPetTypes.map(t => t.label).join(', ')}</strong> only.
                </p>
              )}
              <div className="space-y-3 mt-4">
                {pets.map((p, i) => (
                  <PetForm key={p._id} pet={p} index={i}
                    onChange={updatePet} onRemove={removePet}
                    canRemove={pets.length > 1} petTypes={allowedPetTypes}
                    lockedType={singleLockedType} />
                ))}
              </div>
              {pets.length < maxPets && (
                <button type="button" onClick={addPet}
                  className="mt-4 flex items-center gap-2 text-sm font-semibold text-(--bpa-green) hover:text-(--bpa-navy) transition-colors">
                  <Plus size={15} /> Add Another Pet
                </button>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════
              STEP 6 · Review & Submit
          ════════════════════════════════════════════════════ */}
          {step === 6 && selectedSession && (
            <div>
              <h2 className="text-base font-bold text-(--bpa-navy) mb-4">Review & Confirm</h2>

              {/* Booking summary card */}
              <div className="rounded-xl border border-gray-200 overflow-hidden mb-4">
                <div className="bg-(--bpa-navy) px-4 py-2.5">
                  <p className="text-[11px] font-bold text-white/60 uppercase tracking-wide">Booking Summary</p>
                </div>
                <div className="divide-y divide-gray-100">
                  <div className="px-4 py-3.5 flex items-start gap-3">
                    <MapPin size={14} className="text-(--bpa-green) mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Location</p>
                      <p className="text-sm font-semibold text-(--bpa-navy)">{selectedSession.venue?.name}</p>
                      {selectedSession.venue?.zone && (
                        <p className="text-xs text-gray-500">
                          {selectedSession.venue.zone.name}{selectedSession.venue.zone.cityCorporation ? `, ${selectedSession.venue.zone.cityCorporation.name}` : ''}
                        </p>
                      )}
                      {selectedSession.venue?.address && (
                        <p className="text-xs text-gray-400 mt-0.5">{selectedSession.venue.address}</p>
                      )}
                      {selectedSession.venue?.googleMapsUrl && (
                        <a href={selectedSession.venue.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-(--bpa-green) hover:underline mt-1">
                          <MapPin size={9} /> View on Maps
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="px-4 py-3.5 flex items-start gap-3">
                    <CalendarDays size={14} className="text-(--bpa-green) mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Date & Time</p>
                      <p className="text-sm font-semibold text-(--bpa-navy)">
                        {fmtDate(selectedSession.sessionDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-gray-500">{fmt12(selectedSession.startTime)} – {fmt12(selectedSession.endTime)}</p>
                    </div>
                  </div>
                  <div className="px-4 py-3.5 flex items-start gap-3">
                    <User size={14} className="text-(--bpa-green) mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Owner</p>
                      <p className="text-sm font-semibold text-(--bpa-navy)">{owner.name}</p>
                      <p className="text-xs text-gray-500">{owner.mobile}</p>
                      {owner.email && <p className="text-xs text-gray-400">{owner.email}</p>}
                    </div>
                  </div>
                  <div className="px-4 py-3.5 flex items-start gap-3">
                    <Syringe size={14} className="text-(--bpa-green) mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Pets ({pets.length})</p>
                      <ul className="space-y-1">
                        {pets.map(p => (
                          <li key={p._id} className="text-sm">
                            <span className="font-semibold text-(--bpa-navy)">{p.name}</span>
                            <span className="text-xs text-gray-400 ml-1.5">— {p.petType}, {p.gender}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services */}
              {campaign.services.length > 0 && (
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 mb-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2.5">Services Included</p>
                  <ul className="space-y-2">
                    {campaign.services.map(s => (
                      <li key={s.id} className="flex items-center justify-between">
                        <span className="text-sm text-(--bpa-navy) flex items-center gap-1.5">
                          <CheckCircle size={11} className="text-(--bpa-green) shrink-0" />{s.name}
                        </span>
                        {s.priceBdt != null && s.priceBdt > 0 && (
                          <span className="text-xs text-gray-400">৳{s.priceBdt.toLocaleString()}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                  {serviceTotal > 0 && (
                    <div className="mt-2.5 pt-2.5 border-t border-gray-200 flex justify-between text-xs">
                      <span className="text-gray-500">Included value per pet</span>
                      <span className="font-semibold text-gray-700">৳{serviceTotal.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Pricing */}
              <div className="rounded-xl overflow-hidden border border-gray-200">
                {serviceTotal > 0 && (
                  <div className="px-4 py-3 flex items-center justify-between text-sm bg-gray-50 border-b border-gray-100">
                    <span className="text-gray-500">Services value ({pets.length} pet{pets.length !== 1 ? 's' : ''})</span>
                    <span className="text-gray-600">৳{(serviceTotal * pets.length).toLocaleString()}</span>
                  </div>
                )}
                {savings > 0 && (
                  <div className="px-4 py-3 flex items-center justify-between text-sm bg-amber-50 border-b border-amber-100">
                    <span className="font-semibold text-amber-700">Campaign Discount ({discountPercent}% OFF)</span>
                    <span className="font-bold text-amber-700">−৳{(savings * pets.length).toLocaleString()}</span>
                  </div>
                )}
                <div className="bg-emerald-50 px-4 py-4 flex items-center justify-between">
                  <span className="font-bold text-(--bpa-navy)">Total Payable</span>
                  <span className="font-extrabold text-(--bpa-green) text-xl">
                    {isFree ? 'Free' : `৳${(campaignFee * pets.length).toLocaleString()}`}
                  </span>
                </div>
              </div>
              {!isFree && (
                <p className="text-xs text-gray-400 text-center mt-3">
                  You&apos;ll be redirected to a secure payment page after confirming.
                </p>
              )}
            </div>
          )}

          {/* ── Navigation ── */}
          <div className="flex items-center justify-between mt-7 pt-5 border-t border-gray-100">
            {step > 1 ? (
              <Button variant="outline" size="md" onClick={prev} disabled={submitting}>
                <ArrowLeft size={15} /> Back
              </Button>
            ) : <div />}

            {step < TOTAL_STEPS ? (
              <Button
                variant="primary"
                size="md"
                onClick={next}
                disabled={
                  (step === 1 && !selectedVenueId) ||
                  (step === 2 && !selectedDate) ||
                  (step === 3 && !selectedSessionId)
                }
              >
                Continue <ArrowRight size={15} />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={handleSubmit}
                loading={submitting}
                disabled={Boolean(submitting || (!isFree && (!Number.isFinite(campaignFee) || campaignFee <= 0)))}
              >
                {isFree ? 'Confirm Booking' : 'Proceed to Payment'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
