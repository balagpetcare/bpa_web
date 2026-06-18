import Link from 'next/link';
import { PawPrint, Plus, ChevronRight } from 'lucide-react';
import SectionCard from './SectionCard';
import EmptyState from './EmptyState';
import type { DashboardPet } from '../types';

interface Props {
  pets: DashboardPet[];
}

const PET_EMOJI: Record<string, string> = {
  dog: '🐕',
  cat: '🐈',
  bird: '🐦',
  rabbit: '🐇',
  other: '🐾',
};

function PetCard({ pet }: { pet: DashboardPet }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-(--bpa-green-light) flex items-center justify-center text-xl shrink-0">
        {PET_EMOJI[pet.petType] ?? '🐾'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-(--bpa-navy) text-sm truncate">{pet.name}</p>
        <p className="text-xs text-gray-400 capitalize">
          {pet.petType}{pet.breed ? ` · ${pet.breed}` : ''} · {pet.gender}
          {pet.approxAge ? ` · ~${pet.approxAge}y` : ''}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
    </div>
  );
}

export default function PetsSection({ pets }: Props) {
  return (
    <SectionCard
      title="My Pets"
      subtitle={pets.length > 0 ? `${pets.length} pet${pets.length !== 1 ? 's' : ''} registered` : undefined}
      icon={<PawPrint className="w-4 h-4" />}
      action={
        <Link
          href="/profile/pets/add"
          className="inline-flex items-center gap-1 text-xs font-semibold text-(--bpa-green) hover:underline"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Pet
        </Link>
      }
    >
      {pets.length === 0 ? (
        <EmptyState
          icon={<PawPrint className="w-6 h-6" />}
          title="No pets registered yet"
          description="Add your pet profiles to register for vaccination campaigns and track their health records."
          action={
            <Link
              href="/profile/pets/add"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-(--bpa-green) text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" /> Add Your First Pet
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
          {pets.slice(0, 3).map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
          {pets.length > 3 && (
            <Link
              href="/profile/pets"
              className="flex items-center justify-center gap-1 w-full py-2.5 text-xs font-semibold text-(--bpa-green) border border-(--bpa-green)/20 rounded-xl hover:bg-(--bpa-green-light) transition-colors"
            >
              View all {pets.length} pets <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
          {pets.length <= 3 && (
            <Link
              href="/profile/pets"
              className="flex items-center justify-center gap-1 w-full py-2.5 text-xs font-semibold text-gray-400 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors mt-1"
            >
              Manage all pets <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}
    </SectionCard>
  );
}
