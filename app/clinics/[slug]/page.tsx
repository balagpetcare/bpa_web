import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/ui/Breadcrumb';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import ClinicJsonLd from '@/components/clinics/ClinicJsonLd';
import ClinicMap from '@/components/clinics/ClinicMap';
import ClinicShareButton from '@/components/clinics/ClinicShareButton';
import { getClinicBySlug, getClinicsList } from '@/lib/api/clinics';
import {
  ShieldCheck, HelpCircle, MapPin, Phone, MessageCircle, Navigation2, Globe,
  Clock, AlertTriangle, Flag, Stethoscope, PawPrint, Building2,
} from 'lucide-react';

export const revalidate = 120;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const { items } = await getClinicsList({ limit: 100 });
    return items.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const clinic = await getClinicBySlug(slug, { next: { revalidate: 120 } });
  if (!clinic) return {};

  const displayName = clinic.branchName?.trim() || clinic.organizationName;
  const location = [clinic.area, clinic.cityCorporation].filter(Boolean).join(', ');
  const description = location
    ? `${displayName} — pet clinic in ${location}. Hours, contact, services, and directions.`
    : `${displayName} — pet clinic details, hours, contact, services, and directions.`;
  const cover = clinic.images.find((i) => i.isCover) ?? clinic.images[0];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bpa.org.bd';

  return {
    title: `${displayName} | Find Clinics | BPA`,
    description,
    alternates: { canonical: `${siteUrl}/clinics/${slug}` },
    openGraph: {
      title: displayName,
      description,
      url: `${siteUrl}/clinics/${slug}`,
      type: 'website',
      images: cover ? [{ url: cover.url, alt: cover.altText ?? displayName }] : [],
      siteName: 'Bangladesh Pet Association',
    },
    twitter: {
      card: 'summary_large_image',
      title: displayName,
      description,
      images: cover ? [cover.url] : [],
    },
  };
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const OPEN_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  OPEN: { label: 'Open now', className: 'bg-green-100 text-green-800' },
  CLOSED: { label: 'Closed now', className: 'bg-red-100 text-red-700' },
  UNKNOWN: { label: 'Hours unknown', className: 'bg-gray-100 text-gray-600' },
};

