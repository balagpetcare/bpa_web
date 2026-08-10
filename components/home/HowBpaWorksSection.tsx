import { Search, Link2, HandHeart, LineChart } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import { Section, Container, Grid12 } from './Section';

// Process explanation — structural copy, not a factual claim about any
// campaign, price, or status, so it stays static by design.
const STEPS = [
  {
    title: 'Discover',
    description: 'Find the right BPA program, campaign, or clinic for your need.',
    icon: Search,
  },
  {
    title: 'Connect',
    description: 'Join through membership, campaign registration, or a support request.',
    icon: Link2,
  },
  {
    title: 'Act',
    description: 'Volunteer, donate, adopt, or report a case through the BPA network.',
    icon: HandHeart,
  },
  {
    title: 'Track',
    description: 'Follow progress through campaign updates, reports, and transparency data.',
    icon: LineChart,
  },
] as const;

export default function HowBpaWorksSection() {
  return (
    <Section tone="gradient-soft" aria-label="How BPA Works">
      <Container>
        <SectionHeader
          eyebrow="How it works"
          title="How BPA Works"
          subtitle="A simple, repeatable path from discovering a need to seeing its real-world outcome."
          centered
        />
        <Grid12 className="mt-12">
          {STEPS.map(({ title, description, icon: Icon }, index) => (
            <div key={title} className="col-span-1 sm:col-span-6 lg:col-span-3 relative">
              <div className="flex flex-col items-start rounded-2xl border border-gray-100 bg-white p-6 h-full">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--bpa-green) text-white font-bold text-lg">
                  {index + 1}
                </div>
                <Icon className="mt-5 h-6 w-6 text-(--bpa-green)" aria-hidden="true" />
                <h3 className="mt-3 text-lg font-bold text-(--bpa-navy)">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
              </div>
            </div>
          ))}
        </Grid12>
      </Container>
    </Section>
  );
}
