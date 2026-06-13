import LinkButton from '@/components/ui/LinkButton';
import type { HomepageSection } from '@/types/bpa.types';

export default function CtaSection({ section }: { section?: HomepageSection | null }) {
  return (
    <section className="bg-(--bpa-green) py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          {section?.title || 'Ready to Make a Difference?'}
        </h2>
        <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto leading-relaxed">
          {section?.subtitle || section?.body || 'Join thousands of pet lovers across Bangladesh. Together we can create a kinder, more compassionate society for all animals.'}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <LinkButton href={section?.ctaHref || '/membership'} variant="white" size="lg">
            {section?.ctaLabel || 'Become a Member'}
          </LinkButton>
          <LinkButton href="/volunteer" size="lg" className="border-2 border-white text-white hover:bg-white/10 bg-transparent">
            Volunteer With Us
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
