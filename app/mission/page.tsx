import type { Metadata } from 'next';
import Breadcrumb from '@/components/ui/Breadcrumb';
import SectionHeader from '@/components/ui/SectionHeader';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import { buildMetadata } from '@/lib/seo';
import { getSeoData } from '@/lib/api/seo';
import { Target, Heart, Users, Shield, BookOpen, Globe } from 'lucide-react';
import CtaSection from '@/components/sections/CtaSection';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData('/mission');
  return buildMetadata(
    {
      title: 'Our Mission',
      description: "BPA's mission is to promote responsible pet ownership, animal welfare, and build a compassionate community for all animals across Bangladesh.",
    },
    seo,
  );
}

const KEY_GOALS = [
  {
    icon: Heart,
    title: 'Animal Welfare',
    desc: 'Ensure all pets and stray animals in Bangladesh receive humane treatment, proper medical care, and protection from cruelty and neglect.',
  },
  {
    icon: BookOpen,
    title: 'Education & Awareness',
    desc: 'Empower pet owners through workshops, resources, and campaigns on nutrition, health, training, and responsible breeding practices.',
  },
  {
    icon: Users,
    title: 'Community Building',
    desc: 'Foster a supportive national network of pet lovers, veterinary professionals, and animal welfare advocates across all 64 districts.',
  },
  {
    icon: Shield,
    title: 'Policy & Advocacy',
    desc: 'Champion the development and enforcement of animal welfare legislation, and represent the community in national policy discussions.',
  },
  {
    icon: Target,
    title: 'Rescue & Rehabilitation',
    desc: 'Run and support rescue operations, rehabilitation centres, and adoption programmes for stray and abandoned animals.',
  },
  {
    icon: Globe,
    title: 'International Partnerships',
    desc: 'Collaborate with global animal welfare organisations to bring international best practices and resources to Bangladesh.',
  },
];

export default function MissionPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Our Mission', url: '/mission' }]} />

      {/* Page header */}
      <section className="bg-gray-50 border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Our Mission' }]} />
          <h1 className="mt-4 text-4xl font-bold text-(--bpa-navy)">Our Mission</h1>
          <p className="mt-3 text-lg text-gray-500 max-w-2xl">
            The purpose that drives everything we do.
          </p>
        </div>
      </section>

      {/* Mission statement */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-(--bpa-navy) text-sm font-semibold uppercase tracking-widest mb-6">Mission Statement</p>
          <blockquote className="text-3xl sm:text-4xl font-bold text-(--bpa-navy) leading-snug mb-8">
            &ldquo;To promote responsible pet ownership, protect animal welfare, and build a compassionate community across Bangladesh — where every animal lives with dignity and care.&rdquo;
          </blockquote>
          <div className="w-20 h-1 bg-(--bpa-navy) mx-auto rounded-full" />
          <p className="mt-8 text-gray-500 text-lg leading-relaxed max-w-3xl mx-auto">
            Every programme, campaign, and initiative we run is guided by this core mission. From rescue operations to national policy advocacy, from member workshops to international partnerships — we are united by our commitment to animals and the people who care for them.
          </p>
        </div>
      </section>

      {/* Key goals */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="How We Deliver Our Mission"
            title="Key Goals"
            subtitle="Six pillars that translate our mission into measurable, impactful action."
            centered
          />
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {KEY_GOALS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-(--bpa-green) rounded-xl flex items-center justify-center mb-5">
                  <Icon size={22} className="text-(--bpa-green)" />
                </div>
                <h3 className="font-bold text-(--bpa-navy) text-lg mb-3">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-(--bpa-navy) rounded-3xl p-10 lg:p-16">
            <SectionHeader eyebrow="Our Values" title="What We Believe In" light centered />
            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              {[
                { title: 'Compassion', desc: 'Every animal deserves kindness and care regardless of breed or status.' },
                { title: 'Integrity', desc: 'We act transparently and hold ourselves accountable to our members and community.' },
                { title: 'Inclusion', desc: 'All pet owners are welcome — regardless of background or experience level.' },
                { title: 'Impact', desc: 'We measure our success by the tangible improvement in animal welfare across Bangladesh.' },
              ].map((v) => (
                <div key={v.title} className="bg-white/5 rounded-2xl p-6">
                  <div className="w-2 h-2 bg-(--bpa-navy) rounded-full mx-auto mb-4" />
                  <h3 className="font-bold text-white mb-2">{v.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
