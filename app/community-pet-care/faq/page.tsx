import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';
import { ChevronDown } from 'lucide-react';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Community Pet Care FAQ — Frequently Asked Questions',
  description:
    'Answers to common questions about BPA Community Pet Care: contributions, Care Partner Card, zones, transparency, and Pet Smart Solution.',
  canonical: '/community-pet-care/faq',
  keywords: ['FAQ', 'care partner', 'community pet care', 'BPA'],
});

const FAQ_ITEMS = [
  {
    question: 'What is the BPA Community Pet Care initiative?',
    answer:
      'BPA is building 8 initial 24/7 Community Pet Clinics across Dhaka, funded entirely by community contributions. Each zone needs 10,000 contributors at ৳3,000 each to reach its operational target.',
  },
  {
    question: 'What do I get for my ৳3,000 contribution?',
    answer:
      'After a successful payment you receive a digital BPA Community Care Partner Card. The card gives you access to community clinic service benefits (subject to availability) and is valid for 5 years. It also serves as your proof of contribution.',
  },
  {
    question: 'Is my contribution a financial investment or profit-sharing?',
    answer:
      'No. The Care Partner Card is a contribution recognition and service benefit card only. It is not ownership, share, profit-sharing, investment, or financial return. Product, medicine, food, accessories, and third-party cost discounts are not guaranteed.',
  },
  {
    question: 'How do I receive my Care Partner Card?',
    answer:
      'After your payment is confirmed by the gateway, your Care Partner Card is issued automatically. You can look it up at /care-partner-card using your contribution number or registered mobile number.',
  },
  {
    question: 'How do I verify my Care Partner Card?',
    answer:
      'Scan the QR code on your card or visit /verify/care-card and enter your card\'s QR token to verify its authenticity and status.',
  },
  {
    question: 'Which zone should I choose?',
    answer:
      'Choose the zone nearest to your home or the clinic you would most like to support. You can view all 8 zones and their progress at /community-pet-care/zones.',
  },
  {
    question: 'Can I contribute anonymously?',
    answer:
      'Yes. There is an option on the contribution form to show your contribution as anonymous on public reports. Your name will still be on the private Care Partner Card record.',
  },
  {
    question: 'Where does my money go?',
    answer:
      'All contributions go directly to the Community Pet Care Fund for the selected zone. BPA publishes periodic transparency reports at /transparency showing total collected, total spent, and balance.',
  },
  {
    question: 'What is Pet Smart Solution?',
    answer:
      'Pet Smart Solution is a separate future platform that will handle clinic operations, pet shop inventory, doctor appointments, medical records, prescriptions, e-commerce, and social/community features. It is not part of BPA\'s Mother Organization website. See /pet-smart-solution for more.',
  },
  {
    question: 'How is BPA managing the clinic operations?',
    answer:
      'Clinic operations will be managed through Pet Smart Solution, a separate operational platform. BPA\'s website only handles Mother Organization activities — contributions, community care fund management, transparency, and Care Partner Card issuance.',
  },
  {
    question: 'What is Pet Census 2026?',
    answer:
      'Pet Census 2026 is a data-collection initiative to help BPA understand the pet population across Dhaka. Register your pets at /pet-census-2026. This helps BPA plan clinic capacity and staffing for each zone.',
  },
] as const;

export default function FaqPage() {
  return (
    <>
      <section className="bg-gray-50 border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-400 mb-4 flex gap-2 items-center">
            <Link href="/" className="hover:text-(--bpa-green)">Home</Link>
            <span>/</span>
            <Link href="/community-pet-care" className="hover:text-(--bpa-green)">Community Pet Care</Link>
            <span>/</span>
            <span className="text-gray-600">FAQ</span>
          </nav>
          <h1 className="text-4xl font-bold text-(--bpa-navy)">Frequently Asked Questions</h1>
          <p className="mt-3 text-lg text-gray-500 max-w-2xl">
            Everything you need to know about Community Pet Care, contributions, and the Care Partner Card.
          </p>
        </div>
      </section>

      <div className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="space-y-4">
            {FAQ_ITEMS.map((item, i) => (
              <details key={i} className="group bg-white rounded-xl border border-gray-200 shadow-sm">
                <summary className="flex items-center justify-between cursor-pointer px-6 py-5 font-semibold text-(--bpa-navy) list-none">
                  <span>{item.question}</span>
                  <ChevronDown
                    size={18}
                    className="text-gray-400 shrink-0 transition-transform group-open:rotate-180"
                  />
                </summary>
                <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>

          <div className="mt-12 p-6 bg-(--bpa-navy) rounded-2xl text-white text-center">
            <h2 className="text-xl font-bold mb-2">Still have questions?</h2>
            <p className="text-gray-300 text-sm mb-4">Contact the BPA team directly.</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-(--bpa-green) text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
