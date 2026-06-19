import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { buildMetadata } from '@/lib/seo';

const LAST_UPDATED = 'June 2025';
const CONTACT_EMAIL = 'bangladeshpetassociation@gmail.com';

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: 'Terms of Service',
    description:
      'Read the Terms of Service for Bangladesh Pet Association — covering account use, social login, membership, donations, campaign registration, certificates, payments, and user responsibilities.',
    canonical: '/terms',
    keywords: ['BPA terms of service', 'Bangladesh Pet Association terms', 'membership terms'],
  });
}

export default function TermsPage() {
  return (
    <>
      <section className="bg-gray-50 border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Terms of Service' }]} />
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-(--bpa-navy)">
            Terms of Service
          </h1>
          <p className="mt-1 text-xl font-medium text-gray-400">ব্যবহারের শর্তাবলি</p>
          <p className="mt-3 text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

          <Section title="Acceptance of Terms | শর্ত গ্রহণ">
            <p>
              By accessing or using the website at{' '}
              <strong>https://bangladeshpetassociation.com</strong> or any service provided by Bangladesh
              Pet Association (&quot;BPA&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), you agree to be bound by these Terms
              of Service. If you do not agree to these terms, please do not use our website or services.
            </p>
            <p>
              We reserve the right to update these Terms at any time. The current version will always be
              available at this page. Continued use of our services after changes are posted constitutes
              acceptance of the revised Terms.
            </p>
          </Section>

          <Section title="Account Registration &amp; Social Login | অ্যাকাউন্ট নিবন্ধন">
            <p>
              To access certain features — including membership registration, campaign sign-ups, donation
              tracking, and certificate downloads — you must create a BPA account.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>
                You may register with an email address and password, or use Google or Facebook social
                login.
              </li>
              <li>
                When using social login, you authorise BPA to receive your name, email address, profile
                photo, and unique provider account identifier. See our{' '}
                <Link href="/privacy-policy" className="text-(--bpa-green) hover:underline">
                  Privacy Policy
                </Link>{' '}
                for full details.
              </li>
              <li>
                You are responsible for maintaining the confidentiality of your account credentials and
                for all activities that occur under your account.
              </li>
              <li>
                You must provide accurate, current, and complete information during registration and keep
                it up to date.
              </li>
              <li>
                You must be at least 13 years of age to create an account. Users under 18 should obtain
                parental consent.
              </li>
            </ul>
          </Section>

          <Section title="User Responsibilities | ব্যবহারকারীর দায়িত্ব">
            <p>You agree that you will not:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>Provide false, misleading, or fraudulent information in any form or registration.</li>
              <li>
                Use our platform to harass, abuse, defame, or harm any person, animal, or organisation.
              </li>
              <li>Attempt to gain unauthorised access to any part of our systems or other accounts.</li>
              <li>Upload malicious code, spam, or disruptive content.</li>
              <li>
                Reproduce, distribute, or commercially exploit any content from BPA without prior written
                permission.
              </li>
              <li>
                Use our services in violation of any applicable law or regulation in Bangladesh or
                internationally.
              </li>
            </ul>
          </Section>

          <Section title="Pet Owner &amp; Campaign Registration | পেট মালিক ও ক্যাম্পেইন নিবন্ধন">
            <p>
              BPA organises vaccination campaigns, pet census drives, and other community programmes.
              When registering for a campaign:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>
                You confirm that all pet and owner information submitted is accurate and up to date.
              </li>
              <li>
                Campaign slot availability is not guaranteed until a confirmation message (email or SMS) is
                received.
              </li>
              <li>
                BPA reserves the right to cancel or reschedule a campaign slot due to veterinary
                availability, public health considerations, or force majeure. Registered participants will
                be notified promptly.
              </li>
              <li>
                Campaign participation may be subject to specific eligibility requirements published on the
                relevant campaign page.
              </li>
            </ul>
          </Section>

          <Section title="Membership Terms | সদস্যপদের শর্তাবলি">
            <p>
              BPA offers individual and organisational membership tiers. By applying for membership, you
              agree that:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>
                Membership applications are subject to review and approval by BPA. Submission of an
                application does not guarantee acceptance.
              </li>
              <li>
                Membership fees, once paid and the application approved, are non-refundable except as
                described in our{' '}
                <Link href="/refund-policy" className="text-(--bpa-green) hover:underline">
                  Refund Policy
                </Link>
                .
              </li>
              <li>
                Membership benefits, including the Community Care Partner Card, are personal and
                non-transferable.
              </li>
              <li>
                BPA reserves the right to revoke membership for violation of these Terms or conduct
                deemed harmful to animals, members, or the organisation.
              </li>
              <li>
                Membership renewal terms and fees are subject to change with 30 days&apos; notice to active
                members.
              </li>
            </ul>
          </Section>

          <Section title="Donations &amp; Payments | দান এবং পেমেন্ট">
            <p>BPA accepts online donations to support animal welfare initiatives across Bangladesh.</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>
                Donations are processed through EPS Bangladesh (online gateway) or manually through mobile
                financial services (bKash, Nagad, Rocket).
              </li>
              <li>
                Donation amounts are applied to BPA&apos;s general welfare fund or a specific campaign
                purpose as selected at the time of giving.
              </li>
              <li>
                BPA is a non-profit organisation. Donations do not constitute a purchase and are generally
                non-refundable, except in the case of technical errors or duplicate charges. See our{' '}
                <Link href="/refund-policy" className="text-(--bpa-green) hover:underline">
                  Refund Policy
                </Link>
                .
              </li>
              <li>
                A donation receipt or confirmation message will be sent to the registered email or phone
                number provided.
              </li>
            </ul>
          </Section>

          <Section title="Refund &amp; Cancellation | রিফান্ড এবং বাতিল">
            <p>
              Our refund and cancellation terms are governed by our dedicated{' '}
              <Link href="/refund-policy" className="text-(--bpa-green) hover:underline">
                Refund Policy
              </Link>
              , which covers membership fees, campaign fees, donations, and failed or duplicate payments.
              Please review that page before making any payment.
            </p>
          </Section>

          <Section title="Certificates &amp; Verification | সার্টিফিকেট এবং যাচাইকরণ">
            <p>
              BPA issues digital certificates and QR-code verified cards for membership, vaccination
              participation, and related programmes.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>
                Certificates are issued only upon successful verification of eligibility and/or payment.
              </li>
              <li>
                Certificates remain the property of BPA and may be revoked if obtained through
                fraudulent means or if membership is terminated.
              </li>
              <li>
                QR codes embedded in certificates are linked to BPA&apos;s verification system. Any
                tampering with the QR code or certificate content will invalidate the document.
              </li>
              <li>
                BPA reserves the right to update certificate formats or verification mechanisms as needed.
              </li>
            </ul>
          </Section>

          <Section title="Prohibited Activities | নিষিদ্ধ কার্যকলাপ">
            <p>The following activities are strictly prohibited on our platform:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>Creating fake accounts or impersonating another person or organisation.</li>
              <li>Submitting false vaccination or pet registration records.</li>
              <li>
                Using BPA&apos;s logo, name, certificates, or branding without explicit written authorisation.
              </li>
              <li>Scraping, crawling, or automated data extraction from our website.</li>
              <li>Any activity that disrupts the availability or integrity of our services.</li>
            </ul>
            <p className="mt-3">
              Violation of any of the above may result in immediate account suspension, revocation of
              membership, and/or referral to relevant authorities.
            </p>
          </Section>

          <Section title="Service Availability | সেবার প্রাপ্যতা">
            <p>
              BPA strives to maintain continuous availability of our website and services, but does not
              guarantee uninterrupted access. We may suspend or restrict services temporarily for
              maintenance, upgrades, or circumstances beyond our control. We will endeavour to provide
              reasonable advance notice of planned maintenance.
            </p>
          </Section>

          <Section title="Limitation of Liability | দায়বদ্ধতার সীমা">
            <p>
              To the fullest extent permitted by applicable law, BPA, its officers, volunteers, and
              staff shall not be liable for any indirect, incidental, special, consequential, or punitive
              damages arising from your use of, or inability to use, our website or services — including
              but not limited to loss of data, missed campaign registrations, or payment processing
              delays.
            </p>
            <p className="mt-3">
              BPA&apos;s total liability to you for any claim arising under these Terms shall not exceed the
              amount you paid to BPA in the 12 months preceding the claim, or BDT 1,000, whichever is
              greater.
            </p>
          </Section>

          <Section title="Governing Law | প্রযোজ্য আইন">
            <p>
              These Terms are governed by and construed in accordance with the laws of Bangladesh. Any
              disputes arising under these Terms shall be subject to the exclusive jurisdiction of the
              courts of Dhaka, Bangladesh.
            </p>
          </Section>

          <Section title="Changes to These Terms | শর্তের পরিবর্তন">
            <p>
              BPA reserves the right to modify these Terms of Service at any time. Updated Terms will be
              posted on this page with a revised &quot;Last updated&quot; date. We will notify registered members
              of material changes via email or in-app notification. Continued use of our services after
              the effective date of revised Terms constitutes your acceptance.
            </p>
          </Section>

          <Section title="Contact Us | যোগাযোগ করুন">
            <p>For questions about these Terms, please contact us:</p>
            <div className="mt-4 p-5 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700 space-y-1">
              <p className="font-semibold text-(--bpa-navy)">Bangladesh Pet Association</p>
              <p>
                Email:{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-(--bpa-green) hover:underline">
                  {CONTACT_EMAIL}
                </a>
              </p>
              <p>
                Website:{' '}
                <a
                  href="https://bangladeshpetassociation.com"
                  className="text-(--bpa-green) hover:underline"
                >
                  https://bangladeshpetassociation.com
                </a>
              </p>
            </div>
          </Section>

        </div>
      </section>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-l-4 border-(--bpa-green) pl-6">
      <h2 className="text-xl font-bold text-(--bpa-navy) mb-4">{title}</h2>
      <div className="text-gray-600 leading-relaxed space-y-3">{children}</div>
    </div>
  );
}
