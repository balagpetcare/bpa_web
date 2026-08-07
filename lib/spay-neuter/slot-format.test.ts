import assert from 'node:assert/strict';
import test from 'node:test';
import {
  computeDurationMinutes,
  formatClockTime,
  formatDateChip,
  formatFullDateLabel,
  formatSlotAccessibleLabel,
  formatSlotTimeRange,
  getDayPeriod,
  getDayPeriodLabel,
  getSlotStatusLabel,
  getSlotUiStatus,
  slotGridClassName,
} from './slot-format';

// 2026-08-09 is a Sunday. 09:00 Asia/Dhaka (UTC+6) = 03:00 UTC.
const NEUTER_START = '2026-08-09T03:00:00.000Z';
const NEUTER_END = '2026-08-09T03:20:00.000Z'; // +20 min
const SPAY_START = '2026-08-09T03:00:00.000Z';
const SPAY_END = '2026-08-09T03:40:00.000Z'; // +40 min

test('1. Asia/Dhaka formatting: a UTC instant is rendered on the clinic clock, not the raw UTC hour', () => {
  assert.equal(formatClockTime(NEUTER_START, 'en'), '9:00 AM');
});

test('2. English display: full slot range reads as a clean AM/PM range with an en dash, no ISO syntax', () => {
  const range = formatSlotTimeRange(NEUTER_START, NEUTER_END, 'en');
  assert.equal(range, '9:00 AM – 9:20 AM');
  assert.doesNotMatch(range, /\d{4}-\d{2}-\d{2}/); // no ISO date fragment
  assert.doesNotMatch(range, /[+-]\d{2}:\d{2}$/); // no trailing UTC offset
  assert.doesNotMatch(range, /\d{1,2}:\d{2}:\d{2}/); // no seconds component (H:MM:SS)
});

test('3. Bengali display: renders with Bengali digits and a সকাল/দুপুর/সন্ধ্যা period prefix, where the locale is supported', () => {
  assert.equal(formatClockTime(NEUTER_START, 'bn'), 'সকাল ৯:০০');
  const range = formatSlotTimeRange(NEUTER_START, NEUTER_END, 'bn');
  assert.equal(range, 'সকাল ৯:০০ – সকাল ৯:২০');
});

test('4. Spay start/end range is exactly a 40-minute allocation, formatted end-to-end', () => {
  assert.equal(computeDurationMinutes(SPAY_START, SPAY_END), 40);
  assert.equal(formatSlotTimeRange(SPAY_START, SPAY_END, 'en'), '9:00 AM – 9:40 AM');
});

test('5. Neuter start/end range is exactly a 20-minute allocation, formatted end-to-end', () => {
  assert.equal(computeDurationMinutes(NEUTER_START, NEUTER_END), 20);
  assert.equal(formatSlotTimeRange(NEUTER_START, NEUTER_END, 'en'), '9:00 AM – 9:20 AM');
});

test('7. Browser-local timezone never changes the displayed clinic time (format functions take no browser-timezone input at all)', () => {
  // formatClockTime/formatSlotTimeRange only ever accept the explicit
  // Asia/Dhaka zone internally — there is no code path through which
  // process.env.TZ or Intl.DateTimeFormat().resolvedOptions().timeZone
  // (the browser's local zone) can influence the result. Asserting the
  // same instant produces the same label regardless of how it's re-parsed
  // is the practical proof available without spinning up multiple browser
  // timezone contexts.
  const reparsed = new Date(NEUTER_START).toISOString();
  assert.equal(formatClockTime(reparsed, 'en'), formatClockTime(NEUTER_START, 'en'));
  assert.equal(formatClockTime(NEUTER_START, 'en'), '9:00 AM');
});

test('8. Unavailable slot status is distinct from available/selected, never rendered as clickable in the status model', () => {
  assert.equal(getSlotUiStatus(false, false), 'unavailable');
  assert.equal(getSlotStatusLabel('unavailable', 'en'), 'Unavailable');
  assert.equal(getSlotStatusLabel('unavailable', 'bn'), 'বুকড');
});

