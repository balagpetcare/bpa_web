import type { Metadata } from 'next';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { buildMetadata } from '@/lib/seo';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

const CONTACT_EMAIL = 'bangladeshpetassociation@gmail.com';

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: 'Data Deletion Instructions',
    description:
      'Request deletion of your Bangladesh Pet Association account and personal data, including social login data from Google and Facebook. Step-by-step instructions.',
    canonical: '/data-deletion',
    keywords: [
      'BPA data deletion',
      'delete BPA account',
      'remove social login data',
      'Facebook data deletion',
      'Google login data removal',
    ],
  });
}

const STEPS = [
  {
    step: '01',
    title: 'Compose an Email',
    desc: (
      <>
        Send an email to{' '}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-(--bpa-green) hover:underline font-medium"
        >
          {CONTACT_EMAIL}
        </a>{' '}
        with the subject line: <strong>Data Deletion Request — [Your Name]</strong>.
      </>
    ),
  },
  {
    step: '02',
    title: 'Include Required Information',
    desc: (
      <>
        In the body of your email, please include:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Your registered email address</li>
          <li>Your full name (as registered with BPA)</li>
          <li>Login method used: <strong>Google</strong>, <strong>Facebook</strong>, or <strong>Email/Password</strong></li>
          <li>Phone number (optional, to help us locate your account)</li>
          <li>Brief description of what you would like deleted (full account, specific data, etc.)</li>
        </ul>
      </>
    ),
  },
  {
    step: '03',
    title: 'Identity Verification',
    desc: 'BPA will verify your identity by cross-referencing the provided information with our records. We may send a confirmation email to your registered address to verify ownership of the account before processing.',
  },
  {
    step: '04',
    title: 'Data Deletion or Anonymisation',
    desc: 'Once verified, we will delete or anonymise your personal data — including your name, email, phone number, profile photo, social login identifier, and pet information — from our active systems within 30 days of receiving your verified request.',
  },
  {
    step: '05',
    title: 'Confirmation',
    desc: 'You will receive a confirmation email once the deletion has been completed or when the process has been initiated. If your account cannot be fully deleted for legal or compliance reasons, we will inform you of the specific data retained and the reason.',
  },
];

