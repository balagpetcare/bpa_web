import type { ReactNode } from 'react';

// Shared layout primitives for the homepage rebuild below the hero slider.
// Every homepage section below uses these three building blocks so spacing,
// max-width, and the 12-column grid stay consistent without each section
// re-deriving its own container math.

export type SectionTone = 'white' | 'muted' | 'navy' | 'green-tint' | 'gradient-soft' | 'gradient-navy';

const TONE_CLASSES: Record<SectionTone, string> = {
  white: 'bg-white',
  muted: 'bg-gray-50',
  navy: 'bg-(--bpa-navy) text-white',
  'green-tint': 'bg-(--bpa-green-light)',
  'gradient-soft': 'bg-[linear-gradient(180deg,#f7fbf8_0%,#ffffff_100%)]',
  'gradient-navy': 'bg-[linear-gradient(135deg,#1a2540_0%,#123d28_100%)] text-white',
};

interface SectionProps {
  id?: string;
  tone?: SectionTone;
  className?: string;
  children: ReactNode;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/** Full-bleed section band — background/tone only. Compose with `Container`. */
export function Section({ id, tone = 'white', className = '', children, ...rest }: SectionProps) {
  return (
    <section id={id} className={`py-16 sm:py-20 lg:py-24 ${TONE_CLASSES[tone]} ${className}`} {...rest}>
      {children}
    </section>
  );
}

/** Centered max-width design-system container (matches the site's existing 7xl content width). */
export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

/** 12-column desktop grid; single column on mobile/tablet. */
export function Grid12({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10 ${className}`}>{children}</div>;
}
