import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, ExternalLink, ShieldCheck } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import { getSeoData } from '@/lib/api/seo';
import { getPublicDocuments, type PublicDocument, type PublicDocumentCategory } from '@/lib/api/governance-documents';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData('/governance').catch(() => null);
  return buildMetadata(
    {
      title: 'Governance & Documents - Bangladesh Pet Association',
      description:
        'Organizational information, governing documents, policies, and published reports made publicly available by the Bangladesh Pet Association.',
      canonical: '/governance',
      keywords: ['BPA governance', 'BPA documents', 'BPA policies', 'BPA reports', 'transparency'],
    },
    seo,
  );
}

const CATEGORY_META: Record<PublicDocumentCategory, { label: string; description: string }> = {
  GOVERNANCE: {
    label: 'Organizational & Governing Documents',
    description: 'Registration information, constitution, and governance structure.',
  },
  POLICY: {
    label: 'Policies & Guidelines',
    description: 'Operating policies and guidelines that govern BPA programs.',
  },
  FINANCIAL: {
    label: 'Financial Reports',
    description: 'Published financial reports and statements.',
  },
  LEGAL: {
    label: 'Legal Documents',
    description: 'Legal notices and formally published documents.',
  },
  OTHER: {
    label: 'Publications & Reports',
    description: 'Other public reports and publications.',
  },
};

const CATEGORY_ORDER: PublicDocumentCategory[] = ['GOVERNANCE', 'POLICY', 'FINANCIAL', 'LEGAL', 'OTHER'];

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function groupByCategory(documents: PublicDocument[]): Partial<Record<PublicDocumentCategory, PublicDocument[]>> {
  const groups: Partial<Record<PublicDocumentCategory, PublicDocument[]>> = {};
  for (const doc of documents) {
    const list = groups[doc.category] ?? (groups[doc.category] = []);
    list.push(doc);
  }
  return groups;
}

export default async function GovernancePage() {
  const { items } = await getPublicDocuments({ limit: 50 }, { next: { revalidate: 60, tags: ['public-documents'] } } as RequestInit);
  const grouped = groupByCategory(items);

  return (
    <>
      <section className="border-b border-gray-100 bg-gray-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-4 flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-(--bpa-green)">Home</Link>
            <span>/</span>
            <span className="text-gray-600">Governance &amp; Documents</span>
          </nav>
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-(--bpa-green-light) px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-(--bpa-green)">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Public Information
            </div>
            <h1 className="text-4xl font-bold text-(--bpa-navy)">Governance &amp; Documents</h1>
            <p className="mt-3 text-lg leading-relaxed text-gray-500">
              Organizational information, governing documents, policies, and published reports made publicly
              available by the Bangladesh Pet Association.
            </p>
          </div>
        </div>
      </section>

      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <FileText size={48} className="mx-auto mb-4 opacity-40" aria-hidden="true" />
              <p className="font-semibold">No public documents are available yet.</p>
              <p className="mt-2 text-sm">BPA will publish governance and policy documents here as they become available.</p>
            </div>
          ) : (
            <div className="space-y-14">
              {CATEGORY_ORDER.filter((cat) => grouped[cat]?.length).map((category) => {
                const meta = CATEGORY_META[category];
                const docs = grouped[category]!;
                return (
                  <section key={category} aria-label={meta.label}>
                    <h2 className="text-2xl font-bold text-(--bpa-navy)">{meta.label}</h2>
                    <p className="mt-1.5 text-sm text-gray-500">{meta.description}</p>
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {docs.map((doc) => {
                        const publishedLabel = formatDate(doc.publishedAt);
                        return (
                          <article
                            key={doc.id}
                            className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                          >
                            <div className="flex items-start gap-3">
                              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-(--bpa-green)" aria-hidden="true" />
                              <h3 className="text-sm font-bold text-(--bpa-navy) leading-snug">{doc.title}</h3>
                            </div>
                            {doc.summary && (
                              <p className="mt-3 flex-1 text-sm leading-6 text-gray-500 line-clamp-3">{doc.summary}</p>
                            )}
                            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                              {doc.version && <span>Version {doc.version}</span>}
                              {publishedLabel && <span>Published {publishedLabel}</span>}
                            </div>
                            {doc.url && (
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-(--bpa-green) hover:underline"
                              >
                                View document <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                              </a>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