export default function DataDeletionPage() {
  return (
    <>
      <section className="bg-gray-50 border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Data Deletion Instructions' }]} />
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-(--bpa-navy)">
            Data Deletion Instructions
          </h1>
          <p className="mt-1 text-xl font-medium text-gray-400">ডাটা ডিলিশন নির্দেশনা</p>
          <p className="mt-3 text-sm text-gray-500 max-w-2xl">
            You have the right to request deletion of your personal data from Bangladesh Pet Association
            at any time. This page explains how.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          {/* CTA card */}
          <div className="bg-(--bpa-navy) rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-(--bpa-green)/20 shrink-0">
              <Mail size={28} className="text-(--bpa-green)" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-lg">Ready to submit your request?</p>
              <p className="text-gray-300 text-sm mt-1">
                Email us directly — include your name, registered email, and login method.
              </p>
            </div>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Data Deletion Request&body=Full Name:%0ARegistered Email:%0ALogin Method (Google / Facebook / Email):%0APhone (optional):%0ARequest Details:`}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-(--bpa-green) px-6 py-3 text-sm font-bold text-white hover:opacity-90 transition-all"
            >
              <Mail size={16} />
              Send Deletion Request
            </a>
          </div>

          {/* Overview */}
          <div className="border-l-4 border-(--bpa-green) pl-6">
            <h2 className="text-xl font-bold text-(--bpa-navy) mb-4">
              What Data Can Be Deleted | কোন তথ্য মুছে ফেলা যাবে
            </h2>
            <div className="text-gray-600 leading-relaxed space-y-3">
              <p>Upon a verified deletion request, BPA will remove or anonymise the following data:</p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Your full name, email address, and phone number</li>
                <li>Profile photo</li>
                <li>Social login identifier (Google Account ID or Facebook User ID)</li>
                <li>Pet registration information</li>
                <li>Campaign registration records (personal details)</li>
                <li>Membership profile data</li>
                <li>Notification and communication preferences</li>
              </ul>
            </div>
          </div>

          {/* What is retained */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-amber-800 mb-2">
                  Data That May Be Retained | যে তথ্য রাখা হতে পারে
                </h3>
                <p className="text-sm text-amber-700 leading-relaxed">
                  Certain records may be retained even after a deletion request if required by law,
                  accounting regulations, or fraud prevention obligations. This includes:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-amber-700">
                  <li>Payment and donation transaction records (typically 7 years for accounting)</li>
                  <li>Tax and financial compliance records</li>
                  <li>Records necessary to investigate fraud, abuse, or legal disputes</li>
                  <li>Anonymised/aggregated analytics data that cannot identify you</li>
                </ul>
                <p className="mt-3 text-sm text-amber-700">
                  When retention is necessary, we will inform you of what is kept and why.
                </p>
              </div>
            </div>
          </div>

          {/* Step by step */}
          <div>
            <h2 className="text-xl font-bold text-(--bpa-navy) mb-8">
              Step-by-Step Instructions | ধাপে ধাপে নির্দেশনা
            </h2>
            <div className="space-y-6">
              {STEPS.map((s) => (
                <div key={s.step} className="flex gap-5">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-10 h-10 rounded-full bg-(--bpa-navy) text-white text-sm font-bold flex items-center justify-center">
                      {s.step}
                    </div>
                    <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
                  </div>
                  <div className="pb-6 min-w-0">
                    <h3 className="font-bold text-(--bpa-navy) mb-2">{s.title}</h3>
                    <div className="text-sm text-gray-600 leading-relaxed">{s.desc}</div>
                  </div>
                </div>
              ))}
              {/* Final check */}
              <div className="flex gap-5">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-10 h-10 rounded-full bg-(--bpa-green) text-white flex items-center justify-center">
                    <CheckCircle size={20} />
                  </div>
                </div>
                <div className="pb-6 min-w-0">
                  <h3 className="font-bold text-(--bpa-navy) mb-2">Done</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Your request has been submitted. Expect a response within 7 business days.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Social login specific */}
          <div className="border-l-4 border-(--bpa-green) pl-6">
            <h2 className="text-xl font-bold text-(--bpa-navy) mb-4">
              Deleting Social Login Data | সোশ্যাল লগইন ডেটা মুছে ফেলা
            </h2>
            <div className="text-gray-600 leading-relaxed space-y-3">
              <p>
                If you signed up or logged in using <strong>Google</strong> or{' '}
                <strong>Facebook</strong>, BPA stores your name, email, profile photo, and the unique
                account identifier provided by the login service. All of this data will be deleted or
                anonymised upon a verified deletion request.
              </p>
              <p>
                In addition, you may wish to revoke BPA&apos;s app permissions directly from your Google or
                Facebook account settings:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>
                  <strong>Google:</strong>{' '}
                  <a
                    href="https://myaccount.google.com/permissions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-(--bpa-green) hover:underline"
                  >
                    myaccount.google.com/permissions
                  </a>{' '}
                  — find &quot;Bangladesh Pet Association&quot; and remove access.
                </li>
                <li>
                  <strong>Facebook:</strong>{' '}
                  <a
                    href="https://www.facebook.com/settings?tab=applications"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-(--bpa-green) hover:underline"
                  >
                    Facebook Settings → Apps and Websites
                  </a>{' '}
                  — find &quot;Bangladesh Pet Association&quot; and remove access.
                </li>
              </ul>
              <p>
                Revoking app permissions from Google or Facebook will prevent future logins via that
                provider but will not automatically delete your BPA account data. Please also send us an
                email to complete the data deletion.
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="border-l-4 border-(--bpa-green) pl-6">
            <h2 className="text-xl font-bold text-(--bpa-navy) mb-4">
              Processing Timeline | প্রক্রিয়াকরণের সময়সীমা
            </h2>
            <div className="text-gray-600 leading-relaxed space-y-3">
              <p>
                We aim to acknowledge all data deletion requests within <strong>7 business days</strong>{' '}
                and complete verified deletions within <strong>30 days</strong>. If additional time is
                needed due to complexity or legal review, we will notify you with an updated timeline.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="border-l-4 border-(--bpa-green) pl-6">
            <h2 className="text-xl font-bold text-(--bpa-navy) mb-4">
              Contact Us | যোগাযোগ করুন
            </h2>
            <div className="text-gray-600 leading-relaxed space-y-3">
              <p>For data deletion requests or privacy questions, please contact us:</p>
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
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