function triStateLabel(state: string): { label: string; className: string } {
  switch (state) {
    case 'YES':
      return { label: 'Confirmed', className: 'text-green-700' };
    case 'NO':
      return { label: 'Not available', className: 'text-red-700' };
    default:
      return { label: 'Not confirmed', className: 'text-gray-500' };
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function ClinicDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const clinic = await getClinicBySlug(slug, { next: { revalidate: 120 } });
  if (!clinic) notFound();

  const displayName = clinic.branchName?.trim() || clinic.organizationName;
  const verified = clinic.verificationStatus === 'VERIFIED';
  const address = [clinic.address, clinic.area, clinic.cityCorporation, clinic.district]
    .filter(Boolean)
    .join(', ');
  const openStatus = OPEN_STATUS_CONFIG[clinic.openingHoursStatus.status] ?? OPEN_STATUS_CONFIG.UNKNOWN;
  const byDay = new Map(clinic.weeklyHours.map((h) => [h.dayOfWeek, h]));

  // Other published branches of the same organization — never includes
  // this branch itself, and inherits the same published/archived exclusion
  // the public API already enforces for every result.
  let otherBranches: Awaited<ReturnType<typeof getClinicsList>>['items'] = [];
  try {
    const res = await getClinicsList(
      { organizationSlug: clinic.organizationSlug, limit: 10 },
      { next: { revalidate: 120 } },
    );
    otherBranches = res.items.filter((b) => b.id !== clinic.id);
  } catch {
    otherBranches = [];
  }

  const supportEmail = 'support@bpa.org.bd';
  const reportSubject = encodeURIComponent(`Incorrect clinic information: ${displayName}`);
  const reportBody = encodeURIComponent(
    `Clinic: ${displayName}\nLink: ${clinic.actions.share}\n\nWhat looks incorrect: `,
  );

  return (
    <main className="bg-gray-50 min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Find Clinics', url: '/clinics' },
          { name: displayName, url: `/clinics/${slug}` },
        ]}
      />
      <ClinicJsonLd clinic={clinic} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: 'Find Clinics', href: '/clinics' }, { label: displayName }]} />

        {/* Gallery — falls back to the organization's cover/logo from the
            Central Media Library when this branch has no gallery photos of
            its own, before finally showing the professional icon fallback. */}
        <div className="mt-4 rounded-2xl overflow-hidden bg-gray-100 aspect-[21/9] relative">
          {(() => {
            const cover =
              clinic.images.find((i) => i.isCover) ??
              clinic.images[0] ??
              (clinic.organizationCoverUrl ? { url: clinic.organizationCoverUrl, altText: null } : null) ??
              (clinic.organizationLogoUrl ? { url: clinic.organizationLogoUrl, altText: null } : null);
            return cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover.url} alt={cover.altText ?? displayName} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Stethoscope size={48} className="text-(--bpa-green)" />
              </div>
            );
          })()}
        </div>
        {clinic.images.length > 1 && (
          <div className="mt-2 grid grid-cols-4 sm:grid-cols-6 gap-2">
            {clinic.images.slice(0, 6).map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={img.url}
                alt={img.altText ?? `${displayName} photo ${i + 1}`}
                className="aspect-square object-cover rounded-lg border border-gray-100"
              />
            ))}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mt-6">
          <div>
            <h1 className="text-3xl font-bold text-(--bpa-navy)">{displayName}</h1>
            {clinic.organizationName !== displayName && (
              <p className="text-gray-500 text-sm mt-1">{clinic.organizationName}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-full ${
                verified ? 'bg-(--bpa-green)/10 text-(--bpa-green)' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {verified ? <ShieldCheck size={15} /> : <HelpCircle size={15} />}
              {verified ? 'Verified' : 'Unverified'}
            </span>
            <ClinicShareButton
              url={clinic.actions.share}
              title={displayName}
              className="inline-flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-full border border-gray-200 hover:border-(--bpa-green) hover:text-(--bpa-green) transition-colors"
            />
          </div>
        </div>

        {!verified && (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 text-sm px-4 py-3">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <p>
              This clinic&rsquo;s details have not been verified by BPA yet. Please confirm hours and services
              directly with the clinic before visiting.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Address / directions */}
            <section className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-semibold text-(--bpa-navy) mb-3 flex items-center gap-2">
                <MapPin size={18} /> Address
              </h2>
              {address && <p className="text-gray-700">{address}</p>}
              {clinic.actions.directions && (
                <a
                  href={clinic.actions.directions}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-(--bpa-green) hover:underline"
                >
                  <Navigation2 size={14} /> Get Directions
                </a>
              )}
              {clinic.location && (
                <div className="mt-4">
                  <ClinicMap clinics={[clinic]} userLocation={null} />
                </div>
              )}
            </section>

            {/* Opening hours */}
            <section className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-semibold text-(--bpa-navy) mb-3 flex items-center gap-2">
                <Clock size={18} /> Opening Hours
              </h2>
              <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${openStatus.className}`}>
                {openStatus.label}
              </span>
              {clinic.weeklyHours.length === 0 ? (
                <p className="text-gray-500 text-sm">Hours unknown</p>
              ) : (
                <table className="w-full text-sm">
                  <tbody>
                    {DAY_NAMES.map((name, day) => {
                      const hours = byDay.get(day);
                      return (
                        <tr key={day} className="border-t border-gray-50 first:border-0">
                          <td className="py-1.5 font-medium text-gray-600 w-20">{name}</td>
                          <td className="py-1.5 text-gray-700">
                            {!hours
                              ? 'Hours unknown'
                              : hours.isClosed
                                ? 'Closed'
                                : hours.opensAt && hours.closesAt
                                  ? `${hours.opensAt} – ${hours.closesAt}`
                                  : 'Hours unknown'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </section>

            {/* Emergency & 24/7 */}
            <section className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-semibold text-(--bpa-navy) mb-3">Emergency &amp; 24-Hour Service</h2>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Emergency care</span>
                  <span className={triStateLabel(clinic.emergencyAvailability).className}>
                    {triStateLabel(clinic.emergencyAvailability).label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Open 24 hours</span>
                  <span className={triStateLabel(clinic.open24Hours).className}>
                    {triStateLabel(clinic.open24Hours).label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Appointment required</span>
                  <span className={triStateLabel(clinic.appointmentRequired).className}>
                    {triStateLabel(clinic.appointmentRequired).label}
                  </span>
                </div>
              </div>
            </section>

            {/* Services / animals / facilities */}
            {(clinic.services.length > 0 || clinic.animalTypes.length > 0 || clinic.facilities.length > 0) && (
              <section className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
                {clinic.services.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-(--bpa-navy) mb-2 flex items-center gap-2">
                      <Stethoscope size={16} /> Services
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {clinic.services.map((s) => (
                        <span key={s} className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {clinic.animalTypes.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-(--bpa-navy) mb-2 flex items-center gap-2">
                      <PawPrint size={16} /> Animal Types
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {clinic.animalTypes.map((a) => (
                        <span key={a} className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {clinic.facilities.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-(--bpa-navy) mb-2 flex items-center gap-2">
                      <Building2 size={16} /> Facilities
                    </h3>
                    <div className="flex flex-col gap-1 text-sm">
                      {clinic.facilities.map((f) => (
                        <div key={f.facilityType} className="flex items-center justify-between">
                          <span className="text-gray-600">{f.facilityType.replace(/_/g, ' ')}</span>
                          <span className={triStateLabel(f.available).className}>{triStateLabel(f.available).label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {otherBranches.length > 0 && (
              <section className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="font-semibold text-(--bpa-navy) mb-3 flex items-center gap-2">
                  <Building2 size={18} /> Other Branches of {clinic.organizationName}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {otherBranches.map((b) => (
                    <Link
                      key={b.id}
                      href={`/clinics/${b.slug}`}
                      className="block rounded-lg border border-gray-100 p-3 hover:border-(--bpa-green) transition-colors"
                    >
                      <p className="font-medium text-(--bpa-navy) text-sm line-clamp-1">{b.branchName}</p>
                      {(b.area || b.district) && (
                        <p className="text-xs text-gray-500 line-clamp-1">{[b.area, b.district].filter(Boolean).join(' · ')}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar: contacts */}
          <aside className="flex flex-col gap-4">
            <section className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-semibold text-(--bpa-navy) mb-3">Contact</h2>
              {clinic.phones.length === 0 && !clinic.actions.website && clinic.socialLinks.length === 0 ? (
                <p className="text-gray-500 text-sm">No phone number on file</p>
              ) : (
                <div className="flex flex-col gap-2 text-sm">
                  {clinic.phones.map((p) => (
                    <div key={p.phoneNumber} className="flex items-center justify-between gap-2">
                      <span className="text-gray-700">{p.phoneNumber}{p.label ? ` (${p.label})` : ''}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <a href={`tel:${p.phoneNumber}`} aria-label={`Call ${p.phoneNumber}`} className="text-(--bpa-green)">
                          <Phone size={16} />
                        </a>
                        {p.whatsappAvailable === 'YES' && (
                          <a
                            href={`https://wa.me/${p.phoneNumber.replace(/^0/, '880')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`WhatsApp ${p.phoneNumber}`}
                            className="text-(--bpa-green)"
                          >
                            <MessageCircle size={16} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                  {clinic.actions.website && (
                    <a
                      href={clinic.actions.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-(--bpa-green) hover:underline"
                    >
                      <Globe size={15} /> Website
                    </a>
                  )}
                  {clinic.socialLinks.map((s) => (
                    <a
                      key={s.url}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-(--bpa-green) hover:underline"
                    >
                      {s.label ?? s.platform}
                    </a>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 p-5 text-sm text-gray-500">
              {clinic.lastVerifiedAt ? (
                <p>Last verified {formatDate(clinic.lastVerifiedAt)}</p>
              ) : (
                <p>Not yet verified by BPA</p>
              )}
            </section>

            <a
              href={`mailto:${supportEmail}?subject=${reportSubject}&body=${reportBody}`}
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg border border-gray-300 hover:border-(--bpa-green) hover:text-(--bpa-green) transition-colors"
            >
              <Flag size={15} /> Report incorrect information
            </a>

            <Link
              href="/clinics"
              className="inline-flex items-center justify-center text-sm font-semibold px-4 py-2.5 rounded-lg bg-(--bpa-green) text-white hover:bg-(--bpa-green)/90 transition-colors"
            >
              Back to Find Clinics
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
