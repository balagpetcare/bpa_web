import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { buildBookingHref, isPubliclyVisibleClinic } from '@/lib/spay-neuter/offer-detail';
import type { SpayOfferClinicBranch } from '@/lib/api/spay-neuter';

interface ParticipatingClinicsProps {
  offerId: string;
  clinics: SpayOfferClinicBranch[];
  bookable: boolean;
}

/** Never renders an address line if the clinic has neither an address nor an area/district on file — no empty/placeholder text. */
function clinicLocationLine(branch: SpayOfferClinicBranch['clinicBranch']): string | null {
  if (branch.address) return branch.address;
  const parts = [branch.area, branch.district].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
}

export default function ParticipatingClinics({ offerId, clinics, bookable }: ParticipatingClinicsProps) {
  const visibleClinics = clinics.filter((c) => isPubliclyVisibleClinic(c.clinicBranch));

  if (visibleClinics.length === 0) {
    return <p className="text-sm text-gray-500">Participating clinics for this campaign will be announced soon.</p>;
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {visibleClinics.map(({ clinicBranch }) => {
        const locationLine = clinicLocationLine(clinicBranch);
        return (
          <div key={clinicBranch.id} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col">
            <p className="font-semibold text-(--bpa-navy) text-sm">{clinicBranch.branchName}</p>
            {locationLine && (
              <p className="flex items-start gap-1.5 text-xs text-gray-500 mt-1.5">
                <MapPin size={12} className="text-(--bpa-green) mt-0.5 shrink-0" />
                <span>{locationLine}</span>
              </p>
            )}
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4">
              {clinicBranch.slug && (
                <Link href={`/clinics/${clinicBranch.slug}`} className="text-xs font-semibold text-(--bpa-green) hover:underline">
                  View clinic
                </Link>
              )}
              {bookable && (
                <Link href={buildBookingHref(offerId, { clinicBranchId: clinicBranch.id })} className="text-xs font-semibold text-(--bpa-navy) hover:underline">
                  Select this clinic →
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
