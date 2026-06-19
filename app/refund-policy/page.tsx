import type { Metadata } from 'next';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { buildMetadata } from '@/lib/seo';

const LAST_UPDATED = 'June 2025';
const CONTACT_EMAIL = 'bangladeshpetassociation@gmail.com';

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: 'Refund Policy',
    description:
      'Bangladesh Pet Association refund policy covering membership fees, campaign registration, donations, failed or duplicate payments, and manual MFS payment verification.',
    canonical: '/refund-policy',
    keywords: ['BPA refund policy', 'Bangladesh Pet Association refund', 'membership refund', 'donation refund'],
  });
}

export default function RefundPolicyPage() {
  return (
    <>
      <section className="bg-gray-50 border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Refund Policy' }]} />
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-(--bpa-navy)">
            Refund Policy
          </h1>
          <p className="mt-1 text-xl font-medium text-gray-400">রিফান্ড নীতি</p>
          <p className="mt-3 text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

          <Section title="Overview | সংক্ষিপ্ত বিবরণ">
            <p>
              Bangladesh Pet Association (&quot;BPA&quot;) is committed to fair and transparent handling of
              payments. This Refund Policy explains the conditions under which refunds may be issued for
              membership fees, campaign registration fees, donations, and payments made through our
              online gateway or manual mobile financial services (MFS) channels.
            </p>
            <p>
              Please read this policy carefully before making any payment. By submitting a payment, you
              confirm that you have read and agree to this Refund Policy.
            </p>
          </Section>

          <Section title="Membership Payment Refunds | সদস্যপদ পেমেন্ট রিফান্ড">
            <p>
              Membership fees cover administrative costs, membership card issuance, certificate
              generation, and access to BPA services for the membership period.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>
                <strong>Application pending:</strong> If your membership application has been submitted
                and payment made, but the application has not yet been approved, you may request a full
                refund within <strong>7 days</strong> of payment.
              </li>
              <li>
                <strong>Application approved:</strong> Once your membership is approved and your membership
                card or certificate has been issued, the fee is generally non-refundable.
              </li>
              <li>
                <strong>Application rejected by BPA:</strong> If BPA rejects your membership application
                for any reason, a full refund of the membership fee will be issued within 10–14 business
                days.
              </li>
              <li>
                <strong>Duplicate payment:</strong> If you were charged more than once for the same
                membership application, the duplicate charge(s) will be refunded in full.
              </li>
              <li>
                <strong>Membership cancellation by member:</strong> Memberships cancelled by the member
                after approval are not eligible for a pro-rated or partial refund of any remaining period.
              </li>
            </ul>
          </Section>

          <Section title="Campaign &amp; Vaccination Fee Refunds | ক্যাম্পেইন ফি রিফান্ড">
            <p>
              Some BPA campaigns and vaccination drives charge a registration or facilitation fee to
              cover veterinary and logistics costs.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>
                <strong>Cancellation by participant (before the event):</strong> Refund requests
                submitted more than <strong>72 hours before</strong> the scheduled campaign date may be
                eligible for a full or partial refund at BPA&apos;s discretion, depending on costs already
                incurred.
              </li>
              <li>
                <strong>Cancellation within 72 hours:</strong> No refund will be issued for cancellations
                received less than 72 hours before the campaign slot.
              </li>
              <li>
                <strong>Campaign cancelled by BPA:</strong> If BPA cancels or reschedules a campaign
                event, registered participants will receive a full refund or the option to transfer their
                registration to the rescheduled date.
              </li>
              <li>
                <strong>No-show:</strong> Participants who do not attend their registered campaign slot
                without prior notice are not entitled to a refund.
              </li>
            </ul>
          </Section>

          <Section title="Donation Refunds | দান রিফান্ড">
            <p>
              Donations made to BPA are voluntary contributions to animal welfare activities and are
              generally non-refundable once processed.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>
                <strong>Technical error or accidental donation:</strong> If a donation was made due to a
                technical error on our platform or was clearly accidental (e.g., wrong amount entered),
                you may request a refund within <strong>48 hours</strong> by emailing{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-(--bpa-green) hover:underline">
                  {CONTACT_EMAIL}
                </a>{' '}
                with your transaction reference number.
              </li>
              <li>
                <strong>Duplicate donation:</strong> If you were charged twice for a single intended
                donation, the duplicate amount will be refunded in full.
              </li>
              <li>
                <strong>General donations:</strong> Intentional donations to BPA&apos;s general fund or a
                specific campaign purpose are non-refundable once the payment has been confirmed and funds
                are applied.
              </li>
            </ul>
          </Section>

          <Section title="Failed &amp; Duplicate Payments | ব্যর্থ এবং দ্বৈত পেমেন্ট">
            <p>
              Occasionally, payments may fail during processing or appear to be charged without a
              successful transaction record on our side.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>
                <strong>Failed payment, money deducted:</strong> If your bank or MFS account was debited
                but BPA did not receive a successful payment confirmation, the amount will typically be
                automatically reversed by your bank or payment provider within 3–7 business days.
              </li>
              <li>
                <strong>Duplicate charge from gateway:</strong> If EPS Bangladesh or another payment
                gateway charged you more than once for a single transaction, please contact us immediately
                with the transaction reference(s). We will coordinate with the gateway for a refund.
              </li>
              <li>
                If you do not see an automatic reversal within 7 business days, please email us at{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-(--bpa-green) hover:underline">
                  {CONTACT_EMAIL}
                </a>{' '}
                with the transaction reference, date, amount, and payment method used.
              </li>
            </ul>
          </Section>

          <Section title="Manual MFS Payment Verification | ম্যানুয়াল MFS পেমেন্ট যাচাইকরণ">
            <p>
              BPA accepts manual payments via mobile financial services including bKash, Nagad, and
              Rocket. For manual MFS payments:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>
                After completing a manual MFS transfer, you must submit your payment details (MFS
                number, transaction ID, and amount) through the payment confirmation form or by emailing{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-(--bpa-green) hover:underline">
                  {CONTACT_EMAIL}
                </a>
                .
              </li>
              <li>
                BPA will verify the transaction against our MFS account records. Verification typically
                takes <strong>1–3 business days</strong>.
              </li>
              <li>
                If verification fails (incorrect amount, wrong account, or unidentifiable transaction),
                BPA will contact you for clarification. If the issue cannot be resolved, a refund
                process will be initiated as appropriate.
              </li>
              <li>
                <strong>Admin approval:</strong> Membership or campaign confirmation is only activated
                after admin approval of the verified MFS payment. BPA reserves the right to reject
                payments that cannot be verified.
              </li>
            </ul>
          </Section>

          <Section title="Refund Request Process | রিফান্ড অনুরোধের প্রক্রিয়া">
            <p>To request a refund, please follow these steps:</p>
            <ol className="list-decimal pl-5 mt-2 space-y-2">
              <li>
                Email{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-(--bpa-green) hover:underline font-medium">
                  {CONTACT_EMAIL}
                </a>{' '}
                with the subject: <strong>Refund Request — [Your Name]</strong>.
              </li>
              <li>
                Include your registered name, email address, transaction/reference number, payment
                amount, date of payment, and the reason for the refund request.
              </li>
              <li>
                Attach any supporting documents (e.g., bank statement screenshot, gateway receipt, MFS
                transaction confirmation).
              </li>
              <li>
                Our team will review your request and respond within <strong>7 business days</strong>.
              </li>
              <li>
                If approved, the refund will be processed via the original payment method (online
                gateway or MFS reversal) or through an alternative agreed method if the original channel
                is unavailable.
              </li>
            </ol>
          </Section>

          <Section title="Processing Time | প্রক্রিয়াকরণের সময়">
            <p>
              Approved refunds are typically processed within <strong>10–14 business days</strong> from
              the date of approval. The time for the refund to appear in your account depends on your
              bank or mobile financial service provider. BPA is not responsible for additional delays
              caused by third-party payment processors.
            </p>
          </Section>

          <Section title="Non-Refundable Items | রিফান্ড অযোগ্য আইটেম">
            <p>The following are not eligible for a refund under any circumstances:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>Membership fees after a membership card or certificate has been issued and activated</li>
              <li>Campaign registration fees for slots already attended</li>
              <li>Intentional donations to BPA&apos;s general or campaign fund once confirmed</li>
              <li>
                Processing or convenience fees charged by third-party payment gateways (EPS Bangladesh,
                bKash, Nagad, etc.)
              </li>
            </ul>
          </Section>

          <Section title="Contact Us | যোগাযোগ করুন">
            <p>
              For all refund-related queries, please contact our support team:
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
              <p className="mt-2 text-gray-500 text-xs">
                Please allow up to 7 business days for a response to refund requests.
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
