import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Stethoscope } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import { Section, Container, Grid12 } from './Section';
import type { HomepageProgram } from '@/lib/api/public-homepage';

interface Props {
  programs: HomepageProgram[];
}

// Sourced from the admin-managed BpaProgram catalog (bpa_api `programs`
// field) — nothing here is hardcoded copy. If no programs have been
// configured yet in the admin panel, the section simply doesn't render.
export default function CoreServicesSection({ programs }: Props) {
  if (programs.length === 0) return null;

  return (
    <Section tone="white" aria-label="BPA Core Services">
      <Container>
        <SectionHeader
          eyebrow="What we do"
          title="BPA Core Services"
          subtitle="A national network of health, welfare, and community programs — each one a direct path into the BPA platform."
        />
        <Grid12 className="mt-10">
          {programs.map((program) => (
            <Link
              key={program.id}
              href={program.ctaHref || '#'}
              className="group col-span-1 sm:col-span-6 lg:col-span-4 flex flex-col rounded-2xl border border-gray-100 bg-white p-6 transition-all hover:-translate-y-1 hover:border-(--bpa-green)/30 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--bpa-navy) focus-visible:ring-offset-2"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--bpa-green-light) text-(--bpa-green) transition-colors group-hover:bg-(--bpa-green) group-hover:text-white overflow-hidden">
                {program.iconMedia ? (
                  <Image
                    src={program.iconMedia.url}
                    alt={program.iconMedia.altText || program.title}
                    width={28}
                    height={28}
                    className="h-7 w-7 object-contain"
                  />
                ) : (
                  <Stethoscope className="h-6 w-6" aria-hidden="true" />
                )}
              </div>
              <h3 className="mt-5 text-lg font-bold text-(--bpa-navy)">{program.title}</h3>
              {program.description && (
                <p className="mt-2 text-sm leading-6 text-gray-500 line-clamp-3">{program.description}</p>
              )}
              {program.ctaHref && (
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-(--bpa-green)">
                  {program.ctaLabel || 'Explore'}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              )}
            </Link>
          ))}
        </Grid12>
      </Container>
    </Section>
  );
}
