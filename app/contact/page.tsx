import type { Metadata } from 'next';
import Breadcrumb from '@/components/ui/Breadcrumb';
import SectionHeader from '@/components/ui/SectionHeader';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import FaqJsonLd from '@/components/seo/FaqJsonLd';
import ContactForm from '@/components/forms/ContactForm';
import { buildMetadata } from '@/lib/seo';
import { getSeoData } from '@/lib/api/seo';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

import { getPublicSiteSettings, addressLines } from '@/lib/api/site-settings';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData('/contact');
  return buildMetadata(
    {
      title: 'Contact Us — BPA',
      description: 'Get in touch with the Bangladesh Pet Association. We are here to help with membership, events, volunteers, and animal welfare questions.',
    },
    seo,
  );
}

const FAQ = [
  { question: 'How quickly will you respond to my message?', answer: 'We aim to respond to all messages within 1–2 business days. For urgent matters, please call our office directly.' },
  { question: 'I found an injured stray animal — who do I call?', answer: 'Please call our emergency animal rescue line at +880 1700-000000. We are available for rescue calls 7 days a week.' },
  { question: 'How can I report animal cruelty?', answer: 'You can report animal cruelty by calling our hotline or emailing report@bpa.org.bd. All reports are treated confidentially.' },
  { question: 'Can I visit the BPA office?', answer: 'Yes — our office is open Sunday to Thursday, 9 AM to 6 PM. We recommend calling ahead to schedule a visit.' },
];

export default async function ContactPage() {
  const s = await getPublicSiteSettings();

  const address = s.addressLine 
    ? [s.addressLine] 
    : addressLines(s).length > 0 
      ? addressLines(s) 
      : ['House 12, Road 5, Block D', 'Bashundhara R/A', 'Dhaka 1229, Bangladesh'];

  const phones = [s.primaryPhone, s.secondaryPhone, s.officialPhone, s.supportPhone].filter(Boolean) as string[];
  const finalPhones = phones.length > 0 ? phones : ['+880 2-8989-9999', '+880 1700-000000'];

  const emails = [s.contactEmail, s.supportEmail, s.generalEmail].filter(Boolean) as string[];
  const finalEmails = emails.length > 0 ? emails : ['info@bpa.org.bd', 'support@bpa.org.bd'];

  const officeHours = s.officeHours ? [s.officeHours] : ['Sunday – Thursday: 9 AM – 6 PM', 'Friday – Saturday: Closed'];

  const contactInfo = [
    { icon: MapPin, label: 'Address', lines: address },
    { icon: Phone, label: 'Phone', lines: finalPhones },
    { icon: Mail, label: 'Email', lines: finalEmails },
    { icon: Clock, label: 'Office Hours', lines: officeHours },
  ];

  const siteName = s.siteName || 'Bangladesh Pet Association';

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Contact Us', url: '/contact' }]} />
      <FaqJsonLd items={FAQ} />

      {/* Page header */}
      <section className="bg-gray-50 border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Contact Us' }]} />
          <h1 className="mt-4 text-4xl font-bold text-(--bpa-navy)">Contact Us</h1>
          <p className="mt-3 text-lg text-gray-500 max-w-2xl">
            We&apos;d love to hear from you. Reach out for any enquiry, partnership, or support request.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact info */}
            <div className="lg:col-span-1 space-y-6">
              <div>
                <SectionHeader eyebrow="Get in Touch" title="Contact Information" />
                <p className="mt-4 text-sm text-gray-500 leading-relaxed">
                  Whether you have a question about membership, want to report an animal welfare issue, or are interested in partnership — we are here to help.
                </p>
              </div>

              {contactInfo.map(({ icon: Icon, label, lines }) => (
                <div key={label} className="flex gap-4">
                  <div className="w-10 h-10 bg-(--bpa-green) rounded-lg flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-(--bpa-green)" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                    {lines.map((line) => (
                      <p key={line} className="text-sm text-(--bpa-green) leading-relaxed">{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                <h2 className="text-xl font-bold text-(--bpa-navy) mb-6">Send Us a Message</h2>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map section */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {s.mapEmbedUrl ? (
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm h-80">
              <iframe
                src={s.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${siteName} Location Map`}
              ></iframe>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100 h-80 flex items-center justify-center">
              <div className="text-center">
                <MapPin size={32} className="text-(--bpa-navy) mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-600">{siteName} Office — Bashundhara R/A, Dhaka</p>
                <p className="text-xs text-gray-400 mt-1">Interactive map coming soon</p>
              </div>
            </div>
          )}
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
