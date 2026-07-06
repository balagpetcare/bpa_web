import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, ShieldCheck, HeartHandshake, Megaphone, Stethoscope, Sparkles, BadgeCheck, CircleDollarSign, ClipboardList, PawPrint, HeartPulse } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import Card from '@/components/ui/Card';
import LinkButton from '@/components/ui/LinkButton';

type ActionCard = {
  title: string;
  description: string;
  href: string;
};

type ProgramCard = ActionCard & {
  icon: ReactNode;
};

const quickActions: ActionCard[] = [
  { title: 'Register for Campaign', description: 'Join upcoming vaccination and awareness drives.', href: '/campaigns' },
  { title: 'Donate Now', description: 'Support rescue, treatment, and community care.', href: '/donate' },
  { title: 'Adopt a Pet', description: 'Give a rescued animal a safe and loving home.', href: '/adoption' },
  { title: 'Report Rescue', description: 'Alert the BPA network about animals in distress.', href: '/contact' },
];

const corePrograms: ProgramCard[] = [
  { title: 'Vaccination Campaigns', description: 'City and district-wide preventive care drives.', href: '/campaigns', icon: <ShieldCheck className="h-5 w-5" /> },
  { title: 'Pet Adoption', description: 'Responsible matching for rescued and adoptable pets.', href: '/adoption', icon: <PawPrint className="h-5 w-5" /> },
  { title: 'Animal Rescue', description: 'Rapid response support for injured or abandoned animals.', href: '/rescue', icon: <HeartPulse className="h-5 w-5" /> },
  { title: 'Donation & Fundraising', description: 'Crowdfunded support for treatment, transport, and care.', href: '/donate', icon: <CircleDollarSign className="h-5 w-5" /> },
  { title: 'Awareness & Education', description: 'Responsible pet ownership and welfare campaigns.', href: '/awareness', icon: <Megaphone className="h-5 w-5" /> },
  { title: 'Pet Census', description: 'Data-driven planning for Bangladesh pet communities.', href: '/pet-census-2026', icon: <ClipboardList className="h-5 w-5" /> },
  { title: 'Membership Program', description: 'National network for trusted pet owners and supporters.', href: '/membership', icon: <BadgeCheck className="h-5 w-5" /> },
  { title: 'Veterinary Support', description: 'Partner clinics and clinical referrals when needed.', href: '/partners', icon: <Stethoscope className="h-5 w-5" /> },
];

const campaignPillars = [
  {
    title: 'Community Clinics',
    text: 'Partner clinics host vaccination and treatment days in accessible locations.',
  },
  {
    title: 'Volunteer Response',
    text: 'Volunteer teams coordinate rescue, transport, and support operations.',
  },
  {
    title: 'Trusted Network',
    text: 'Members, clinics, and local supporters work together under a national platform.',
  },
];

const stats = [
  { value: '64', label: 'District Reach', note: 'Expanding through local chapters and partners.' },
  { value: '120+', label: 'Partner Clinics', note: 'Clinical support for treatment and vaccination.' },
  { value: '3,500+', label: 'Active Members', note: 'A growing community of pet advocates.' },
  { value: '15,000+', label: 'Animals Impacted', note: 'Through rescue, care, and education programs.' },
];

const newsItems = [
  {
    title: 'BPA launches nationwide cat vaccination drive',
    category: 'Awareness',
    href: '/campaigns',
  },
  {
    title: 'Volunteer response teams expand rescue support',
    category: 'Community',
    href: '/volunteer',
  },
  {
    title: 'Partner clinics join the national care network',
    category: 'Network',
    href: '/partners',
  },
];

function SectionShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`py-16 sm:py-20 ${className}`}>{children}</section>;
}

