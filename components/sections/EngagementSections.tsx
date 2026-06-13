import { Award, HandHeart, Users } from 'lucide-react';
import LinkButton from '@/components/ui/LinkButton';
import type { HomepageSection } from '@/types/bpa.types';

function getKey(section: HomepageSection) {
  return String(section.content?.key ?? '');
}

export function MembershipVolunteerSection({ membership, volunteer }: { membership?: HomepageSection | null; volunteer?: HomepageSection | null }) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="border border-gray-100 bg-gray-50 p-8">
            <Users className="text-(--bpa-green) mb-5" size={34} />
            <p className="text-sm font-semibold uppercase tracking-widest text-(--bpa-green) mb-2">{membership?.eyebrow || 'Membership'}</p>
            <h2 className="text-3xl font-bold text-(--bpa-navy) mb-4">{membership?.title || 'Join Bangladesh Pet Association'}</h2>
            <p className="text-gray-500 leading-relaxed mb-7">{membership?.subtitle || membership?.body || 'Become part of a national community advancing pet welfare, education, and responsible ownership.'}</p>
            <LinkButton href={membership?.ctaHref || '/membership'}>{membership?.ctaLabel || 'Become a Member'}</LinkButton>
          </div>
          <div className="border border-gray-100 bg-(--bpa-navy) p-8 text-white">
            <HandHeart className="text-(--bpa-green) mb-5" size={34} />
            <p className="text-sm font-semibold uppercase tracking-widest text-(--bpa-green) mb-2">{volunteer?.eyebrow || 'Volunteer'}</p>
            <h2 className="text-3xl font-bold mb-4">{volunteer?.title || 'Volunteer With BPA'}</h2>
            <p className="text-gray-300 leading-relaxed mb-7">{volunteer?.subtitle || volunteer?.body || 'Support campaigns, events, education, and community outreach programs across Bangladesh.'}</p>
            <LinkButton href={volunteer?.ctaHref || '/volunteer'} variant="white">{volunteer?.ctaLabel || 'Volunteer With Us'}</LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SuccessStoriesSection({ section }: { section?: HomepageSection | null }) {
  const stories = section?.items?.length ? section.items : [];
  if (!section && stories.length === 0) return null;

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-(--bpa-green) mb-2">{section?.eyebrow || 'Success Stories'}</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-(--bpa-green)">{section?.title || 'Community Outcomes That Matter'}</h2>
          {section?.subtitle && <p className="mt-4 text-gray-500">{section.subtitle}</p>}
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {(stories.length ? stories : [
            { id: 'campaign', title: 'Health campaigns expanded', body: 'Campaign teams connect pet owners with timely care and education.', subtitle: null },
            { id: 'community', title: 'A stronger pet community', body: 'Members, volunteers, and partners collaborate through BPA programs.', subtitle: null },
            { id: 'advocacy', title: 'Awareness with purpose', body: 'Public education helps improve welfare standards across Bangladesh.', subtitle: null },
          ]).slice(0, 3).map((story) => (
            <article key={story.id} className="bg-white border border-gray-100 p-6">
              <Award size={24} className="text-(--bpa-green) mb-4" />
              <h3 className="font-bold text-(--bpa-navy) mb-2">{story.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{story.body || story.subtitle}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function findCustomSection(sections: HomepageSection[], key: string) {
  return sections.find((section) => section.type === 'custom' && getKey(section) === key) ?? null;
}
