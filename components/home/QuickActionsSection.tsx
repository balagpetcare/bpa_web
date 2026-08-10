import Link from 'next/link';
import { ArrowRight, Syringe, HeartHandshake, PawPrint, Megaphone } from 'lucide-react';
import { Section, Container, Grid12 } from './Section';

const QUICK_ACTIONS = [
  {
    title: 'Register for a Campaign',
    description: 'Join active vaccination and health-camp registration windows near you.',
    href: '/campaigns',
    icon: Syringe,
  },
  {
    title: 'Donate Now',
    description: 'Fund treatment, rescue transport, and community care programs directly.',
    href: '/donate',
    icon: HeartHandshake,
  },
  {
    title: 'Adopt a Pet',
    description: 'Give a rescued or surrendered animal a safe, responsible home.',
    href: '/adoption',
    icon: PawPrint,
  },
  {
    title: 'Report a Rescue',
    description: 'Alert the BPA volunteer network about an animal in distress.',
    href: '/contact',
    icon: Megaphone,
  },
] as const;

export default function QuickActionsSection() {
  return (
    <Section tone="white" aria-labelledby="quick-actions-heading">
      <Container>
        <h2 id="quick-actions-heading" className="sr-only">
          Quick actions
        </h2>
        <Grid12>
          {QUICK_ACTIONS.map(({ title, description, href, icon: Icon }) => (
            <Link
              key={title}
              href={href}
              className="group col-span-1 lg:col-span-3 flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 sm:p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-(--bpa-green)/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--bpa-navy) focus-visible:ring-offset-2"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--bpa-green-light) text-(--bpa-green) transition-colors group-hover:bg-(--bpa-green) group-hover:text-white">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-(--bpa-navy)">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-(--bpa-green)">
                Get started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </Grid12>
      </Container>
    </Section>
  );
}
