// Pure, network/DOM-free display formatting for Spay & Neuter slot dates
// and times — no React, fully unit-testable (this repo has no component
// rendering harness; see lib/utils/media-url.test.ts for the established
// convention of testing pure logic directly).
//
// PRINCIPLE: the canonical slot identity (availabilityId) and canonical
// instants (operationStartAt/operationEndAt, full ISO with offset) are
// NEVER touched here — everything below only ever *derives a display
// string* from them. Nothing here invents availability, capacity, or
// duration rules; duration is plain arithmetic on two already-authoritative
// timestamps the API provides.

export type UiLocale = 'en' | 'bn';

// The whole platform is Asia/Dhaka-only today (see spay-neuter.timezone.ts
// in bpa_api) — there is no per-offer/per-clinic timezone field in the
// contract to read instead. If a future offer ever carries its own
// timezone, this is the single place to swap the hardcoded zone for it.
export const CLINIC_TIME_ZONE = 'Asia/Dhaka';

function parseIsoOrNull(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** A YYYY-MM-DD Asia/Dhaka calendar-date string, anchored at UTC midnight so weekday/day/month formatting never depends on the viewer's browser timezone (pure calendar-date display needs no timezone conversion at all). */
function calendarDateFromDateStr(dateStr: string | null | undefined): Date | null {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const d = new Date(`${dateStr}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export type DayPeriod = 'morning' | 'afternoon' | 'evening';

const PERIOD_LABEL: Record<DayPeriod, Record<UiLocale, string>> = {
  morning: { en: 'Morning', bn: 'সকাল' },
  afternoon: { en: 'Afternoon', bn: 'দুপুর' },
  evening: { en: 'Evening', bn: 'সন্ধ্যা' },
};

const dhakaHourFormatter = new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: CLINIC_TIME_ZONE });

/** Buckets a real instant into a display-only Morning/Afternoon/Evening group, from its Asia/Dhaka wall-clock hour — mirrors the same 12/17 boundary already used for campaign session grouping elsewhere in this app. Display grouping only; never reorders or filters the underlying slot list. */
export function getDayPeriod(iso: string): DayPeriod | null {
  const d = parseIsoOrNull(iso);
  if (!d) return null;
  const hour = Number(dhakaHourFormatter.format(d));
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export function getDayPeriodLabel(period: DayPeriod, locale: UiLocale): string {
  return PERIOD_LABEL[period][locale];
}

const clockFormatters: Record<UiLocale, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: CLINIC_TIME_ZONE }),
  bn: new Intl.DateTimeFormat('bn-BD', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: CLINIC_TIME_ZONE }),
};

/** "9:00 AM" (en) or "সকাল ৯:০০" (bn) for one instant — never seconds, never a UTC offset, never raw ISO. Falls back to a safe placeholder (never "Invalid Date") if the timestamp can't be parsed. */
export function formatClockTime(iso: string | null | undefined, locale: UiLocale): string {
  const d = parseIsoOrNull(iso);
  if (!d) return locale === 'bn' ? 'সময় অজানা' : 'Time unavailable';

  if (locale === 'en') return clockFormatters.en.format(d);

  // bn-BD's native AM/PM marker stays in Latin script ("AM"/"PM") — the
  // requested Bengali style is a leading সকাল/দুপুর/সন্ধ্যা period word
  // instead, so it's swapped in here rather than shown as an English suffix.
  const raw = clockFormatters.bn.format(d); // e.g. "৯:০০ AM"
  const timePart = raw.replace(/\s*[AP]M\s*$/i, '').trim();
  const period = getDayPeriod(iso!) ?? 'morning';
  return `${getDayPeriodLabel(period, 'bn')} ${timePart}`;
}

/** "9:00 AM – 9:40 AM" / "সকাল ৯:০০ – সকাল ৯:৪০" — the only place a slot's time range should ever be built. */
export function formatSlotTimeRange(startAtIso: string | null | undefined, endAtIso: string | null | undefined, locale: UiLocale): string {
  const start = parseIsoOrNull(startAtIso);
  const end = parseIsoOrNull(endAtIso);
  if (!start || !end) return locale === 'bn' ? 'সময় পাওয়া যায়নি' : 'Time unavailable';
  return `${formatClockTime(startAtIso, locale)} – ${formatClockTime(endAtIso, locale)}`;
}

/** Duration is plain arithmetic on two already-authoritative timestamps — never a client-invented business rule. Returns null (never a bogus number) if either timestamp fails to parse. */
export function computeDurationMinutes(startAtIso: string | null | undefined, endAtIso: string | null | undefined): number | null {
  const start = parseIsoOrNull(startAtIso);
  const end = parseIsoOrNull(endAtIso);
  if (!start || !end) return null;
  return Math.round((end.getTime() - start.getTime()) / 60_000);
}

export interface DateChip {
  weekday: string;
  day: string;
  month: string;
}

/** Compact chip parts for a date-picker button — "Sun" / "9" / "Aug", or the Bengali equivalents. Never depends on the browser's local timezone: the date string is already the canonical Asia/Dhaka calendar date, so it's anchored at UTC midnight and formatted with an explicit UTC zone — no wall-clock conversion is needed or performed for a pure calendar date. */
export function formatDateChip(dateStr: string | null | undefined, locale: UiLocale): DateChip {
  const d = calendarDateFromDateStr(dateStr);
  if (!d) return { weekday: '—', day: '—', month: '—' };
  const loc = locale === 'bn' ? 'bn-BD' : 'en-GB';
  return {
    weekday: new Intl.DateTimeFormat(loc, { weekday: 'short', timeZone: 'UTC' }).format(d),
    day: new Intl.DateTimeFormat(loc, { day: 'numeric', timeZone: 'UTC' }).format(d),
    month: new Intl.DateTimeFormat(loc, { month: 'short', timeZone: 'UTC' }).format(d),
  };
}

/** "Sunday, 9 August" (long) or "Sun, 9 Aug" (short) / Bengali equivalents — used for the accessible slot label and the review-step summary. */
export function formatFullDateLabel(dateStr: string | null | undefined, locale: UiLocale, style: 'long' | 'short' = 'long'): string {
  const d = calendarDateFromDateStr(dateStr);
  if (!d) return locale === 'bn' ? 'তারিখ পাওয়া যায়নি' : 'Date unavailable';
  const loc = locale === 'bn' ? 'bn-BD' : 'en-GB';
  const weekday = new Intl.DateTimeFormat(loc, { weekday: style, timeZone: 'UTC' }).format(d);
  const day = new Intl.DateTimeFormat(loc, { day: 'numeric', timeZone: 'UTC' }).format(d);
  const month = new Intl.DateTimeFormat(loc, { month: style, timeZone: 'UTC' }).format(d);
  return `${weekday}, ${day} ${month}`;
}

export type SlotUiStatus = 'available' | 'selected' | 'unavailable';

const STATUS_LABEL: Record<SlotUiStatus, Record<UiLocale, string>> = {
  available: { en: 'Available', bn: 'খালি আছে' },
  selected: { en: 'Selected', bn: 'নির্বাচিত' },
  // The backend's availability contract only ever exposes a single
  // bookable/remaining signal — it does not (and structurally cannot,
  // without leaking other users' in-progress holds) distinguish "someone
  // else is mid-checkout on this slot" from "fully booked". Only the
  // states the API can actually back are ever labeled; see the audit note
  // in the final report for what a real "temporarily held" state would need.
  unavailable: { en: 'Unavailable', bn: 'বুকড' },
};

export function getSlotUiStatus(bookable: boolean, isSelected: boolean): SlotUiStatus {
  if (isSelected) return 'selected';
  return bookable ? 'available' : 'unavailable';
}

export function getSlotStatusLabel(status: SlotUiStatus, locale: UiLocale): string {
  return STATUS_LABEL[status][locale];
}

/** Full, unambiguous accessible label for one slot button — always includes the real date and time range plus its current status, regardless of what the compact visible button text shows. */
export function formatSlotAccessibleLabel(params: {
  dateStr: string | null | undefined;
  startAtIso: string | null | undefined;
  endAtIso: string | null | undefined;
  status: SlotUiStatus;
  locale: UiLocale;
}): string {
  const { dateStr, startAtIso, endAtIso, status, locale } = params;
  const datePart = formatFullDateLabel(dateStr, locale, 'long');
  const timePart = formatSlotTimeRange(startAtIso, endAtIso, locale);
  const statusPart = getSlotStatusLabel(status, locale);
  return `${datePart}, ${timePart} — ${statusPart}`;
}

/** Tailwind classes for the responsive slot grid: 1 column on mobile (long time-range labels never force horizontal overflow), 2 on tablet, 3 on desktop. Kept as one function so the layout contract itself is unit-testable. */
export function slotGridClassName(): string {
  return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3';
}
