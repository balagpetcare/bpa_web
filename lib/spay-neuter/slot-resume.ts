// Pure decision logic for resuming a Spay & Neuter booking after the user is
// sent away for authentication (or arrives via a preselected deep link).
// Nothing here trusts anything the browser remembered about availability —
// it only ever classifies a *freshly re-fetched* slot list against the
// previously-chosen slot id. The server's own bookable/remaining fields
// remain the single source of truth for availability.

import type { SpayAvailabilityWindow, SpayProcedure } from '@/lib/api/spay-neuter';

export type SlotResumeOutcome = 'restored' | 'unavailable' | 'not_found' | 'no_preselection';

export interface SlotResumeResult {
  slot: SpayAvailabilityWindow | null;
  outcome: SlotResumeOutcome;
}

/** Given a freshly-fetched slot list, decides whether a previously-selected slot (identified by its canonical availabilityId, never a display string) is still valid. Never invents availability — a slot missing from the fresh list or marked unbookable is always treated as gone. */
export function resolvePreselectedSlot(
  slots: SpayAvailabilityWindow[],
  preselectedSlotId: string | null | undefined,
): SlotResumeResult {
  if (!preselectedSlotId) return { slot: null, outcome: 'no_preselection' };

  const match = slots.find((s) => s.availabilityId === preselectedSlotId);
  if (!match) return { slot: null, outcome: 'not_found' };
  if (!match.bookable) return { slot: null, outcome: 'unavailable' };
  return { slot: match, outcome: 'restored' };
}

const RESUME_MESSAGE: Record<Exclude<SlotResumeOutcome, 'restored' | 'no_preselection'>, string> = {
  unavailable: 'Your previously selected time is no longer available — please choose another time.',
  not_found: 'Your previously selected time could no longer be found — please choose a date and time again.',
};

/** User-facing explanation for why a re-selection is required — never shown for 'restored' or 'no_preselection', which need no explanation. */
export function getSlotResumeMessage(outcome: SlotResumeOutcome): string {
  if (outcome === 'restored' || outcome === 'no_preselection') return '';
  return RESUME_MESSAGE[outcome];
}

export interface ResumeStepInput {
  procedure: SpayProcedure | '';
  clinicBranchId: string;
  selectedDate: string;
}

/** How far into the 4-step booking wizard (Procedure / Clinic / Date & Time / Review & Payment) a page load may safely resume, based purely on which upstream selections are already present (from a login-return query string or a deep link). Never resumes past step 3 here — step 4 (Review & Payment) requires a live, revalidated slot, which is decided separately once the fresh slot list has actually loaded. */
export function resolveInitialStep(input: ResumeStepInput): number {
  const { procedure, clinicBranchId, selectedDate } = input;
  if (!procedure) return 1;
  if (!clinicBranchId) return 2;
  if (!selectedDate) return 3;
  return 3;
}
