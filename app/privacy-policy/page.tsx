import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { buildMetadata } from '@/lib/seo';

const LAST_UPDATED = 'June 2025';
const CONTACT_EMAIL = 'bangladeshpetassociation@gmail.com';

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: 'Privacy Policy',
    description:
      'Learn how Bangladesh Pet Association collects, uses, and protects your personal data, including information received through Google and Facebook social login.',
    canonical: '/privacy-policy',
    keywords: ['BPA privacy policy', 'Bangladesh Pet Association data policy', 'social login privacy'],
  });
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <section className="bg-gray-50 border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Privacy Policy' }]} />
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-(--bpa-navy)">
            Privacy Policy
          </h1>
          <p className="mt-1 text-xl font-medium text-gray-400">প্রাইভেসি পলিসি</p>
          <p className="mt-3 text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

          <Section title="Introduction | ভূমিকা">
            <p>
              Bangladesh Pet Association (&quot;BPA&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to
              protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you visit{' '}
              <strong>https://bangladeshpetassociation.com</strong>, register for campaigns, apply for
              membership, make donations, or sign in using a social login provider such as Google or Facebook.
            </p>
            <p>
              By using our website or services, you agree to the collection and use of information in
              accordance with this policy. If you do not agree, please discontinue use of our services.
            </p>
          </Section>

          <Section title="Information We Collect | আমরা যে তথ্য সংগ্রহ করি">
            <p>We may collect the following categories of personal information:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>
                <strong>Identity &amp; contact data:</strong> Full name, email address, phone number, and
                postal address.
              </li>
              <li>
                <strong>Social login data:</strong> When you sign in with Google or Facebook, we receive
                your name, email address, profile photo, and the unique identifier assigned to your account
                by that provider. We do not receive your social media passwords.
              </li>
              <li>
                <strong>Pet information:</strong> Pet name, species, breed, age, vaccination history, and
                other details you submit through pet registration or campaign forms.
              </li>
              <li>
                <strong>Membership &amp; payment data:</strong> Membership tier, payment reference numbers,
                transaction details, and payment status. We do not store full card numbers or MFS PINs.
              </li>
              <li>
                <strong>Campaign registration data:</strong> Event selections, slot preferences, and
                participant details for vaccination drives and other BPA programmes.
              </li>
              <li>
                <strong>Communication logs:</strong> SMS and email notifications sent to you, including
                delivery status records.
              </li>
              <li>
                <strong>Technical &amp; analytics data:</strong> IP address, browser type, pages visited,
                session duration, referral source, and cookie identifiers collected via Google Analytics,
                Google Tag Manager, and/or Meta Pixel.
              </li>
            </ul>
          </Section>

          <Section title="Social Login — Google &amp; Facebook | সোশ্যাল লগইন">
            <p>
              Our website offers you the option to register or sign in using your existing Google or
              Facebook account. When you choose this option:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>
                We receive your name, email address, profile photo, and a unique account identifier from
                the login provider.
              </li>
              <li>
                This information is used solely to create and manage your BPA account and to identify you
                across sessions.
              </li>
              <li>
                We do not post to your social media profile, access your friends list, or collect any
                data beyond what you explicitly authorise during the sign-in flow.
              </li>
              <li>
                Your social login credentials and passwords are managed entirely by Google or Facebook.
                BPA has no access to them.
              </li>
              <li>
                You may disconnect your social login at any time by contacting us at{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-(--bpa-green) hover:underline">
                  {CONTACT_EMAIL}
                </a>{' '}
                or through your Google or Facebook account security settings.
              </li>
            </ul>
            <p className="mt-3">
              For Google&apos;s own privacy practices, see{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-(--bpa-green) hover:underline"
              >
                policies.google.com/privacy
              </a>
              . For Meta/Facebook&apos;s practices, see{' '}
              <a
                href="https://www.facebook.com/privacy/policy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-(--bpa-green) hover:underline"
              >
                facebook.com/privacy/policy
              </a>
              .
            </p>
          </Section>

          <Section title="How We Use Your Information | তথ্য ব্যবহারের উদ্দেশ্য">
            <p>We use collected information to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>Create and manage your BPA member account.</li>
              <li>Process campaign registrations, membership applications, and donation payments.</li>
              <li>Send confirmation emails, SMS notifications, and membership certificates.</li>
              <li>Generate QR-code verified certificates and Community Care Partner Cards.</li>
              <li>Provide customer support and respond to contact inquiries.</li>
              <li>Improve our website and services through analytics.</li>
              <li>
                Send programme updates, newsletters, and event announcements (you may opt out at any
                time).
              </li>
              <li>Comply with legal and accounting obligations.</li>
            </ul>
          </Section>

          <Section title="Cookies, Analytics &amp; Advertising | কুকি এবং বিশ্লেষণ">
            <p>We use the following tools to understand how visitors use our website:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>
                <strong>Google Analytics (GA4):</strong> Tracks page views, session behaviour, and
                traffic sources. Data is aggregated and anonymised where possible.
              </li>
              <li>
                <strong>Google Tag Manager (GTM):</strong> Manages analytics and marketing tags. GTM is
                our preferred method for deploying tracking scripts without code changes.
              </li>
              <li>
                <strong>Meta (Facebook) Pixel:</strong> May be used to measure the effectiveness of our
                Facebook campaigns and to present relevant advertisements on Facebook to users who have
                visited our website.
              </li>
              <li>
                <strong>Cookies:</strong> We use essential session cookies for authentication and
                functional cookies for user preferences. Analytics cookies are only active unless you opt
                out.
              </li>
            </ul>
            <p className="mt-3">
              You can control or disable cookies through your browser settings. Disabling essential
              cookies may affect the functionality of our website.
            </p>
          </Section>

          <Section title="Sharing of Information | তথ্য ভাগাভাগি">
            <p>
              We do not sell your personal information to third parties. We may share your information
              only in the following limited circumstances:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>
                <strong>Service providers:</strong> Payment gateways (EPS Bangladesh), SMS gateway
                providers, cloud storage providers, and email services engaged by BPA under contractual
                data protection obligations.
              </li>
              <li>
                <strong>Analytics platforms:</strong> Google and Meta receive usage data as described in
                the cookies section above.
              </li>
              <li>
                <strong>Legal requirements:</strong> If required by law, court order, or government
                authority in Bangladesh.
              </li>
              <li>
                <strong>Fraud prevention:</strong> To investigate or prevent fraud, abuse, or violations
                of our Terms of Service.
              </li>
            </ul>
          </Section>

          <Section title="Data Security | ডেটা সুরক্ষা">
            <p>
              We implement industry-standard security measures including encrypted connections (HTTPS/TLS),
              hashed passwords, AES-256 encryption for sensitive credential storage, and role-based access
              controls. However, no system is entirely impenetrable, and we cannot guarantee absolute
              security. We encourage you to use a strong, unique password and to report any suspected
              security vulnerabilities to us promptly.
            </p>
          </Section>

          <Section title="Data Retention | ডেটা ধারণ">
            <p>
              We retain your personal data for as long as your account is active or as required to
              provide our services. Transaction, payment, and donation records may be retained for up to
              7 years for accounting and legal compliance purposes. Following a verified account deletion
              request, personal identifiers will be removed or anonymised from active systems within 30
              days, subject to any mandatory legal retention requirements.
            </p>
          </Section>

          <Section title="Your Rights &amp; Data Deletion | আপনার অধিকার">
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate or incomplete data.</li>
              <li>Request deletion of your account and associated personal data.</li>
              <li>Withdraw consent to marketing communications at any time.</li>
              <li>Object to the processing of your data for analytics purposes.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please email us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-(--bpa-green) hover:underline font-medium">
                {CONTACT_EMAIL}
              </a>
              . Please include your registered email address, full name, and login method used (Google,
              Facebook, or email/password). See our{' '}
              <Link href="/data-deletion" className="text-(--bpa-green) hover:underline">
                Data Deletion Instructions
              </Link>{' '}
              page for full step-by-step guidance.
            </p>
          </Section>

          <Section title="Children and Minors | শিশু ব্যবহারকারী">
            <p>
              Our services are not directed to children under the age of 13. We do not knowingly collect
              personal information from children without verifiable parental consent. If you believe a
              child under 13 has submitted personal information to us, please contact us immediately at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-(--bpa-green) hover:underline">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>

          <Section title="Changes to This Policy | নীতির পরিবর্তন">
            <p>
              We may update this Privacy Policy from time to time. The revised version will be posted on
              this page with an updated &quot;Last updated&quot; date. Continued use of our services after changes
              constitutes acceptance of the updated policy. We encourage you to review this page
              periodically.
            </p>
          </Section>

          <Section title="Contact Us | যোগাযোগ করুন">
            <p>
              If you have questions, concerns, or requests regarding this Privacy Policy, please reach out:
            </p>
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
