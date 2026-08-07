// Pure, DB/network-free helpers for the Spay & Neuter offer detail page —
// factored out so they're unit-testable without rendering (this repo has no
// component-testing harness; see media-url.test.ts / query.test.ts for the
// established convention of testing pure logic directly).

import type { SpayOfferLifecycleState, SpayOfferPublic, SpayProcedure, SpayServiceTypeCode } from '@/lib/api/spay-neuter';

export interface LifecycleBadge {
  label: string;
  className: string;
}

const LIFECYCLE_BADGES: Record<SpayOfferLifecycleState, LifecycleBadge> = {
  active: { label: 'Booking Open', className: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  scheduled: { label: 'Starting Soon', className: 'text-blue-700 bg-blue-50 border-blue-200' },
  expired: { label: 'Campaign Ended', className: 'text-gray-600 bg-gray-100 border-gray-200' },
  closed: { label: 'Not Currently Bookable', className: 'text-gray-600 bg-gray-100 border-gray-200' },
};

/** Never renders an unrecognized lifecycle state as if it were bookable — falls back to the same "not bookable" treatment as `closed`. */
export function getLifecycleBadge(state: SpayOfferLifecycleState): LifecycleBadge {
  return LIFECYCLE_BADGES[state] ?? LIFECYCLE_BADGES.closed;
}

/** Human copy for why booking is currently unavailable, matching the offer's own lifecycleState — never a generic "error". */
export function getNotBookableReason(state: SpayOfferLifecycleState): string {
  if (state === 'scheduled') return 'Booking opens soon';
  if (state === 'expired') return 'This campaign has ended';
  return 'Not currently bookable';
}

/** Case-insensitive: accepts the canonical SPAY/NEUTER code (or the lowercase internal value) from a URL query param — never guesses on anything else. */
export function normalizeServiceQueryParam(value: string | null | undefined): SpayProcedure | null {
  if (!value) return null;
  const v = value.trim().toUpperCase();
  if (v === 'SPAY') return 'spay';
  if (v === 'NEUTER') return 'neuter';
  return null;
}

/**
 * Resolves a Next.js `searchParams` entry — which is `string | string[] |
 * undefined` because a repeated query key (`?service=SPAY&service=NEUTER`)
 * arrives as an array — down to a single validated procedure, or null. Only
 * the first value of a repeated key is ever considered; an ambiguous
 * repeated `?service=` is treated the same as an invalid one, never
 * silently picks the last one or throws.
 */
export function resolveServiceSearchParam(raw: string | string[] | undefined): SpayProcedure | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return normalizeServiceQueryParam(value);
}

/** Builds the canonical booking-route href, optionally pre-filling the service and/or clinic via query params — the booking page and API still fully revalidate both. */
export function buildBookingHref(offerId: string, opts?: { service?: SpayServiceTypeCode | null; clinicBranchId?: string | null }): string {
  const qs = new URLSearchParams();
  if (opts?.service) qs.set('service', opts.service);
  if (opts?.clinicBranchId) qs.set('clinic', opts.clinicBranchId);
  const query = qs.toString();
  return `/spay-neuter/${offerId}/book${query ? `?${query}` : ''}`;
}

/** Resolves the display name for a service by its canonical code — never trusts a stray/absent choice; returns null if the offer doesn't carry that code (should not happen given both are always seeded, but never assume). */
export function findServiceChoice(offer: Pick<SpayOfferPublic, 'serviceChoices'>, code: SpayServiceTypeCode) {
  return offer.serviceChoices.find((c) => c.code === code) ?? null;
}

/** True only for a clinic branch that is both linked+active on the offer AND published to the public directory — never surfaces a clinic the public can't otherwise reach. */
export function isPubliclyVisibleClinic(clinicBranch: { published: boolean }): boolean {
  return clinicBranch.published;
}
