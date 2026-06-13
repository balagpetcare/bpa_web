import type { Metadata } from 'next';
import Breadcrumb from '@/components/ui/Breadcrumb';
import SectionHeader from '@/components/ui/SectionHeader';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import CommitteeGrid from '@/components/committee/CommitteeGrid';
import { getCommitteeMembers } from '@/lib/api/committee';
import { getSeoData } from '@/lib/api/seo';
import { buildMetadata, BASE_URL } from '@/lib/seo';
import { Users } from 'lucide-react';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData('/committee');
  return buildMetadata(
    {
      title: 'Committee',
      description:
        'Meet the dedicated leaders of the Bangladesh Pet Association — the committee members who drive our mission forward.',
      canonical: '/committee',
    },
    seo,
  );
}

export default async function CommitteePage() {
  let members: Awaited<ReturnType<typeof getCommitteeMembers>> = [];
  try {
    members = await getCommitteeMembers({
      next: { revalidate: 3600, tags: ['committee'] },
    } as RequestInit);
  } catch {
    // API unavailable — empty state shown below
  }

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Committee', url: '/committee' }]} />

      {/* Page header */}
      <section className="bg-gray-50 border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Committee' }]} />
          <h1 className="mt-4 text-4xl font-bold text-(--bpa-navy)">Our Committee</h1>
          <p className="mt-3 text-lg text-gray-500 max-w-2xl">
            The dedicated leaders who drive BPA&apos;s mission forward every day.
          </p>
        </div>
      </section>

      {/* About the committee */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <SectionHeader
                eyebrow="Leadership"
                title="Committed to Animal Welfare"
                subtitle="Our committee is composed of passionate volunteers, veterinary professionals, and community leaders united by a shared commitment to responsible pet ownership and animal welfare across Bangladesh."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-(--bpa-navy) rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-(--bpa-navy)">{members.length}</div>
                <div className="text-xs text-gray-500 mt-1">Active Members</div>
              </div>
              <div className="bg-(--bpa-navy) rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-white">
                  {new Set(members.map((m) => m.designation)).size}
                </div>
                <div className="text-xs text-gray-400 mt-1">Positions</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Committee grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {members.length === 0 ? (
            <div className="text-center py-20">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium text-lg">Committee information coming soon.</p>
            </div>
          ) : (
            <CommitteeGrid members={members} />
          )}
        </div>
      </section>
    </>
  );
}