function SectionContainer({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

export function QuickActionSection() {
  return (
    <SectionShell className="bg-white">
      <SectionContainer>
        <SectionHeader
          eyebrow="Quick actions"
          title="Choose the next step in seconds"
          subtitle="The homepage keeps the most common BPA actions front and center for visitors, members, and volunteers."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((item) => (
            <Card key={item.title} hover className="p-5 sm:p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-(--bpa-green-light) text-(--bpa-green) mb-4">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-(--bpa-navy)">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">{item.description}</p>
              <Link href={item.href} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-(--bpa-green)">
                Go there <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>
          ))}
        </div>
      </SectionContainer>
    </SectionShell>
  );
}

export function AboutSection() {
  return (
    <SectionShell className="bg-[linear-gradient(180deg,#f7fbf8_0%,#ffffff_100%)]">
      <SectionContainer>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <SectionHeader
              eyebrow="About BPA"
              title="A trusted national platform for animal welfare"
              subtitle="Bangladesh Pet Association connects pet owners, volunteers, partner clinics, and community leaders around responsible pet care and compassionate action."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {campaignPillars.map((pillar) => (
                <Card key={pillar.title} className="p-5">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-(--bpa-green)">{pillar.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">{pillar.text}</p>
                </Card>
              ))}
            </div>
          </div>
          <Card className="p-6 sm:p-8 bg-(--bpa-navy) text-white">
            <p className="text-sm font-semibold uppercase tracking-widest text-green-300">Mission</p>
            <h3 className="mt-3 text-2xl font-bold">Protect, educate, and mobilize communities across Bangladesh.</h3>
            <p className="mt-4 text-sm leading-7 text-gray-300">
              BPA helps create safe, organized, and scalable animal welfare action through vaccination campaigns, rescue coordination, pet census efforts, donations, and verified volunteer participation.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <LinkButton href="/about" variant="white" size="md">Learn More</LinkButton>
              <LinkButton href="/membership" variant="outline" size="md" className="border-white text-white hover:bg-white/10">Become a Member</LinkButton>
            </div>
          </Card>
        </div>
      </SectionContainer>
    </SectionShell>
  );
}

export function ProgramsSection() {
  return (
    <SectionShell className="bg-white">
      <SectionContainer>
        <SectionHeader
          eyebrow="Core programs"
          title="Programs designed for measurable impact"
          subtitle="The BPA homepage introduces the organization through the services and actions that matter most to the public."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {corePrograms.map((program) => (
            <Card key={program.title} hover className="p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-(--bpa-green-light) text-(--bpa-green)">
                {program.icon}
              </div>
              <h3 className="mt-4 text-base font-bold text-(--bpa-navy)">{program.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">{program.description}</p>
              <Link href={program.href} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-(--bpa-green)">
                Explore <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>
          ))}
        </div>
      </SectionContainer>
    </SectionShell>
  );
}

export function FeaturedCampaignSection() {
  return (
    <SectionShell className="bg-(--bpa-navy)">
      <SectionContainer>
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <SectionHeader
              eyebrow="Featured campaign"
              title="BPA Cat Vaccination Campaign 2026"
              subtitle="A flagship campaign for prevention, community outreach, and partner clinic activation across Bangladesh."
              light
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <LinkButton href="/campaigns" size="lg">Register for Campaign <ArrowRight className="h-4 w-4" /></LinkButton>
              <LinkButton href="/awareness" variant="outline" size="lg" className="border-white text-white hover:bg-white/10">Learn More</LinkButton>
            </div>
          </div>
          <Card className="p-6 sm:p-8 bg-white/5 border-white/10 text-white">
            <div className="grid gap-4">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-widest text-green-200">Focus</p>
                <p className="mt-2 text-sm text-gray-200">Vaccination, awareness, and clinic coordination in one community drive.</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-widest text-green-200">Audience</p>
                <p className="mt-2 text-sm text-gray-200">Pet owners, volunteers, clinics, and local welfare partners.</p>
              </div>
            </div>
          </Card>
        </div>
      </SectionContainer>
    </SectionShell>
  );
}

export function HowItWorksSection() {
  const steps = [
    { title: 'Discover', description: 'Find the right BPA program or campaign for your need.' },
    { title: 'Connect', description: 'Join through membership, registration, or a support request.' },
    { title: 'Act', description: 'Volunteer, donate, adopt, or report a case.' },
    { title: 'Track', description: 'See the impact through updates, stories, and campaign reporting.' },
  ];
  return (
    <SectionShell className="bg-[linear-gradient(180deg,#fff,#f7fafc)]">
      <SectionContainer>
        <SectionHeader
          eyebrow="How it works"
          title="Simple paths into the BPA network"
          subtitle="The homepage should help visitors understand how to participate without searching through the menu."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <Card key={step.title} className="p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--bpa-green) text-white font-bold">
                {index + 1}
              </div>
              <h3 className="mt-4 text-lg font-bold text-(--bpa-navy)">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">{step.description}</p>
            </Card>
          ))}
        </div>
      </SectionContainer>
    </SectionShell>
  );
}

export function ImpactSection() {
  return (
    <SectionShell className="bg-white">
      <SectionContainer>
        <SectionHeader
          eyebrow="Impact"
          title="Progress you can measure"
          subtitle="Use statistics to communicate scale, credibility, and the strength of the national network."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-6">
              <p className="text-3xl font-black text-(--bpa-navy)">{stat.value}</p>
              <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-(--bpa-green)">{stat.label}</p>
              <p className="mt-3 text-sm leading-6 text-gray-500">{stat.note}</p>
            </Card>
          ))}
        </div>
      </SectionContainer>
    </SectionShell>
  );
}

