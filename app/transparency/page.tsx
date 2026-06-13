import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink, FileText } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import { getSeoData } from '@/lib/api/seo';
import { getPublicTransparencyReports, getTransparencySummary } from '@/lib/api/community-care';
import type { TransparencyReportPublic } from '@/types/bpa.types';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData('/transparency').catch(() => null);
  return buildMetadata(
    {
      title: 'Transparency Reports - BPA Community Care Fund',
      description:
        'BPA publishes Community Care Fund progress and transparency reports for Care Partner contributions, published spending, and zone progress.',
      canonical: '/transparency',
      keywords: ['transparency', 'fund report', 'BPA', 'community pet care', 'care partner contribution'],
    },
    seo,
  );
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function money(value: string | number) {
  return `৳${Number(value).toLocaleString('en-BD', { maximumFractionDigits: 0 })}`;
}

const REPORT_TYPE_LABELS: Record<string, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annual: 'Annual',
  special: 'Special',
};

export default async function TransparencyPage() {
  const [reportsResult, summaryResult] = await Promise.allSettled([
    getPublicTransparencyReports({ next: { revalidate: 300, tags: ['transparency-reports'] } } as RequestInit),
    getTransparencySummary({ next: { revalidate: 300, tags: ['transparency-summary'] } } as RequestInit),
  ]);

  const reportList: TransparencyReportPublic[] =
    reportsResult.status === 'fulfilled' ? reportsResult.value : [];
  const summary = summaryResult.status === 'fulfilled' ? summaryResult.value : null;

  return (
    <>
      <section className="bg-gray-50 border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-400 mb-4 flex gap-2 items-center">
            <Link href="/" className="hover:text-(--bpa-green)">Home</Link>
            <span>/</span>
            <span className="text-gray-600">Transparency</span>
          </nav>
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold text-(--bpa-navy)">Community Care Fund Transparency</h1>
            <p className="mt-3 text-lg text-gray-500 leading-relaxed">
              BPA publishes fund progress and reports to maintain transparency for Community Care Fund
              contributors. Care Partner contributions are recognition and community support contributions,
              not investment, shares, equity, profit-sharing, or financial return.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/community-pet-care/contribute" className="rounded-lg bg-(--bpa-green) px-5 py-3 text-sm font-semibold text-white">
              Contribute as Care Partner
            </Link>
            <Link href="/pet-census-2026" className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-(--bpa-navy)">
              Join Pet Census 2026
            </Link>
          </div>
        </div>
      </section>

      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {summary && (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Collected Care Partner Contributions', value: money(summary.totalCollectedBdt), note: 'Paid contributions with successful payments' },
                  { label: 'Contributors', value: summary.totalContributors.toLocaleString('en-BD'), note: 'Paid Care Partner records' },
                  { label: 'Published Report Spending', value: money(summary.totalPublishedSpentBdt), note: 'Manual spending reported by BPA' },
                  { label: 'Published Report Balance', value: money(summary.balanceBdt), note: 'Collected minus published report spending' },
                ].map(({ label, value, note }) => (
                  <div key={label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">{label}</p>
                    <p className="text-2xl font-bold text-(--bpa-navy)">{value}</p>
                    <p className="text-xs text-gray-500 mt-2">{note}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm mb-12">
                <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-(--bpa-navy)">Zone Progress</h2>
                    <p className="text-sm text-gray-500 mt-1">Progress is based on paid Care Partner contributors by zone.</p>
                  </div>
                  <Link href="/community-pet-care/zones" className="text-sm font-semibold text-(--bpa-green) hover:underline">
                    View all zones
                  </Link>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {summary.zones.map((zone) => (
                    <div key={zone.id} className="rounded-lg bg-gray-50 p-4">
                      <div className="flex justify-between gap-3 mb-2">
                        <div>
                          <p className="font-semibold text-(--bpa-navy)">{zone.name}</p>
                          <p className="text-xs text-gray-500">{zone.currentContributors.toLocaleString('en-BD')} of {zone.targetContributors.toLocaleString('en-BD')} contributors</p>
                        </div>
                        <p className="text-sm font-bold text-(--bpa-green)">{zone.progressPercent}%</p>
                      </div>
                      <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                        <div className="h-full bg-(--bpa-green)" style={{ width: `${zone.progressPercent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-(--bpa-navy)">Published Reports</h2>
            <p className="text-sm text-gray-500 mt-2">
              Report totals are published report figures from BPA, not automated clinic, shop, payroll, or profit accounting.
            </p>
          </div>

          {reportList.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <FileText size={48} className="mx-auto mb-4 opacity-40" />
              <p className="font-semibold">No reports published yet.</p>
              <p className="text-sm mt-2">BPA will publish reports as Community Care Fund reporting is prepared.</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-5">
              {reportList.map((r) => (
                <article key={r.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full mr-2">
                        {REPORT_TYPE_LABELS[r.reportType] ?? r.reportType}
                      </span>
                      <span className="text-xs text-gray-400">
                        {fmtDate(r.periodStart)} - {fmtDate(r.periodEnd)}
                      </span>
                      <h3 className="text-lg font-bold text-(--bpa-navy) mt-2">
                        <Link href={`/transparency/${r.slug}`} className="hover:text-(--bpa-green)">
                          {r.title}
                        </Link>
                      </h3>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">Report Balance</p>
                      <p className="text-2xl font-bold text-(--bpa-green)">{money(r.balanceBdt)}</p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm mb-4">
                    <div className="flex justify-between bg-green-50 rounded-lg p-3">
                      <span className="text-gray-500">Reported Collected</span>
                      <span className="font-bold text-green-700">{money(r.totalCollectedBdt)}</span>
                    </div>
                    <div className="flex justify-between bg-red-50 rounded-lg p-3">
                      <span className="text-gray-500">Reported Spent</span>
                      <span className="font-bold text-red-700">{money(r.totalSpentBdt)}</span>
                    </div>
                  </div>
                  {r.summaryMd && (
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4">{r.summaryMd}</p>
                  )}
                  <div className="flex flex-wrap gap-4 items-center">
                    <Link href={`/transparency/${r.slug}`} className="text-sm text-(--bpa-green) hover:underline font-medium">
                      Read report
                    </Link>
                    {r.attachmentUrl && (
                      <a
                        href={r.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-(--bpa-green) hover:underline font-medium"
                      >
                        <ExternalLink size={14} /> Download file
                      </a>
                    )}
                  </div>
                  {r.publishedAt && (
                    <p className="text-xs text-gray-400 mt-3">Published {fmtDate(r.publishedAt)}</p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
