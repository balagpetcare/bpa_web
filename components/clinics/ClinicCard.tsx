import Link from 'next/link';
import { MapPin, ShieldCheck, HelpCircle, Phone, MessageCircle, Navigation2, Clock } from 'lucide-react';
import type { PublicClinic } from '@/types/bpa.types';
import ClinicShareButton from './ClinicShareButton';

const OPEN_STATUS_CONFIG: Record<PublicClinic['openingHoursStatus']['status'], { label: string; className: string }> = {
  OPEN: { label: 'Open now', className: 'bg-green-100 text-green-800' },
  CLOSED: { label: 'Closed now', className: 'bg-red-100 text-red-700' },
  UNKNOWN: { label: 'Hours unknown', className: 'bg-gray-100 text-gray-600' },
};

const FACILITY_LABELS: Record<string, string> = {
  LABORATORY: 'Laboratory',
  SURGERY: 'Surgery',
  IMAGING: 'Imaging',
  PHARMACY: 'Pharmacy',
  HOSPITALIZATION: 'Hospitalization',
  HOME_SERVICE: 'Home Service',
};

export default function ClinicCard({ clinic }: { clinic: PublicClinic }) {
  const displayName = clinic.branchName?.trim() || clinic.organizationName;
  // Only shown when it adds information — never repeats the branch name.
  const showOrgName = clinic.organizationName && clinic.organizationName !== displayName;
  // Prefers the branch's own cover photo, then the organization's cover
  // image, then its logo — never invents an image the API didn't provide.
  const cover =
    clinic.images.find((i) => i.isCover) ??
    clinic.images[0] ??
    (clinic.organizationCoverUrl ? { url: clinic.organizationCoverUrl, altText: null } : null) ??
    (clinic.organizationLogoUrl ? { url: clinic.organizationLogoUrl, altText: null } : null);
  const verified = clinic.verificationStatus === 'VERIFIED';
  const openStatus = OPEN_STATUS_CONFIG[clinic.openingHoursStatus.status];
  const locationLine = [clinic.area, clinic.district].filter(Boolean).join(' · ');
  const primaryPhone = clinic.phones.find((p) => p.isPrimary) ?? clinic.phones[0];
  const confirmedFacilities = clinic.facilities.filter((f) => f.available === 'YES').slice(0, 3);

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
      <Link href={`/clinics/${clinic.slug}`} className="block group">
        <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover.url}
              alt={cover.altText ?? displayName}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-(--bpa-navy)/10 to-(--bpa-navy)/10 flex items-center justify-center">
              <MapPin size={32} className="text-(--bpa-green)" />
            </div>
          )}
          <span
            className={`absolute top-3 left-3 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
              verified ? 'bg-(--bpa-green) text-white' : 'bg-white/90 text-gray-600'
            }`}
          >
            {verified ? <ShieldCheck size={12} /> : <HelpCircle size={12} />}
            {verified ? 'Verified' : 'Unverified'}
          </span>
        </div>
      </Link>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <Link href={`/clinics/${clinic.slug}`} className="hover:text-(--bpa-green) transition-colors">
          <h3 className="font-semibold text-(--bpa-navy) line-clamp-2">{displayName}</h3>
        </Link>
        {showOrgName && <p className="text-xs text-gray-400 -mt-1 line-clamp-1">{clinic.organizationName}</p>}

        {locationLine && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <MapPin size={14} className="shrink-0" />
            <span className="line-clamp-1">{locationLine}</span>
            {clinic.distanceKm !== null && (
              <span className="ml-auto shrink-0 font-semibold text-(--bpa-green)">
                {clinic.distanceKm.toFixed(1)} km
              </span>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${openStatus.className}`}>
            <Clock size={11} />
            {openStatus.label}
          </span>
          {clinic.open24Hours === 'YES' && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">24/7</span>
          )}
          {clinic.emergencyAvailability === 'YES' && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Emergency</span>
          )}
        </div>

        {clinic.services.length > 0 && (
          <p className="text-xs text-gray-500 line-clamp-1">{clinic.services.slice(0, 3).join(' • ')}</p>
        )}

        {confirmedFacilities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {confirmedFacilities.map((f) => (
              <span key={f.facilityType} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {FACILITY_LABELS[f.facilityType] ?? f.facilityType}
              </span>
            ))}
          </div>
        )}

        {clinic.animalTypes.length > 0 && (
          <p className="text-xs text-gray-400 line-clamp-1">For: {clinic.animalTypes.join(', ')}</p>
        )}

        {primaryPhone && <p className="text-xs text-gray-500">{primaryPhone.phoneNumber}</p>}

        <div className="mt-auto pt-2 flex flex-wrap gap-2">
          {clinic.actions.call && (
            <a
              href={clinic.actions.call}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-(--bpa-green) hover:text-(--bpa-green) transition-colors"
            >
              <Phone size={13} /> Call
            </a>
          )}
          {clinic.actions.whatsapp && (
            <a
              href={clinic.actions.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-(--bpa-green) hover:text-(--bpa-green) transition-colors"
            >
              <MessageCircle size={13} /> WhatsApp
            </a>
          )}
          {clinic.actions.directions && (
            <a
              href={clinic.actions.directions}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-(--bpa-green) hover:text-(--bpa-green) transition-colors"
            >
              <Navigation2 size={13} /> Directions
            </a>
          )}
          <ClinicShareButton url={clinic.actions.share} title={displayName} />
          <Link
            href={`/clinics/${clinic.slug}`}
            className="ml-auto inline-flex items-center text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-(--bpa-green) text-white hover:bg-(--bpa-green)/90 transition-colors"
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}
