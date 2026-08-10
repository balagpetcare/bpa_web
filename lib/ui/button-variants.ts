// Shared visual contract for every BPA button-styled control — the real
// <button> in components/ui/Button.tsx AND the link-styled button in
// components/ui/LinkButton.tsx both build their className from this single
// source, so the two can never drift out of sync the way they previously
// did (outline/ghost's hover state, and LinkButton's primary hover
// referencing an undefined --bpa-green-dark custom property instead of the
// real --color-bpa-green-dark theme token).
//
// Root bug this fixes: the old outline/ghost variants set
// `hover:bg-(--color-bpa-green)` with NO matching `hover:text-*` — the
// label's text color never changed, so on hover the (unchanged) green text
// sat on a now-solid green background and effectively disappeared. Every
// variant below keeps foreground and background moving together at every
// state, and disabled uses solid muted colors (never a translucent fade
// via opacity, which silently drops contrast against the page background).

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'white';
export type ButtonSize = 'sm' | 'md' | 'lg';

export const BUTTON_BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
  'disabled:cursor-not-allowed active:scale-[0.97]';

export const BUTTON_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  // Confirmed/primary action: green bg by default, switching to the
  // canonical BPA blue on hover/active — text stays white at every
  // interactive state, so it can never vanish into the background. (Root
  // cause this fixes: pages that hand-rolled this same green-CTA look
  // referenced a bare, never-defined "green dark" custom property instead
  // of its namespaced theme-token counterpart — an unresolvable var()
  // computes to its property's initial value, so the hover background
  // silently became transparent while the unconditional white text stayed,
  // producing invisible white-on-white buttons on hover.) Disabled uses a
  // solid muted gray, not a faded green.
  primary:
    'bg-(--color-bpa-green) text-white border border-transparent ' +
    'hover:bg-(--color-bpa-button-hover) hover:border-(--color-bpa-button-hover) ' +
    'active:bg-(--color-bpa-button-hover) active:border-(--color-bpa-button-hover) ' +
    'focus-visible:ring-(--bpa-navy) ' +
    'disabled:bg-gray-200 disabled:text-gray-500 disabled:border-transparent disabled:hover:bg-gray-200 disabled:hover:border-transparent',
  // Secondary/outline: green text + green border on a transparent surface.
  // Hover moves to the accent-yellow surface with DARK green text/border —
  // never the base green text on a green hover background.
  outline:
    'border-2 border-(--color-bpa-green) text-(--color-bpa-green) bg-transparent ' +
    'hover:bg-(--color-bpa-accent) hover:border-(--color-bpa-green-dark) hover:text-(--color-bpa-green-dark) ' +
    'active:bg-(--color-bpa-accent-dark) active:border-(--color-bpa-green-dark) active:text-(--color-bpa-green-dark) ' +
    'focus-visible:ring-(--bpa-navy) ' +
    'disabled:border-gray-300 disabled:text-gray-400 disabled:bg-transparent ' +
    'disabled:hover:bg-transparent disabled:hover:text-gray-400 disabled:hover:border-gray-300',
  // Ghost: same policy as outline, without the border.
  ghost:
    'text-(--color-bpa-green) bg-transparent ' +
    'hover:bg-(--color-bpa-accent) hover:text-(--color-bpa-green-dark) ' +
    'active:bg-(--color-bpa-accent-dark) active:text-(--color-bpa-green-dark) ' +
    'focus-visible:ring-(--bpa-navy) ' +
    'disabled:text-gray-400 disabled:bg-transparent disabled:hover:bg-transparent disabled:hover:text-gray-400',
  // White: for use on dark/colored hero backgrounds — text stays green
  // throughout (never swaps to white-on-white), only the surface dims.
  white:
    'bg-white text-(--color-bpa-green) ' +
    'hover:bg-gray-50 ' +
    'active:bg-gray-100 ' +
    'focus-visible:ring-white ' +
    'disabled:bg-gray-100 disabled:text-gray-400',
};

export const BUTTON_SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

/** Joins base + variant + size (+ any caller override) into one className — the single function both Button.tsx and LinkButton.tsx call, so they can never diverge again. */
export function buildButtonClassName(opts: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  const { variant = 'primary', size = 'md', className = '' } = opts;
  return [BUTTON_BASE_CLASSES, BUTTON_VARIANT_CLASSES[variant], BUTTON_SIZE_CLASSES[size], className]
    .filter(Boolean)
    .join(' ');
}
