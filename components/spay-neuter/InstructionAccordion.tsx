import type { ReactNode } from 'react';

interface InstructionAccordionProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  /** Opens by default on every screen size — use for the one or two most safety-critical items so they stay discoverable on desktop without extra clicks. */
  defaultOpen?: boolean;
}

/**
 * Native <details>/<summary> — keyboard-accessible and screen-reader
 * friendly with zero JavaScript (no client component needed). Acts as a
 * true accordion on small screens; `defaultOpen` keeps the most
 * safety-critical sections (eligibility, fasting) visibly expanded on
 * first render everywhere, per the "don't hide everything on desktop"
 * requirement.
 */
export default function InstructionAccordion({ title, icon, children, defaultOpen = false }: InstructionAccordionProps) {
  return (
    <details open={defaultOpen} className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
      <summary className="flex items-center justify-between gap-3 p-4 cursor-pointer list-none font-semibold text-sm text-(--bpa-navy) hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--bpa-green) focus-visible:ring-inset">
        <span className="flex items-center gap-2">
          {icon}
          {title}
        </span>
        <svg
          className="shrink-0 text-gray-400 transition-transform group-open:rotate-180"
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed whitespace-pre-line border-t border-gray-100 pt-3">
        {children}
      </div>
    </details>
  );
}
