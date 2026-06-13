import SectionHeader from '@/components/ui/SectionHeader';
import Avatar from '@/components/ui/Avatar';
import LinkButton from '@/components/ui/LinkButton';
import type { CommitteeMember, HomepageSection } from '@/types/bpa.types';

interface CommitteePreviewSectionProps {
  members: CommitteeMember[];
  section?: HomepageSection | null;
}

export default function CommitteePreviewSection({ members, section }: CommitteePreviewSectionProps) {
  if (!members.length) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <SectionHeader eyebrow={section?.eyebrow || 'Leadership'} title={section?.title || 'Meet Our Committee'} subtitle={section?.subtitle ?? undefined} />
          <LinkButton href={section?.ctaHref || '/committee'} variant="outline" size="sm">{section?.ctaLabel || 'Full Committee'}</LinkButton>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {members.slice(0, 5).map((m) => (
            <div key={m.id} className="text-center group">
              <div className="flex justify-center mb-3">
                <Avatar src={m.photoUrl} name={m.name} size={80} className="ring-4 ring-white shadow-md group-hover:ring-(--bpa-green-light) transition-all" />
              </div>
              <h3 className="font-semibold text-(--bpa-navy) text-sm">{m.name}</h3>
              <p className="text-xs text-(--bpa-green) mt-0.5">{m.designation}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
