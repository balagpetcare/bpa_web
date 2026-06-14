import type { Metadata } from 'next';
import Breadcrumb from '@/components/ui/Breadcrumb';
import SectionHeader from '@/components/ui/SectionHeader';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import FaqJsonLd from '@/components/seo/FaqJsonLd';
import ContactForm from '@/components/forms/ContactForm';
import { buildMetadata } from '@/lib/seo';
import { getSeoData } from '@/lib/api/seo';
import { getPublicSiteSettings, addressLines } from '@/lib/api/site-settings';
import { Mail, Phone, MapPin, Clock, MessageCircle } from 'lucide-react';

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

export default async function ContactPage() {
  const settings = await getPublicSiteSettings({
    next: { revalidate: 60 },
  } as RequestInit).catch(() => null);

  // ── Build dynamic contact info sections ───────────────────────────
  const addrLines = settings ? addressLines(settings) : [];

  type Section = { icon: React.ElementType; label: string; lines: string[]; isLinks?: boolean };
  const sections: Section[] = [];

  if (addrLines.length > 0) {
    sections.push({ icon: MapPin, label: 'Address', lines: addrLines });
  }

  const phoneLines: string[] = [];
  if (settings?.officialPhone) phoneLines.push(settings.officialPhone);
  if (settings?.emergencyPhone) phoneLines.push(`${settings.emergencyPhone} (Emergency)`);
  if (settings?.whatsappNumber) phoneLines.push(`${settings.whatsappNumber} (WhatsApp)`);
  if (phoneLines.length > 0) sections.push({ icon: Phone, label: 'Phone', lines: phoneLines });

  const emailLines: string[] = [];
  if (settings?.generalEmail) emailLines.push(settings.generalEmail);
  if (settings?.supportEmail && settings.supportEmail !== settings.generalEmail) emailLines.push(settings.supportEmail);
  if (emailLines.length > 0) sections.push({ icon: Mail, label: 'Email', lines: emailLines, isLinks: true });

  if (settings?.officeHours) {
    sections.push({ icon: Clock, label: 'Office Hours', lines: [settings.officeHours] });
  }

  if (settings?.whatsappNumber) {
    sections.push({
      icon: MessageCircle,
      label: 'WhatsApp',
      lines: [`Chat with us at ${settings.whatsappNumber}`],
    });
  }

  // ── Dynamic FAQ ───────────────────────────────────────────────────
  const faq = [
    {
      question: 'How quickly will you respond to my message?',
      answer: 'We aim to respond to all messages within 1–2 business days. For urgent matters, please call our office directly.',
    },
    ...(settings?.emergencyPhone
      ? [{
          question: 'I found an injured stray animal — who do I call?',
          answer: `Please call our emergency animal rescue line at ${settings.emergencyPhone}. We are available for rescue calls 7 days a week.`,
        }]
      : []),
    ...(settings?.generalEmail || settings?.supportEmail
      ? [{
          question: 'How can I report animal cruelty?',
          answer: `You can report animal cruelty by calling our hotline${settings.emergencyPhone ? ` at ${settings.emergencyPhone}` : ''} or emailing ${settings.generalEmail ?? settings.supportEmail}. All reports are treated confidentially.`,
        }]
      : []),
    {
      question: 'Can I visit the BPA office?',
      answer: settings?.officeHours
        ? `Yes — our office is open ${settings.officeHours}. We recommend calling ahead to schedule a visit.`
        : 'Yes — please call ahead to confirm our current office hours before visiting.',
    },
  ];

  // ── Map section ───────────────────────────────────────────────────
  const hasMap = !!(settings?.mapEmbedUrl || settings?.mapLink);
  const mapAddress = addrLines.join(', ') || null;

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Contact Us', url: '/contact' }]} />
      <FaqJsonLd items={faq} />

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

              {sections.length === 0 && (
                <p className="text-sm text-gray-400 italic">Contact information will appear here once configured.</p>
              )}

              {sections.map(({ icon: Icon, label, lines, isLinks }) => (
                <div key={label} className="flex gap-4">
                  <div className="w-10 h-10 bg-(--bpa-green-light) rounded-lg flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-(--bpa-green)" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                    {lines.map((line) =>
                      isLinks ? (
                        <a key={line} href={`mailto:${line}`} className="block text-sm text-(--bpa-green) hover:underline leading-relaxed">
                          {line}
                        </a>
                      ) : (
                        <p key={line} className="text-sm text-(--bpa-navy) leading-relaxed">{line}</p>
                      )
                    )}
                  </div>
                </div>
              ))}

              {settings?.mapLink && (
                <a
                  href={settings.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-(--bpa-green) hover:underline"
                >
                  <MapPin size={14} />
                  View on Google Maps
                </a>
              )}
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
          {settings?.mapEmbedUrl ? (
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm h-80">
              <iframe
                src={settings.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="BPA Office Location"
              />
            </div>
          ) : hasMap ? (
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100 h-80 flex items-center justify-center">
              <div className="text-center">
                <MapPin size={32} className="text-(--bpa-navy) mx-auto mb-3" />
                {mapAddress && <p className="text-sm font-medium text-gray-600">{mapAddress}</p>}
                {settings?.mapLink && (
                  <a href={settings.mapLink} target="_blank" rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm text-(--bpa-green) hover:underline">
                    View on Google Maps →
                  </a>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Common Questions" title="FAQ" centered />
          <div className="mt-10 space-y-4">
            {faq.map((item) => (
              <div key={item.question} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-(--bpa-navy) mb-2">{item.question}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
