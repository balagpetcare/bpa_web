import type { Metadata } from 'next';
import Breadcrumb from '@/components/ui/Breadcrumb';
import SectionHeader from '@/components/ui/SectionHeader';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import { buildMetadata } from '@/lib/seo';
import { getSeoData } from '@/lib/api/seo';
import { CheckCircle } from 'lucide-react';
import LinkButton from '@/components/ui/LinkButton';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData('/about');
  return buildMetadata(
    {
      title: 'About BPA',
      description: 'Learn about the Bangladesh Pet Association — our history, mission, and objectives for promoting animal welfare and responsible pet ownership.',
    },
    seo,
  );
}

const OBJECTIVES = [
  'Promote responsible pet ownership through education and awareness campaigns',
  'Advocate for stronger animal welfare legislation at the national level',
  'Establish a network of certified veterinary professionals across Bangladesh',
  'Run rescue, rehabilitation, and adoption programmes for stray animals',
  'Provide training and certifications for pet owners, breeders, and veterinary staff',
  'Collaborate with international animal welfare organisations',
  'Create a unified platform for pet lovers, breeders, and veterinary professionals',
  'Support research and development in veterinary medicine in Bangladesh',
];

const TIMELINE = [
  { year: '2016', title: 'Foundation', desc: 'BPA was established by a group of passionate pet owners and veterinary professionals in Dhaka.' },
  { year: '2018', title: 'National Recognition', desc: 'Registered as a national non-profit organisation and began formal membership programmes.' },
  { year: '2020', title: 'Community Growth', desc: 'Launched district chapters across 32 districts and surpassed 1,000 active members.' },
  { year: '2022', title: 'Policy Advocacy', desc: 'Submitted comprehensive animal welfare legislation proposals to the Ministry of Fisheries and Livestock.' },
  { year: '2024', title: 'Nationwide Presence', desc: 'Expanded to all 64 districts with over 2,500 members and 50+ annual events hosted.' },
];

export default function AboutPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'About BPA', url: '/about' }]} />

      {/* Page header */}
      <section className="bg-gray-50 border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'About BPA' }]} />
          <h1 className="mt-4 text-4xl font-bold text-(--bpa-navy)">About BPA</h1>
          <p className="mt-3 text-lg text-gray-500 max-w-2xl">
            Empowering Bangladesh&apos;s pet-loving community since 2016.
          </p>
        </div>
      </section>

      {/* Overview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <SectionHeader
                eyebrow="Who We Are"
                title="Bangladesh's Premier Pet Association"
                subtitle="The Bangladesh Pet Association (BPA) is a non-profit organisation dedicated to fostering a culture of compassion, responsibility, and respect for all animals across Bangladesh."
              />
              <p className="mt-6 text-gray-500 leading-relaxed">
                Founded in 2016, BPA brings together pet owners, veterinary professionals, animal welfare advocates, and pet businesses under one roof. We work to create a better environment for pets and the people who love them through education, advocacy, community programmes, and collaborative initiatives.
              </p>
              <p className="mt-4 text-gray-500 leading-relaxed">
                As Bangladesh&apos;s first dedicated national pet association, we are proud to serve over 2,500 members across all 64 districts, hosting more than 50 events annually and actively shaping policy for improved animal welfare legislation.
              </p>
              <div className="mt-8 flex gap-4 flex-wrap">
                <LinkButton href="/mission">Our Mission</LinkButton>
                <LinkButton href="/membership" variant="outline">Join BPA</LinkButton>
              </div>
            </div>
            {/* Stats visual */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '2,500+', label: 'Active Members' },
                { value: '64', label: 'Districts Covered' },
                { value: '50+', label: 'Events Per Year' },
                { value: '8+', label: 'Years Active' },
              ].map((s) => (
                <div key={s.label} className="bg-(--bpa-navy) rounded-2xl p-8 text-center text-white">
                  <div className="text-4xl font-bold text-(--bpa-green) mb-1">{s.value}</div>
                  <div className="text-sm text-gray-300">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* History */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Our Journey" title="History & Milestones" centered />
          <div className="mt-14 relative">
            {/* Timeline line */}
            <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-(--bpa-navy) -translate-x-0.5" />
            <div className="space-y-10">
              {TIMELINE.map((item, i) => (
                <div key={item.year} className={`relative flex gap-6 sm:gap-0 ${i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}>
                  {/* Content */}
                  <div className={`sm:w-1/2 ${i % 2 === 0 ? 'sm:pr-14 sm:text-right' : 'sm:pl-14'} pl-12 sm:pl-0`}>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                      <span className="text-(--bpa-navy) font-bold text-sm">{item.year}</span>
                      <h3 className="font-bold text-(--bpa-navy) text-lg mt-1 mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                  {/* Dot */}
                  <div className="absolute left-4 sm:left-1/2 top-6 w-3 h-3 bg-(--bpa-navy) rounded-full -translate-x-1.5 sm:-translate-x-1.5 ring-4 ring-white" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="What We Stand For" title="Our Objectives" centered />
          <ul className="mt-12 grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {OBJECTIVES.map((obj) => (
              <li key={obj} className="flex gap-3 items-start">
                <CheckCircle size={18} className="text-(--bpa-green) shrink-0 mt-0.5" />
                <span className="text-gray-600 leading-relaxed text-sm">{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
