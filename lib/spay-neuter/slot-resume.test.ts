import assert from 'node:assert/strict';
import test from 'node:test';
import { getSlotResumeMessage, resolveInitialStep, resolvePreselectedSlot } from './slot-resume';
import type { SpayAvailabilityWindow } from '@/lib/api/spay-neuter';

function makeSlot(overrides: Partial<SpayAvailabilityWindow> = {}): SpayAvailabilityWindow {
  return {
    availabilityId: 'slot-1',
    clinicBranchId: 'clinic-1',
    procedure: 'neuter',
    operationStartAt: '2026-08-09T03:00:00.000Z',
    operationEndAt: '2026-08-09T03:20:00.000Z',
    operationStartDhaka: '2026-08-09T09:00:00+06:00',
    operationEndDhaka: '2026-08-09T09:20:00+06:00',
    recommendedArrivalAt: '2026-08-09T02:50:00.000Z',
    earliestCheckinAt: '2026-08-09T02:45:00.000Z',
    capacity: 5,
    remaining: 3,
    bookable: true,
    ...overrides,
  };
}

test('valid slot preserved/revalidated: a still-bookable slot with a matching id is restored', () => {
  const slots = [makeSlot({ availabilityId: 'slot-1', bookable: true }), makeSlot({ availabilityId: 'slot-2' })];
  const result = resolvePreselectedSlot(slots, 'slot-1');
  assert.equal(result.outcome, 'restored');
  assert.equal(result.slot?.availabilityId, 'slot-1');
  assert.equal(getSlotResumeMessage(result.outcome), '');
});

test('slot became unavailable during login: same id present but no longer bookable is never auto-selected', () => {
  const slots = [makeSlot({ availabilityId: 'slot-1', bookable: false, remaining: 0 })];
  const result = resolvePreselectedSlot(slots, 'slot-1');
  assert.equal(result.outcome, 'unavailable');
  assert.equal(result.slot, null);
  assert.match(getSlotResumeMessage(result.outcome), /no longer available/);
});

test('expired hold after login: the previously-held slot has aged out of the fresh availability window entirely', () => {
  const slots = [makeSlot({ availabilityId: 'slot-2' })]; // slot-1 no longer offered at all
  const result = resolvePreselectedSlot(slots, 'slot-1');
  assert.equal(result.outcome, 'not_found');
  assert.equal(result.slot, null);
  assert.match(getSlotResumeMessage(result.outcome), /choose a date and time again/);
});

test('no preselection: a fresh visit with nothing to resume is not treated as an error', () => {
  const result = resolvePreselectedSlot([makeSlot()], '');
  assert.equal(result.outcome, 'no_preselection');
  assert.equal(getSlotResumeMessage(result.outcome), '');
});

test('an empty slot list never crashes and is always treated as not_found for any preselection', () => {
  const result = resolvePreselectedSlot([], 'slot-1');
  assert.equal(result.outcome, 'not_found');
});

test('initial step resumes only as far as the upstream selections actually go', () => {
  assert.equal(resolveInitialStep({ procedure: '', clinicBranchId: '', selectedDate: '' }), 1);
  assert.equal(resolveInitialStep({ procedure: 'neuter', clinicBranchId: '', selectedDate: '' }), 2);
  assert.equal(resolveInitialStep({ procedure: 'neuter', clinicBranchId: 'clinic-1', selectedDate: '' }), 3);
  assert.equal(resolveInitialStep({ procedure: 'neuter', clinicBranchId: 'clinic-1', selectedDate: '2026-08-09' }), 3);
});