export function AdoptionRescueSection() {
  return (
    <SectionShell className="bg-(--bpa-green-light)">
      <SectionContainer>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-(--bpa-green)">Adoption</p>
            <h3 className="mt-3 text-2xl font-bold text-(--bpa-navy)">Find a companion that fits your home and lifestyle.</h3>
            <p className="mt-4 text-sm leading-7 text-gray-600">BPA adoption awareness encourages responsible placements and post-adoption support.</p>
            <LinkButton href="/adoption" size="md" className="mt-6">Adopt a Pet</LinkButton>
          </Card>
          <Card className="p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-(--bpa-green)">Rescue</p>
            <h3 className="mt-3 text-2xl font-bold text-(--bpa-navy)">Report urgent cases and help move animals to safety.</h3>
            <p className="mt-4 text-sm leading-7 text-gray-600">A clear rescue path lets volunteers and partner clinics respond faster and more effectively.</p>
            <LinkButton href="/contact" variant="outline" size="md" className="mt-6">Report Rescue</LinkButton>
          </Card>
        </div>
      </SectionContainer>
    </SectionShell>
  );
}

export function DonationImpactSection() {
  return (
    <SectionShell className="bg-white">
      <SectionContainer>
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <Card className="p-6 sm:p-8 bg-(--bpa-navy) text-white">
            <p className="text-sm font-semibold uppercase tracking-widest text-green-300">Donation impact</p>
            <h3 className="mt-3 text-2xl font-bold">Your contribution helps fund real-world care.</h3>
            <p className="mt-4 text-sm leading-7 text-gray-300">Every donation supports vaccination, rescue transport, emergency treatment, and educational outreach.</p>
            <LinkButton href="/donate" size="lg" className="mt-6">Donate Now</LinkButton>
          </Card>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { title: 'Vaccines', icon: <ShieldCheck className="h-5 w-5" /> },
              { title: 'Rescue', icon: <HeartHandshake className="h-5 w-5" /> },
              { title: 'Care', icon: <HeartPulse className="h-5 w-5" /> },
            ].map((item) => (
              <Card key={item.title} className="p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-(--bpa-green-light) text-(--bpa-green)">
                  {item.icon}
                </div>
                <h4 className="mt-4 font-bold text-(--bpa-navy)">{item.title}</h4>
              </Card>
            ))}
          </div>
        </div>
      </SectionContainer>
    </SectionShell>
  );
}

export function PartnersCtaSection() {
  const ctas = [
    { label: 'Become a Member', href: '/membership' },
    { label: 'Join as Volunteer', href: '/volunteer' },
    { label: 'Partner Clinics', href: '/partners' },
  ];
  return (
    <SectionShell className="bg-(--bpa-navy)">
      <SectionContainer>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 lg:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-green-300">Partners / clinics / volunteers</p>
              <h3 className="mt-3 text-2xl sm:text-3xl font-bold text-white">Build the BPA network with your organization or time.</h3>
              <p className="mt-4 text-sm leading-7 text-gray-300">A strong national platform depends on trusted partners, compassionate clinics, and active volunteers across Bangladesh.</p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              {ctas.map((cta) => (
                <LinkButton key={cta.label} href={cta.href} variant="white" size="md">{cta.label}</LinkButton>
              ))}
            </div>
          </div>
        </div>
      </SectionContainer>
    </SectionShell>
  );
}

export function NewsPreviewSection() {
  return (
    <SectionShell className="bg-white">
      <SectionContainer>
        <SectionHeader
          eyebrow="News & awareness"
          title="Recent stories and public updates"
          subtitle="Use this area to highlight campaigns, awareness posts, and short blog-style updates."
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {newsItems.map((item) => (
            <Card key={item.title} hover className="p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-(--bpa-green)">{item.category}</p>
              <h3 className="mt-3 text-lg font-bold text-(--bpa-navy)">{item.title}</h3>
              <Link href={item.href} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-(--bpa-green)">
                Read more <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>
          ))}
        </div>
      </SectionContainer>
    </SectionShell>
  );
}

export function FinalCtaSection() {
  return (
    <SectionShell className="bg-[linear-gradient(135deg,#1a2540_0%,#123d28_100%)]">
      <SectionContainer>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 sm:p-10 text-center text-white">
          <p className="text-sm font-semibold uppercase tracking-widest text-green-300">Join BPA</p>
          <h3 className="mt-3 text-3xl sm:text-4xl font-black">Help build a healthier future for Bangladesh&apos;s pets.</h3>
          <p className="mt-4 text-sm sm:text-base leading-7 text-gray-300 max-w-2xl mx-auto">
            Whether you want to donate, adopt, volunteer, or become a member, BPA gives you a trusted place to start.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <LinkButton href="/donate" size="lg">Donate Now</LinkButton>
            <LinkButton href="/adoption" variant="outline" size="lg" className="border-white text-white hover:bg-white/10">Adopt a Pet</LinkButton>
            <LinkButton href="/volunteer" variant="outline" size="lg" className="border-white text-white hover:bg-white/10">Join as Volunteer</LinkButton>
          </div>
        </div>
      </SectionContainer>
    </SectionShell>
  );
}
