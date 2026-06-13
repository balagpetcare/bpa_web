'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Plus, Trash2, Syringe, User, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { getCampaignBySlug, createGuestPets, registerForCampaign } from '@/lib/api/campaigns';
import type { CampaignDetail, CampaignSession, GuestPet, PetType, PetGender } from '@/types/bpa.types';

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

interface OwnerInfo { name: string; mobile: string; email: string; address: string }
interface PetInfo extends GuestPet { _id: string }

function emptyPet(): PetInfo {
  return { _id: Math.random().toString(36).slice(2), name: '', petType: 'dog', gender: 'male' };
}

function StepIndicator({ step, total }: { step: number; total: number }) {
  const labels = ['Session', 'Owner Info', 'Pets', 'Review'];
  return (
    <div className="flex items-center gap-2 mb-8">
      {labels.slice(0, total).map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const active = n === step;
        return (
          <div key={n} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${done ? 'bg-(--bpa-green) text-white' : active ? 'bg-(--bpa-green) text-white ring-4 ring-(--bpa-green)' : 'bg-gray-200 text-gray-500'}`}>
              {done ? <CheckCircle size={14} /> : n}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${active ? 'text-(--bpa-green)' : done ? 'text-gray-600' : 'text-gray-400'}`}>{label}</span>
            {i < total - 1 && <div className={`flex-1 h-0.5 ${done ? 'bg-(--bpa-green)' : 'bg-gray-200'}`} />}
          </div>
        );
      })}
    </div>
  );
}

function PetForm({ pet, index, onChange, onRemove, canRemove }: {
  pet: PetInfo; index: number;
  onChange: (id: string, field: keyof PetInfo, value: string | number) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}) {
  const f = (field: keyof PetInfo) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    onChange(pet._id, field, val);
  };
  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-(--bpa-navy) text-sm">Pet {index + 1}</h4>
        {canRemove && (
          <button type="button" onClick={() => onRemove(pet._id)} className="text-red-500 hover:text-red-700 p-1">
            <Trash2 size={15} />
          </button>
        )}
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pet Name <span className="text-red-500">*</span></label>
          <input value={pet.name} onChange={f('name')} placeholder="e.g. Buddy" required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-navy)" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type <span className="text-red-500">*</span></label>
          <select value={pet.petType} onChange={f('petType')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green)">
            {PET_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender <span className="text-red-500">*</span></label>
          <select value={pet.gender} onChange={f('gender')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green)">
            {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Approx. Age (months)</label>
          <input type="number" min={0} value={pet.approxAge ?? ''} onChange={f('approxAge')} placeholder="e.g. 12"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-navy)" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
          <input value={pet.breed ?? ''} onChange={f('breed')} placeholder="e.g. Labrador"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-navy)" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
          <input type="number" step="0.1" min={0.1} value={pet.weightKg ?? ''} onChange={f('weightKg')} placeholder="e.g. 5.5"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green)" />
        </div>
      </div>
    </div>
  );
}

