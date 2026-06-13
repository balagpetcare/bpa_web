import LinkButton from '@/components/ui/LinkButton';
import { Target, Heart, Users, Shield } from 'lucide-react';
import type { HomepageSection } from '@/types/bpa.types';

const PILLARS = [
  { icon: Heart, title: 'Animal Welfare', desc: 'Promoting humane treatment and care for all pets and animals.' },
  { icon: Target, title: 'Education', desc: 'Empowering owners with knowledge for responsible pet ownership.' },
  { icon: Users, title: 'Community', desc: 'Building a supportive network of pet lovers across Bangladesh.' },
  { icon: Shield, title: 'Advocacy', desc: 'Championing laws that protect animals and their rights.' },
];

export default function MissionPreviewSection({ section }: { section?: HomepageSection | null }) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-(--bpa-green) mb-3">{section?.eyebrow || 'Our Mission'}</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-(--bpa-navy) mb-6 leading-tight">
              {section?.title || 'Promoting Responsible Pet Ownership Across Bangladesh'}
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-8">
              {section?.subtitle || section?.body || 'The Bangladesh Pet Association is dedicated to fostering compassion, responsibility, and respect for all animals through education, campaigns, and community programs.'}
            </p>
            <LinkButton href={section?.ctaHref || '/mission'} variant="outline">
              {section?.ctaLabel || 'Read Our Mission'}
            </LinkButton>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {PILLARS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-(--bpa-green-light) border border-green-100 p-6">
                <div className="w-10 h-10 bg-(--bpa-green) flex items-center justify-center mb-4">
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="font-semibold text-(--bpa-navy) mb-1">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
