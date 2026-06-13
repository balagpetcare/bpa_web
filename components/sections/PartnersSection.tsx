import SectionHeader from '@/components/ui/SectionHeader';
import type { HomepageSection, Partner } from '@/types/bpa.types';

const PARTNERS = [
  { id: 'ministry', name: 'Ministry of Fisheries and Livestock' },
  { id: 'bvc', name: 'Bangladesh Veterinary Council' },
  { id: 'bsmrau', name: 'BSMRAU Veterinary Faculty' },
  { id: 'wspa', name: 'WSPA Bangladesh' },
  { id: 'pdsa', name: 'PDSA International' },
  { id: 'shelters', name: 'Local Animal Shelters' },
];

export default function PartnersSection({ section, partners = [] }: { section?: HomepageSection | null; partners?: Partner[] }) {
  const items = partners.length ? partners : PARTNERS;

  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow={section?.eyebrow || 'Partners & Supporters'}
          title={section?.title || 'Trusted By Leading Organizations'}
          subtitle={section?.subtitle ?? undefined}
          centered
        />
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {items.map((p) => (
            <div
              key={p.id}
              className="flex min-h-24 items-center justify-center border border-gray-100 bg-gray-50 px-4 py-6 text-center"
            >
              <span className="text-xs font-medium text-gray-500 leading-tight">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