export default function RegistrationFormWrapper() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug;
  const preselectedSession = searchParams.get('session') ?? '';

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Step 1: session
  const [selectedSessionId, setSelectedSessionId] = useState(preselectedSession);

  // Step 2: owner info
  const [owner, setOwner] = useState<OwnerInfo>({ name: '', mobile: '', email: '', address: '' });

  // Step 3: pets
  const [pets, setPets] = useState<PetInfo[]>([emptyPet()]);

  useEffect(() => {
    getCampaignBySlug(slug)
      .then(c => { setCampaign(c); setLoading(false); })
      .catch(() => { setError('Failed to load campaign.'); setLoading(false); });
  }, [slug]);

  if (loading) return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-2 border-(--bpa-navy) border-t-transparent" /></div>;
  if (!campaign) return <div className="text-center py-24 text-gray-500">Campaign not found.</div>;
  if (campaign.status !== 'registration_open') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <Alert variant="info" title="Registration Not Open" message="This campaign is not currently accepting registrations." />
        <Link href={`/campaigns/${slug}`} className="mt-6 inline-flex items-center gap-2 text-sm text-(--bpa-green) hover:underline"><ArrowLeft size={14} /> Back to Campaign</Link>
      </div>
    );
  }

  const isFree = Number(campaign.basePriceBdt) === 0;
  const activeSessions = campaign.sessions.filter(s => s.isActive);
  const selectedSession = activeSessions.find(s => s.id === selectedSessionId);
  const maxPets = Math.min(campaign.maxPetsPerBooking, selectedSession ? selectedSession.capacity - selectedSession.bookedCount : campaign.maxPetsPerBooking);

  function validateStep(s: number): string {
    if (s === 1 && !selectedSessionId) return 'Please select a session.';
    if (s === 2) {
      if (!owner.name.trim()) return 'Owner name is required.';
      if (!owner.mobile.trim() || owner.mobile.length < 7) return 'Valid mobile number is required.';
    }
    if (s === 3) {
      for (const p of pets) {
        if (!p.name.trim()) return 'All pets must have a name.';
      }
      if (selectedSession && pets.length > selectedSession.capacity - selectedSession.bookedCount) {
        return `Only ${selectedSession.capacity - selectedSession.bookedCount} slots left. Reduce pet count.`;
      }
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
    setPets(p => [...p, emptyPet()]);
  }

  function removePet(id: string) {
    setPets(p => p.filter(x => x._id !== id));
  }

  function updatePet(id: string, field: keyof PetInfo, value: string | number) {
    setPets(p => p.map(x => x._id === id ? { ...x, [field]: value } : x));
  }

  async function handleSubmit() {
    const err = validateStep(3);
    if (err) { setError(err); return; }
    setError('');
    setSubmitting(true);
    if (!campaign) { setSubmitting(false); return; }
    try {
      // 1. Create guest pets
      const guestData = await createGuestPets(
        { ownerName: owner.name, mobile: owner.mobile, email: owner.email || undefined, address: owner.address || undefined },
        pets.map(({ _id: _unused, ...p }) => ({
          name: p.name,
          petType: p.petType,
          gender: p.gender,
          approxAge: p.approxAge,
          breed: p.breed || undefined,
          color: p.color,
          weightKg: p.weightKg,
        })),
      );

      // 2. Register
      const result = await registerForCampaign({
        campaignId: campaign.id,
        sessionId: selectedSessionId,
        ownerName: owner.name,
        mobile: owner.mobile,
        email: owner.email || undefined,
        address: owner.address || undefined,
        petIds: guestData.petIds,
      });

      if (!result.isFree && result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        router.push(`/campaigns/${slug}/booking/${result.registration.bookingNumber}`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Registration failed. Please try again.';
      setError(msg);
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link href={`/campaigns/${slug}`} className="inline-flex items-center gap-1 text-sm text-(--bpa-green) hover:underline mb-4">
            <ArrowLeft size={14} /> Back to Campaign
          </Link>
          <h1 className="text-2xl font-bold text-(--bpa-green)">{campaign.title}</h1>
          <p className="text-sm text-gray-500 mt-1">Guest Registration — no account required</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <StepIndicator step={step} total={4} />

          {error && <Alert variant="error" message={error} className="mb-6" />}

          {/* Step 1: Session */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-bold text-(--bpa-green) mb-5">Select a Session</h2>
              {activeSessions.length === 0 ? (
                <Alert variant="info" message="No active sessions available for this campaign." />
              ) : (
                <div className="space-y-3">
                  {activeSessions.map(s => {
                    const available = s.capacity - s.bookedCount;
                    const isFull = available <= 0;
                    return (
                      <label key={s.id} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${selectedSessionId === s.id ? 'border-(--bpa-navy) bg-(--bpa-green)' : isFull ? 'border-gray-200 bg-gray-50 opacity-60' : 'border-gray-200 hover:border-(--bpa-green)'}`}>
                        <input type="radio" name="session" value={s.id} checked={selectedSessionId === s.id} disabled={isFull}
                          onChange={() => setSelectedSessionId(s.id)} className="mt-0.5 accent-(--bpa-navy)" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-(--bpa-navy) text-sm">{s.venue?.name ?? 'TBC'}</p>
                          {s.venue?.zone && <p className="text-xs text-gray-400">{s.venue.zone.name}, {s.venue.zone.cityCorporation?.name}</p>}
                          <p className="text-xs text-gray-500 mt-1">{new Date(s.sessionDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} · {s.startTime} – {s.endTime}</p>
                          <p className={`text-xs mt-1 font-medium ${isFull ? 'text-red-500' : available <= 10 ? 'text-amber-600' : 'text-green-600'}`}>
                            {isFull ? 'Full — Join Waitlist' : `${available} slot${available !== 1 ? 's' : ''} available`}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Owner */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-bold text-(--bpa-green) mb-5 flex items-center gap-2"><User size={18} className="text-(--bpa-green)" />Your Information</h2>
              <div className="space-y-4">
                {[
                  { label: 'Full Name', key: 'name', type: 'text', required: true, placeholder: 'e.g. Rahim Uddin' },
                  { label: 'Mobile Number', key: 'mobile', type: 'tel', required: true, placeholder: 'e.g. 01712345678' },
                  { label: 'Email (optional)', key: 'email', type: 'email', required: false, placeholder: 'e.g. rahim@email.com' },
                  { label: 'Address (optional)', key: 'address', type: 'text', required: false, placeholder: 'e.g. Mirpur, Dhaka' },
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
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--bpa-green)"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Pets */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-bold text-(--bpa-navy) mb-2 flex items-center gap-2"><Syringe size={18} className="text-(--bpa-green)" />Your Pet(s)</h2>
              <p className="text-sm text-gray-500 mb-5">Add up to {maxPets} pet{maxPets !== 1 ? 's' : ''} for this booking.</p>
              <div className="space-y-4">
                {pets.map((p, i) => (
                  <PetForm key={p._id} pet={p} index={i} onChange={updatePet} onRemove={removePet} canRemove={pets.length > 1} />
                ))}
              </div>
              {pets.length < maxPets && (
                <button type="button" onClick={addPet} className="mt-4 flex items-center gap-2 text-sm font-semibold text-(--bpa-navy) hover:text-(--bpa-green)">
                  <Plus size={16} /> Add Another Pet
                </button>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && selectedSession && (
            <div>
              <h2 className="text-lg font-bold text-(--bpa-green) mb-5">Review & Confirm</h2>
              <div className="space-y-4 text-sm">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-semibold text-gray-500 text-xs uppercase tracking-wide mb-2">Session</p>
                  <p className="font-medium text-(--bpa-green)">{selectedSession.venue?.name}</p>
                  <p className="text-gray-500">{new Date(selectedSession.sessionDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="text-gray-500">{selectedSession.startTime} – {selectedSession.endTime}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-semibold text-gray-500 text-xs uppercase tracking-wide mb-2">Owner</p>
                  <p className="font-medium text-(--bpa-green)">{owner.name}</p>
                  <p className="text-gray-500">{owner.mobile}</p>
                  {owner.email && <p className="text-gray-500">{owner.email}</p>}
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-semibold text-gray-500 text-xs uppercase tracking-wide mb-2">Pets ({pets.length})</p>
                  <ul className="space-y-1">
                    {pets.map(p => <li key={p._id} className="text-(--bpa-navy) font-medium">{p.name} <span className="text-gray-400 font-normal">— {p.petType}, {p.gender}</span></li>)}
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-semibold text-gray-500 text-xs uppercase tracking-wide mb-2">Services</p>
                  <ul className="space-y-1">
                    {campaign.services.map(s => <li key={s.id} className="text-(--bpa-green)">{s.name}</li>)}
                  </ul>
                </div>
                <div className="bg-(--bpa-navy)/10 rounded-xl p-4 flex items-center justify-between">
                  <span className="font-bold text-(--bpa-green)">Total Amount</span>
                  <span className="font-bold text-(--bpa-green) text-lg">
                    {isFree ? 'Free' : `৳${(Number(campaign.basePriceBdt) * pets.length).toLocaleString()}`}
                  </span>
                </div>
                {!isFree && <p className="text-xs text-gray-400 text-center">You will be redirected to the secure payment page.</p>}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            {step > 1 ? (
              <Button variant="outline" size="md" onClick={prev} disabled={submitting}>
                <ArrowLeft size={16} /> Back
              </Button>
            ) : <div />}
            {step < 4 ? (
              <Button variant="primary" size="md" onClick={next}>
                Next <ArrowRight size={16} />
              </Button>
            ) : (
              <Button variant="primary" size="md" onClick={handleSubmit} loading={submitting}>
                {isFree ? 'Confirm Registration' : 'Proceed to Payment'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