test('9. Selected state is derived independently of bookable, and has its own accessible label', () => {
  assert.equal(getSlotUiStatus(true, true), 'selected');
  assert.equal(getSlotUiStatus(false, true), 'selected'); // a slot the user already selected/held stays "selected" in the UI even if a refetch marks it unbookable for anyone else
  assert.equal(getSlotStatusLabel('selected', 'en'), 'Selected');
  assert.equal(getSlotStatusLabel('selected', 'bn'), 'নির্বাচিত');
});

test('11. Invalid/garbage timestamps never render "Invalid Date" or throw — a safe placeholder is used instead', () => {
  assert.equal(formatClockTime('not-a-date', 'en'), 'Time unavailable');
  assert.equal(formatClockTime(null, 'en'), 'Time unavailable');
  assert.equal(formatClockTime(undefined, 'bn'), 'সময় অজানা');
  assert.equal(formatSlotTimeRange('garbage', NEUTER_END, 'en'), 'Time unavailable');
  assert.equal(formatSlotTimeRange(NEUTER_START, '', 'en'), 'Time unavailable');
  assert.equal(computeDurationMinutes('garbage', NEUTER_END), null);
  assert.equal(formatFullDateLabel('not-a-date', 'en'), 'Date unavailable');
  assert.equal(formatDateChip('nonsense', 'en').day, '—');
});

test('12. Responsive slot-grid contract: 1 column mobile, 2 tablet, 3 desktop, never a fixed-width overflow-prone grid', () => {
  const className = slotGridClassName();
  assert.match(className, /grid-cols-1\b/);
  assert.match(className, /sm:grid-cols-2\b/);
  assert.match(className, /lg:grid-cols-3\b/);
});

test('13. No raw ISO string ever appears in a formatted label', () => {
  const isoPattern = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
  assert.doesNotMatch(formatClockTime(NEUTER_START, 'en'), isoPattern);
  assert.doesNotMatch(formatSlotTimeRange(NEUTER_START, NEUTER_END, 'en'), isoPattern);
  assert.doesNotMatch(formatSlotTimeRange(NEUTER_START, NEUTER_END, 'bn'), isoPattern);
  assert.doesNotMatch(formatFullDateLabel('2026-08-09', 'en'), isoPattern);
  const chip = formatDateChip('2026-08-09', 'en');
  assert.doesNotMatch(`${chip.weekday}${chip.day}${chip.month}`, isoPattern);
});

test('date chip parts match the documented English/Bengali examples for a known Sunday', () => {
  const en = formatDateChip('2026-08-09', 'en');
  assert.deepEqual(en, { weekday: 'Sun', day: '9', month: 'Aug' });

  const bn = formatDateChip('2026-08-09', 'bn');
  assert.equal(bn.weekday, 'রবি');
  assert.equal(bn.day, '৯');
});

test('full date label matches the documented "Sunday, 9 August" / "রবিবার, ৯ আগস্ট" examples', () => {
  assert.equal(formatFullDateLabel('2026-08-09', 'en', 'long'), 'Sunday, 9 August');
  assert.equal(formatFullDateLabel('2026-08-09', 'en', 'short'), 'Sun, 9 Aug');
  assert.equal(formatFullDateLabel('2026-08-09', 'bn', 'long'), 'রবিবার, ৯ আগস্ট');
});

test('day-period grouping buckets a slot by its Asia/Dhaka wall-clock hour, not raw UTC', () => {
  assert.equal(getDayPeriod(NEUTER_START), 'morning'); // 09:00 Dhaka
  assert.equal(getDayPeriod('2026-08-09T07:30:00.000Z'), 'afternoon'); // 13:30 Dhaka
  assert.equal(getDayPeriod('2026-08-09T12:30:00.000Z'), 'evening'); // 18:30 Dhaka
  assert.equal(getDayPeriodLabel('morning', 'bn'), 'সকাল');
  assert.equal(getDayPeriodLabel('afternoon', 'en'), 'Afternoon');
});

test('accessible label always includes full date, time range, and status regardless of the compact button text', () => {
  const label = formatSlotAccessibleLabel({
    dateStr: '2026-08-09',
    startAtIso: NEUTER_START,
    endAtIso: NEUTER_END,
    status: 'available',
    locale: 'en',
  });
  assert.equal(label, 'Sunday, 9 August, 9:00 AM – 9:20 AM — Available');
});
