import LinkButton from '@/components/ui/LinkButton';
import { CheckCircle } from 'lucide-react';
import type { HomepageSection } from '@/types/bpa.types';

const VISION_POINTS = [
  'A Bangladesh where every pet lives in a safe, loving home',
  'Nationwide awareness on responsible breeding and adoption',
  'Legislation that protects animals from cruelty and neglect',
  'A thriving veterinary network accessible to all pet owners',
];

export default function VisionPreviewSection({ section }: { section?: HomepageSection | null }) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 bg-(--bpa-navy) p-10 text-white">
            <p className="text-(--bpa-green) text-xs font-semibold uppercase tracking-widest mb-4">{section?.eyebrow || 'Our Vision'}</p>
            <blockquote className="text-2xl font-bold leading-snug mb-8">
              &ldquo;{section?.body || 'A nation where compassion for animals is a cornerstone of society.'}&rdquo;
            </blockquote>
            <ul className="space-y-3">
              {VISION_POINTS.map((point) => (
                <li key={point} className="flex gap-3 items-start text-sm text-gray-300 leading-relaxed">
                  <CheckCircle size={16} className="text-(--bpa-green) shrink-0 mt-0.5" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-sm font-semibold uppercase tracking-widest text-(--bpa-green) mb-3">Long-Term Roadmap</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-(--bpa-navy) mb-6 leading-tight">
              {section?.title || 'Building a Better Future for Animals in Bangladesh'}
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-8">
              {section?.subtitle || 'Our long-term vision shapes every initiative, from grassroots community programs to national policy advocacy.'}
            </p>
            <LinkButton href={section?.ctaHref || '/vision'} variant="outline">
              {section?.ctaLabel || 'Explore Our Vision'}
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
