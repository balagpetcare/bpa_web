import LinkButton from '@/components/ui/LinkButton';

export default function HeroSection() {
  return (
    <section className="relative bg-(--bpa-green) overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
      </div>
      {/* Green accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-(--bpa-green)" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div className="max-w-3xl">
          <p className="text-(--bpa-green) text-sm font-semibold uppercase tracking-widest mb-4">
            Bangladesh Pet Association
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Caring for Pets,{' '}
            <span className="text-(--bpa-green)">Building a</span>
            {' '}Community
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed mb-10 max-w-2xl">
            Bangladesh&apos;s first dedicated association for responsible pet ownership, animal welfare, and building a compassionate community for all animals.
          </p>
          <div className="flex flex-wrap gap-4">
            <LinkButton href="/membership" size="lg">
              Join BPA Today
            </LinkButton>
            <LinkButton href="/about" variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              Learn More
            </LinkButton>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="relative h-16 overflow-hidden">
        <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 w-full" preserveAspectRatio="none">
          <path d="M0 64L1440 64L1440 0C1200 48 960 64 720 48C480 32 240 0 0 32L0 64Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
