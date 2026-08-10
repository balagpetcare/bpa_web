import Link from 'next/link';
import { FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import { Section, Container } from './Section';
import type { HomepageDocument } from '@/lib/api/public-homepage';

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const CATEGORY_LABELS: Record<string, string> = {
  GOVERNANCE: 'Governance',
  POLICY: 'Policy',
  FINANCIAL: 'Financial Report',
  LEGAL: 'Legal',
  OTHER: 'Publication',
};

interface Props {
  documents: HomepageDocument[];
}

export default function GovernanceTransparencySection({ documents }: Props) {
  return (
    <Section tone="white" aria-label="Governance & Transparency">
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <SectionHeader
              eyebrow="Accountability"
              title="Governance & Transparency"
              subtitle="Organizational information, governing documents, policies, and published reports — made public, no request required."
            />
            <Link
              href="/governance"
              className="mt-6 inline-flex items-center gap-2 rounded-lg border-2 border-(--bpa-green) px-5 py-3 text-sm font-semibold text-(--bpa-green) hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--bpa-navy) focus-visible:ring-offset-2"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              View Governance &amp; Documents
            </Link>
          </div>
          <div className="lg:col-span-7">
            {documents.length > 0 ? (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {documents.map((doc) => (
                  <li key={doc.id}>
                    <a
                      href={doc.url || '/governance'}
                      target={doc.url ? '_blank' : undefined}
                      rel={doc.url ? 'noopener noreferrer' : undefined}
                      className="group flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 transition-colors hover:border-(--bpa-green)/30 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--bpa-navy) focus-visible:ring-offset-2"
                    >
                      <FileText className="mt-0.5 h-5 w-5 shrink-0 text-(--bpa-green)" aria-hidden="true" />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-(--bpa-navy) line-clamp-2 group-hover:text-(--bpa-green)">
                          {doc.title}
                        </span>
                        <span className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                          <span className="uppercase tracking-wide">{CATEGORY_LABELS[doc.category] ?? doc.category}</span>
                          {doc.publishedAt && <span>· {formatDate(doc.publishedAt)}</span>}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex h-full min-h-[160px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                <Link
                  href="/governance"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-(--bpa-green)"
                >
                  View Governance &amp; Documents <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
