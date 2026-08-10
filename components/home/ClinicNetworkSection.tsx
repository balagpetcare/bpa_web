import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Stethoscope, MapPin } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import { Section, Container, Grid12 } from './Section';
import type { HomepageClinic } from '@/lib/api/public-homepage';

interface Props {
  clinics: HomepageClinic[];
}

export default function ClinicNetworkSection({ clinics }: Props) {
  if (clinics.length === 0) return null;

  return (
    <Section tone="white" aria-label="Veterinary Clinic Network">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeader
            eyebrow="Nationwide coverage"
            title="Veterinary Clinic Network"
            subtitle="Verified partner clinics ready to support vaccination, treatment, and Spay & Neuter services."
          />
          <Link
            href="/clinics"
            className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-(--bpa-navy) transition-colors hover:text-(--bpa-green) md:inline-flex"
          >
            Find a clinic <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <Grid12 className="mt-10">
          {clinics.map((clinic) => {
            const content = clinic.slug ? `/clinics/${clinic.slug}` : '/clinics';
            const location = [clinic.area, clinic.district].filter(Boolean).join(', ');
            return (
              <Link
                key={clinic.id}
                href={content}
                className="group col-span-1 sm:col-span-6 lg:col-span-4 flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-(--bpa-green)/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--bpa-navy) focus-visible:ring-offset-2"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-(--bpa-green-light)">
                  {clinic.logo ? (
                    <Image
                      src={clinic.logo.url}
                      alt={clinic.logo.altText || clinic.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-(--bpa-green)">
                      <Stethoscope className="h-6 w-6" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-(--bpa-navy) group-hover:text-(--bpa-green) transition-colors">
                    {clinic.name}
                  </h3>
                  {location && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                      <span className="truncate">{location}</span>
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </Grid12>
        <div className="mt-8 text-center md:hidden">
          <Link
            href="/clinics"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--bpa-navy) hover:text-(--bpa-green)"
          >
            Find a clinic <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </Section>
  );
}
