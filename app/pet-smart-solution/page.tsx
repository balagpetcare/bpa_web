import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';
import {
  Calendar,
  Clock3,
  FileText,
  Pill,
  ShoppingBag,
  Stethoscope,
  Store,
  Users,
} from 'lucide-react';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Pet Smart Solution - Coming Soon',
  description:
    'Pet Smart Solution is a separate future platform for clinic operations, pet shop, appointments, medical records, prescriptions, e-commerce, and community features. BPA remains the Mother Organization website.',
  canonical: '/pet-smart-solution',
  keywords: ['pet smart solution', 'BPA', 'pet clinic platform', 'coming soon'],
});

const FUTURE_MODULES = [
  { icon: Stethoscope, label: 'Clinic Operations', desc: 'Clinic workflow, service handling, and facility operations.' },
  { icon: Store, label: 'Pet Shop', desc: 'Future pet shop operations and supply handling in a separate system.' },
  { icon: Calendar, label: 'Appointments', desc: 'Doctor scheduling, booking, and operational visit management.' },
  { icon: FileText, label: 'Medical Records', desc: 'Operational pet health records maintained outside the BPA website.' },
  { icon: Pill, label: 'Prescriptions', desc: 'Prescription issuance and operational dispensing workflows.' },
  { icon: ShoppingBag, label: 'E-Commerce', desc: 'Product catalog, cart, checkout, and order management.' },
  { icon: Users, label: 'Community / Social', desc: 'Future social and community features in the standalone platform.' },
];

const BPA_WORKFLOWS = [
  'Membership',
  'Contributors',
  'Fundraising',
  'Care Partner Card',
  'Pet census lead collection',
  'Transparency',
  'CMS',
  'Payment flows',
];

export default function PetSmartSolutionPage() {
  return (
    <>
      <section className="bg-(--bpa-navy) text-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-(--bpa-green) rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Clock3 size={32} className="text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">Pet Smart Solution</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Coming soon as a separate operational platform. BPA&apos;s website remains the Mother Organization website and does not run
            clinic, pet shop, appointment, medical record, prescription, e-commerce, or social operations.
          </p>
        </div>
      </section>

      <div className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-start mb-14">
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
              <h2 className="text-2xl font-bold text-(--bpa-navy) mb-3">Separate Platform Boundary</h2>
              <p className="text-gray-700 leading-relaxed">
                Pet Smart Solution will be a separate future platform for clinic operations, pet shop, appointments, medical records,
                prescriptions, e-commerce, and community or social features.
              </p>
              <p className="text-gray-700 leading-relaxed mt-3">
                BPA website only handles Mother Organization workflows: membership, contributors, fundraising, Care Partner Card, pet
                census lead collection, transparency, CMS, and payment flows.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-bold text-(--bpa-navy) mb-3">BPA Website Scope</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                {BPA_WORKFLOWS.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-(--bpa-green)" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-(--bpa-navy) mb-3">Planned for Pet Smart Solution</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              These are future operational modules for the separate Pet Smart Solution platform. They are not available on the BPA website.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {FUTURE_MODULES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-gray-500" />
                </div>
                <h3 className="font-semibold text-(--bpa-navy) mb-2">{label}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                <span className="inline-block mt-4 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                  Coming Soon
                </span>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <p className="text-gray-500 mb-6">
              While Pet Smart Solution is being prepared, BPA continues to run Mother Organization workflows and community funding support.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/community-pet-care/contribute"
                className="inline-flex items-center gap-2 bg-(--bpa-green) px-7 py-3.5 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity"
              >
                Community Care Contribution
              </Link>
              <Link
                href="/pet-census-2026"
                className="inline-flex items-center gap-2 border-2 border-(--bpa-navy) px-7 py-3.5 rounded-lg font-semibold text-(--bpa-navy) hover:bg-(--bpa-navy) hover:text-white transition-colors"
              >
                Pet Census 2026
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
