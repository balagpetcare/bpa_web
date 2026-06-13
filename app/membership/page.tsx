import type { Metadata } from 'next';
import Breadcrumb from '@/components/ui/Breadcrumb';
import SectionHeader from '@/components/ui/SectionHeader';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import FaqJsonLd from '@/components/seo/FaqJsonLd';
import MembershipForm from '@/components/forms/MembershipForm';
import { buildMetadata } from '@/lib/seo';
import { getSeoData } from '@/lib/api/seo';
import { CheckCircle, Users, BookOpen, Ticket, Stethoscope, Globe, Star } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData('/membership');
  return buildMetadata(
    {
      title: 'Join BPA — Membership',
      description: "Join the Bangladesh Pet Association. Choose from Regular, Student, or Corporate membership and become part of Bangladesh's largest pet welfare community.",
    },
    seo,
  );
}

const BENEFITS = [
  { icon: Users, title: 'Community Access', desc: 'Join a nationwide network of 2,500+ pet lovers and professionals.' },
  { icon: BookOpen, title: 'Exclusive Resources', desc: 'Access guides, webinars, and training materials on responsible pet ownership.' },
  { icon: Ticket, title: 'Event Discounts', desc: 'Priority registration and discounts on all BPA events and workshops.' },
  { icon: Stethoscope, title: 'Veterinary Directory', desc: 'Access BPA\'s vetted directory of certified veterinary professionals.' },
  { icon: Globe, title: 'Advocacy Voice', desc: 'Vote and participate in shaping BPA\'s national advocacy campaigns.' },
  { icon: Star, title: 'Member Recognition', desc: 'Annual recognition for outstanding contributions to animal welfare.' },
];

const MEMBERSHIP_TYPES = [
  {
    type: 'Regular',
    price: '৳500/year',
    tagline: 'For individual pet owners and animal lovers',
    features: ['Community forum access', 'Event registration discounts (10%)', 'Monthly newsletter', 'Veterinary directory access', 'Member certificate'],
  },
  {
    type: 'Student',
    price: '৳200/year',
    tagline: 'For full-time students with valid student ID',
    features: ['Same as Regular membership', 'Student mentorship programme', 'Career resources & internship listings'],
    highlight: false,
  },
  {
    type: 'Corporate',
    price: '৳5,000/year',
    tagline: 'For pet businesses and organisations',
    features: ['All Regular benefits', 'Featured listing in business directory', 'Sponsor recognition at events', 'Up to 5 staff member accounts', 'Co-branding on BPA campaigns'],
    highlight: true,
  },
];

const FAQ = [
  { question: 'How long does the membership approval take?', answer: 'Our team reviews applications within 2 business days. You will receive a confirmation email once approved.' },
  { question: 'Is the membership fee refundable?', answer: 'Membership fees are non-refundable once the application has been approved and your account activated.' },
  { question: 'Can I upgrade my membership type?', answer: 'Yes, you can upgrade your membership at any time by contacting our team. The price difference will be pro-rated.' },
  { question: 'Do I need to own a pet to join?', answer: 'Not at all! BPA welcomes anyone who cares about animals — whether you are a pet owner, veterinary professional, or simply an animal welfare advocate.' },
];

export default function MembershipPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Membership', url: '/membership' }]} />
      <FaqJsonLd items={FAQ} />

      {/* Page header */}
      <section className="bg-gray-50 border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Membership' }]} />
          <h1 className="mt-4 text-4xl font-bold text-(--bpa-navy)">Join BPA</h1>
          <p className="mt-3 text-lg text-gray-500 max-w-2xl">
            Become part of Bangladesh&apos;s largest pet welfare community.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Why Join"
            title="Membership Benefits"
            subtitle="Everything you get as a BPA member."
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

      {/* Membership types */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Choose Your Plan" title="Membership Types" centered />
          <div className="mt-12 grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {MEMBERSHIP_TYPES.map((mt) => (
              <div
                key={mt.type}
                className={[
                  'rounded-2xl p-8 border-2',
                  mt.highlight
                    ? 'border-(--bpa-green) bg-white shadow-lg relative'
                    : 'border-gray-200 bg-white',
                ].join(' ')}
              >
                {mt.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-(--bpa-green) text-white text-xs px-3 py-0.5 rounded-full font-medium">
                    Popular
                  </span>
                )}
                <h3 className="font-bold text-(--bpa-green) text-xl mb-1">{mt.type}</h3>
                <p className="text-3xl font-bold text-(--bpa-navy) mb-2">{mt.price}</p>
                <p className="text-xs text-gray-500 mb-6 leading-relaxed">{mt.tagline}</p>
                <ul className="space-y-2.5">
                  {mt.features.map((f) => (
                    <li key={f} className="flex gap-2 items-start text-sm text-gray-600">
                      <CheckCircle size={14} className="text-(--bpa-green) shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application form */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Get Started"
            title="Apply for Membership"
            subtitle="Fill in the form below and our team will get back to you within 2 business days."
            centered
          />
          <div className="mt-12">
            <MembershipForm />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Common Questions" title="Frequently Asked Questions" centered />
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
