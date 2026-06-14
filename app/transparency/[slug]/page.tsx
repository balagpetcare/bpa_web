import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import { getTransparencyReportBySlug } from '@/lib/api/community-care';

export const revalidate = 300;

interface TransparencyReportPageProps {
  params: Promise<{ slug: string }>;
}

function money(value: string | number | null | undefined) {
  return `৳${Number(value ?? 0).toLocaleString('en-BD', { maximumFractionDigits: 0 })}`;
}

function fmtDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export async function generateMetadata({ params }: TransparencyReportPageProps): Promise<Metadata> {
  const { slug } = await params;
  const report = await getTransparencyReportBySlug(slug, { next: { revalidate: 300 } } as RequestInit).catch(() => null);
  if (!report) return buildMetadata({ title: 'Transparency Report - BPA', canonical: `/transparency/${slug}` });

  return buildMetadata({
    title: `${report.title} - BPA Transparency Report`,
    description: report.summaryMd ?? 'BPA Community Care Fund transparency report.',
    canonical: `/transparency/${report.slug}`,
    publishedTime: report.publishedAt ?? undefined,
  });
}

export default async function TransparencyReportPage({ params }: TransparencyReportPageProps) {
  const { slug } = await params;
  const report = await getTransparencyReportBySlug(slug, { next: { revalidate: 300, tags: ['transparency-reports'] } } as RequestInit).catch(() => null);
  if (!report) notFound();

  return (
    <>
      <section className="bg-gray-50 border-b border-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-400 mb-4 flex gap-2 items-center">
            <Link href="/" className="hover:text-(--bpa-green)">Home</Link>
            <span>/</span>
            <Link href="/transparency" className="hover:text-(--bpa-green)">Transparency</Link>
            <span>/</span>
            <span className="text-gray-600">{report.title}</span>
          </nav>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
              {report.reportType}
            </span>
            <span className="text-xs font-semibold bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
              Published report
            </span>
          </div>
          <h1 className="text-4xl font-bold text-(--bpa-navy)">{report.title}</h1>
          <p className="mt-3 text-gray-500">
            Period: {fmtDate(report.periodStart)} - {fmtDate(report.periodEnd)}
            {report.publishedAt ? ` · Published ${fmtDate(report.publishedAt)}` : ''}
          </p>
        </div>
      </section>

      <main className="py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Reported Collected', value: money(report.totalCollectedBdt) },
              { label: 'Reported Spent', value: money(report.totalSpentBdt) },
              { label: 'Report Balance', value: money(report.balanceBdt) },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">{label}</p>
                <p className="text-2xl font-bold text-(--bpa-navy)">{value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-amber-100 bg-amber-50 p-5 text-sm text-amber-900 leading-relaxed mb-8">
            These figures are BPA published report figures for Community Care Fund transparency. They are not
            investment, share, profit distribution, clinic accounting, shop inventory accounting, payroll, or
            Pet Smart Solution operational accounting.
          </div>

          {report.summaryMd && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-(--bpa-navy) mb-3">Summary</h2>
              <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">{report.summaryMd}</div>
            </section>
          )}

          {report.bodyMd && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-(--bpa-navy) mb-3">Details</h2>
              <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">{report.bodyMd}</div>
            </section>
          )}

          {report.attachmentUrl && (
            <a
              href={report.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-(--bpa-green) px-5 py-3 text-sm font-semibold text-white"
            >
              <ExternalLink size={16} /> Download Report File
            </a>
          )}
        </div>
      </main>
    </>
  );
}
