import assert from 'node:assert/strict';
import test from 'node:test';
import { buildButtonClassName, BUTTON_VARIANT_CLASSES } from './button-variants';

// Regression coverage for the "text vanishes on hover" bug: every variant's
// hover/active classes must change background AND foreground together (or
// leave the foreground alone while a static background changes) — never
// leave a stale text-* color sitting on a new, same-or-similar background.

test('primary: text stays white through hover/active, background darkens', () => {
  const c = BUTTON_VARIANT_CLASSES.primary;
  assert.match(c, /\btext-white\b/);
  assert.doesNotMatch(c, /hover:text-/);
  assert.doesNotMatch(c, /active:text-/);
  assert.match(c, /hover:bg-\(--color-bpa-green-dark\)/);
  assert.match(c, /active:bg-\(--color-bpa-green-dark\)/);
});

test('primary: disabled uses a solid muted background and readable text, not a translucent fade', () => {
  const c = BUTTON_VARIANT_CLASSES.primary;
  assert.doesNotMatch(c, /disabled:opacity/);
  assert.match(c, /disabled:bg-gray-200/);
  assert.match(c, /disabled:text-gray-500/);
});

test('outline: hover never pairs unchanged green text with a green-ish background (the original bug)', () => {
  const c = BUTTON_VARIANT_CLASSES.outline;
  // Base text is green; on hover it MUST switch away from plain green —
  // pairing with the accent-yellow hover background.
  assert.match(c, /\btext-\(--color-bpa-green\)/);
  assert.match(c, /hover:bg-\(--color-bpa-accent\)/);
  assert.match(c, /hover:text-\(--color-bpa-green-dark\)/);
  assert.doesNotMatch(c, /hover:bg-\(--color-bpa-green\)\)/); // never the old bug's exact background
});

test('outline: active is a visibly distinct, darker shade of the hover accent', () => {
  const c = BUTTON_VARIANT_CLASSES.outline;
  assert.match(c, /active:bg-\(--color-bpa-accent-dark\)/);
  assert.match(c, /active:text-\(--color-bpa-green-dark\)/);
});

test('outline: disabled is neutral/muted and does not re-trigger the accent hover look', () => {
  const c = BUTTON_VARIANT_CLASSES.outline;
  assert.match(c, /disabled:text-gray-400/);
  assert.match(c, /disabled:border-gray-300/);
  assert.match(c, /disabled:hover:bg-transparent/);
  assert.match(c, /disabled:hover:text-gray-400/);
});

test('ghost: same hover/active/disabled policy as outline, without a border', () => {
  const c = BUTTON_VARIANT_CLASSES.ghost;
  assert.doesNotMatch(c, /\bborder-2\b/);
  assert.match(c, /hover:bg-\(--color-bpa-accent\)/);
  assert.match(c, /hover:text-\(--color-bpa-green-dark\)/);
  assert.match(c, /active:bg-\(--color-bpa-accent-dark\)/);
  assert.match(c, /disabled:text-gray-400/);
});

test('white: text stays green through hover/active — never swaps to white-on-white', () => {
  const c = BUTTON_VARIANT_CLASSES.white;
  assert.match(c, /\btext-\(--color-bpa-green\)/);
  assert.doesNotMatch(c, /hover:text-/);
  assert.doesNotMatch(c, /active:text-/);
});

test('every variant defines a focus-visible ring color for keyboard users', () => {
  for (const variant of Object.keys(BUTTON_VARIANT_CLASSES) as (keyof typeof BUTTON_VARIANT_CLASSES)[]) {
    assert.match(BUTTON_VARIANT_CLASSES[variant], /focus-visible:ring-/, `${variant} is missing a focus-visible ring color`);
  }
});

test('buildButtonClassName: base classes always carry the focus-visible ring mechanics and a pressed cue', () => {
  const className = buildButtonClassName({ variant: 'outline', size: 'md' });
  assert.match(className, /focus-visible:outline-none/);
  assert.match(className, /focus-visible:ring-2/);
  assert.match(className, /focus-visible:ring-offset-2/);
  assert.match(className, /active:scale-\[0\.97\]/);
});

test('buildButtonClassName: defaults to primary/md with no options, and appends a caller className last', () => {
  const withDefaults = buildButtonClassName();
  assert.match(withDefaults, /bg-\(--color-bpa-green\)/);
  assert.match(withDefaults, /px-5 py-2\.5 text-sm/);

  const withExtra = buildButtonClassName({ variant: 'primary', className: 'w-full shadow-md' });
  assert.ok(withExtra.trim().endsWith('w-full shadow-md'), 'custom className must be appended last so it can override');
});

test('buildButtonClassName: every size produces distinct, non-empty padding/text classes', () => {
  const sm = buildButtonClassName({ size: 'sm' });
  const md = buildButtonClassName({ size: 'md' });
  const lg = buildButtonClassName({ size: 'lg' });
  assert.notEqual(sm, md);
  assert.notEqual(md, lg);
});
