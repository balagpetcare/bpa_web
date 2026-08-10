// Presentation mapping for the server-computed session `status` field
// (see bpa_api campaign-session-status.ts — the single source of truth for
// the business rule). The frontend never re-derives availability from
// capacity/bookedCount itself; it only maps the given status to a label.

import type { SessionAvailability } from '@/types/bpa.types';

export interface SessionStatusPresentation {
  label: string;
  badgeClassName: string;
  isBookable: boolean;
  isWaitlistable: boolean;
}

const PRESENTATION: Record<SessionAvailability, SessionStatusPresentation> = {
  available:            { label: 'Available',            badgeClassName: 'bg-emerald-100 text-emerald-700', isBookable: true,  isWaitlistable: false },
  few_left:             { label: 'Few Slots Left',        badgeClassName: 'bg-amber-100 text-amber-700',     isBookable: true,  isWaitlistable: false },
  full:                 { label: 'Full',                  badgeClassName: 'bg-red-100 text-red-700',         isBookable: false, isWaitlistable: true },
  registration_closed:  { label: 'Registration Closed',   badgeClassName: 'bg-gray-100 text-gray-600',       isBookable: false, isWaitlistable: false },
  completed:            { label: 'Completed',             badgeClassName: 'bg-gray-100 text-gray-500',       isBookable: false, isWaitlistable: false },
};

export function getSessionStatusPresentation(status: SessionAvailability): SessionStatusPresentation {
  return PRESENTATION[status] ?? PRESENTATION.registration_closed;
}
