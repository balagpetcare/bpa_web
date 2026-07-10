import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ShieldAlert, CalendarDays, Syringe, User, MapPin, Download } from 'lucide-react';
import { verifyCertificate } from '@/lib/api/campaigns';
import { getApiOrigin } from '@/lib/utils/api-url';

interface PageProps {
  params: Promise<{ token: string }>;
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function CertificateVerifyPage({ params }: PageProps) {
  const { token } = await params;
  const decodedToken = decodeURIComponent(token);

  let cert: Awaited<ReturnType<typeof verifyCertificate>>;
  let isValid = true;
  let errorMessage = '';

  try {
    cert = await verifyCertificate(decodedToken, { cache: 'no-store' });
    if (cert.supersededAt) {
      isValid = false;
      errorMessage = 'This certificate has been superseded by a newer version.';
    }
  } catch {
    notFound();
  }

  const pet = cert!.petBooking?.pet;
  const session = cert!.petBooking?.session;
  const owner = cert!.petBooking?.registration?.owner;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        {/* Verification status */}
        <div className={`rounded-2xl border p-6 text-center mb-6 ${isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isValid ? 'bg-green-100' : 'bg-red-100'}`}>
            {isValid
              ? <ShieldCheck size={32} className="text-green-600" />
              : <ShieldAlert size={32} className="text-red-600" />
            }
          </div>
          <h1 className={`text-2xl font-bold ${isValid ? 'text-green-800' : 'text-red-800'}`}>
            {isValid ? 'Certificate Valid' : 'Certificate Invalid'}
          </h1>
          {isValid
            ? <p className="text-green-700 text-sm mt-1">This is an authentic BPA vaccination certificate.</p>
            : <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
          }
          <p className="text-xs text-gray-500 mt-3 font-mono">{cert!.certificateNumber}</p>
        </div>

        {/* Certificate details */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <h2 className="font-bold text-(--bpa-navy) text-lg">Certificate Details</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Pet */}
            {pet && (
              <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                <Syringe size={18} className="text-(--bpa-green) mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Pet</p>
                  <p className="font-medium text-(--bpa-navy)">{pet.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{pet.petType} {pet.breed ? `· ${pet.breed}` : ''}</p>
                </div>
              </div>
            )}

            {/* Owner */}
            {owner && (
              <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                <User size={18} className="text-(--bpa-green) mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Owner</p>
                  <p className="font-medium text-(--bpa-navy)">{owner.ownerName}</p>
                  <p className="text-xs text-gray-500">{owner.mobile}</p>
                </div>
              </div>
            )}

            {/* Campaign */}
            {cert!.campaign && (
              <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                <CalendarDays size={18} className="text-(--bpa-green) mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Campaign</p>
                  <p className="font-medium text-(--bpa-navy)">{cert!.campaign.title}</p>
                </div>
              </div>
            )}

            {/* Session date + venue */}
            {session && (
              <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                <MapPin size={18} className="text-(--bpa-green) mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Session</p>
                  <p className="font-medium text-(--bpa-navy)">{session.venue?.name ?? 'Venue'}</p>
                  <p className="text-xs text-gray-500">{formatDate(session.sessionDate)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Vaccines */}
          {cert!.services && cert!.services.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Vaccines / Services Administered</p>
              <div className="space-y-2">
                {cert!.services.map((svc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
                    <div className="flex items-center gap-2">
                      <Syringe size={14} className="text-(--bpa-green)" />
                      <span className="font-medium text-(--bpa-navy)">{svc.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Administered {formatDate(svc.administeredAt)}</p>
                      {svc.nextDueDate && <p className="text-xs text-(--bpa-green) font-semibold">Next due {formatDate(svc.nextDueDate)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Issue date */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
            <span>Issued {formatDate(cert!.issuedAt)}</span>
            <span className="font-mono">{cert!.certificateNumber}</span>
          </div>
        </div>

        {isValid && (
          <div className="mt-4">
            <a
              href={`${getApiOrigin()}/api/v1/public/campaigns/certificate-pdf/${encodeURIComponent(cert!.verifyToken)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-xl border border-(--bpa-green) text-(--bpa-green) py-2.5 text-sm font-medium hover:bg-(--bpa-green-light) transition-colors"
            >
              <Download size={16} />
              Download / Print Certificate
            </a>
          </div>
        )}

        <div className="mt-4 text-center text-sm">
          <Link href="/verify/cert" className="text-(--bpa-green) hover:underline">Verify another certificate →</Link>
        </div>
      </div>
    </div>
  );
}
