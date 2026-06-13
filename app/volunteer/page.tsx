import type { Metadata } from 'next';
import Breadcrumb from '@/components/ui/Breadcrumb';
import SectionHeader from '@/components/ui/SectionHeader';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import FaqJsonLd from '@/components/seo/FaqJsonLd';
import VolunteerForm from '@/components/forms/VolunteerForm';
import { buildMetadata } from '@/lib/seo';
import { getSeoData } from '@/lib/api/seo';
import { Heart, BookOpen, Users, Award, Clock, Globe } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData('/volunteer');
  return buildMetadata(
    {
      title: 'Volunteer — BPA',
      description: 'Volunteer with the Bangladesh Pet Association and make a real difference for animals across Bangladesh. Apply today.',
    },
    seo,
  );
}

const BENEFITS = [
  { icon: Heart, title: 'Make a Real Impact', desc: 'Your time and skills directly improve the lives of animals in need across Bangladesh.' },
  { icon: BookOpen, title: 'Gain Valuable Experience', desc: 'Develop skills in animal care, event management, communications, and more.' },
  { icon: Users, title: 'Join a Caring Community', desc: 'Connect with like-minded animal lovers and professionals who share your passion.' },
  { icon: Award, title: 'Recognition & Certificates', desc: 'Receive official BPA volunteer certificates and be recognised at our annual gala.' },
  { icon: Clock, title: 'Flexible Commitment', desc: 'Volunteer at your own pace — we have opportunities for every schedule and availability.' },
  { icon: Globe, title: 'National & International', desc: 'Represent BPA at national events and international animal welfare conferences.' },
];

const AREAS = [
  {
    area: 'Animal Rescue & Rehabilitation',
    desc: 'Support our rescue teams in identifying, rescuing, and rehabilitating stray and abandoned animals.',
    commitment: '8–16 hrs/month',
  },
  {
    area: 'Veterinary Assistance',
    desc: 'Assist veterinary professionals at BPA clinics, vaccination camps, and health awareness drives.',
    commitment: '4–8 hrs/month',
  },
  {
    area: 'Community Education',
    desc: 'Conduct workshops and seminars in schools, communities, and online platforms.',
    commitment: '4–8 hrs/month',
  },
  {
    area: 'Event Management',
    desc: 'Help organise and run BPA events, from small community meetups to large national conferences.',
    commitment: 'Event-based',
  },
  {
    area: 'Social Media & Communications',
    desc: 'Create content, manage social media, and help spread BPA\'s message online.',
    commitment: '2–4 hrs/week',
  },
  {
    area: 'Fundraising & Partnerships',
    desc: 'Build relationships with sponsors and donors to support BPA\'s programmes.',
    commitment: 'Flexible',
  },
];

const FAQ = [
  { question: 'Do I need experience with animals to volunteer?', answer: 'No prior experience is required for most volunteer roles. BPA provides training and orientation for all new volunteers.' },
  { question: 'What is the minimum age to volunteer?', answer: 'Volunteers must be at least 16 years old. Those under 18 require written parental consent.' },
  { question: 'How much time do I need to commit?', answer: 'It depends on the role. Some positions require just 2–4 hours per week, while others are more intensive. We work with your availability.' },
  { question: 'Will I receive a certificate?', answer: 'Yes — all active volunteers receive an annual BPA volunteer certificate recognising their contribution.' },
];

export default function VolunteerPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Volunteer', url: '/volunteer' }]} />
      <FaqJsonLd items={FAQ} />

      {/* Page header */}
      <section className="bg-gray-50 border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Volunteer' }]} />
          <h1 className="mt-4 text-4xl font-bold text-(--bpa-navy)">Volunteer With BPA</h1>
          <p className="mt-3 text-lg text-gray-500 max-w-2xl">
            Give your time, make a difference, change lives — for animals and people.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Why Volunteer"
            title="Benefits of Volunteering"
            subtitle="Volunteering with BPA is rewarding, flexible, and genuinely impactful."
            centered
          />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-(--bpa-green) rounded-lg flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-(--bpa-green)" />
                </div>
                <div>
                  <h3 className="font-semibold text-(--bpa-navy) mb-1">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Volunteer areas */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Where You Can Help" title="Volunteer Areas" centered />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {AREAS.map((a) => (
              <div key={a.area} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-(--bpa-navy) mb-2">{a.area}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{a.desc}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-(--bpa-navy) text-(--bpa-green)">
                  {a.commitment}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application form */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Get Involved"
            title="Volunteer Application"
            subtitle="Complete the form below and our volunteer coordinator will be in touch within 3 business days."
            centered
          />
          <div className="mt-12">
            <VolunteerForm />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Common Questions" title="FAQ" centered />
          <div className="mt-10 space-y-4">
            {FAQ.map((faq) => (
              <div key={faq.question} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-(--bpa-navy) mb-2">{faq.question}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
