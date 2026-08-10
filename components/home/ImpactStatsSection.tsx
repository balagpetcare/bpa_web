import { Syringe, Scissors, Users, Stethoscope, MapPinned } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import { Section, Container, Grid12 } from './Section';
import type { HomepageStats } from '@/lib/api/public-homepage';

interface Props {
  stats: HomepageStats;
}

// Every figure is a live count from bpa_api's `/public/homepage` contract —
// never an estimate, never a literal in this file. See
// homepage-public.repository.ts:getImpactStatisticsRaw on the backend.
export default function ImpactStatsSection({ stats }: Props) {
  const tiles = [
    { icon: Syringe, value: stats.animalsVaccinated, label: 'Animals Vaccinated' },
    { icon: Scissors, value: stats.spayNeuterCompleted, label: 'Spay & Neuter Procedures' },
    { icon: Users, value: stats.activeMembers, label: 'Active Members' },
    { icon: Stethoscope, value: stats.partnerClinics, label: 'Partner Clinics' },
    { icon: MapPinned, value: stats.districtsReached, label: 'Districts Reached' },
  ];

  return (
    <Section tone="green-tint" aria-label="Impact Statistics">
      <Container>
        <SectionHeader
          eyebrow="Impact"
          title="Progress You Can Measure"
          subtitle="Live figures drawn directly from BPA's operational records — updated as new campaigns and services complete."
          centered
        />
        <Grid12 className="mt-10">
          {tiles.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="col-span-1 sm:col-span-6 lg:col-span-4 flex flex-col items-center rounded-2xl border border-green-100 bg-white px-5 py-8 text-center"
            >
              <Icon className="h-7 w-7 text-(--bpa-green)" aria-hidden="true" />
              <p className="mt-4 text-4xl font-black text-(--bpa-navy) tabular-nums">{value.toLocaleString()}</p>
              <p className="mt-2 text-sm font-semibold text-gray-600">{label}</p>
            </div>
          ))}
        </Grid12>
      </Container>
    </Section>
  );
}
