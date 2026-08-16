export const dynamic = 'force-dynamic';

const ALLOWED_EVENTS = new Set([
  'BPA_AUTH_PARENT_LISTENER_READY',
  'BPA_AUTH_PARENT_START',
  'BPA_AUTH_POPUP_OPENED',
  'BPA_AUTH_POPUP_BLOCKED',
  'BPA_AUTH_MESSAGE_RECEIVED',
  'BPA_AUTH_MESSAGE_REJECTED',
  'BPA_AUTH_SUCCESS_ACCEPTED',
  'BPA_AUTH_REFRESH_STARTED',
  'BPA_AUTH_REFRESH_RESULT',
  'BPA_AUTH_NAVIGATION_STARTED',
  'BPA_AUTH_POPUP_APPARENTLY_CLOSED',
  'BPA_AUTH_POPUP_CANCELLED',
  'BPA_AUTH_POPUP_CALLBACK_LOADED',
  'BPA_AUTH_POPUP_HAS_OPENER',
  'BPA_AUTH_POPUP_MESSAGE_SENT',
  'BPA_AUTH_POPUP_ACK_RECEIVED',
  'BPA_AUTH_POPUP_CLOSING',
]);

function scrub(value: unknown): unknown {
  if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) return value;
  if (Array.isArray(value)) return value.slice(0, 20).map(scrub);
  if (!value || typeof value !== 'object') return undefined;

  const out: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (/token|code|cookie|secret|password|verifier/i.test(key)) continue;
    out[key] = scrub(raw);
  }
  return out;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const event = typeof body?.event === 'string' && ALLOWED_EVENTS.has(body.event)
      ? body.event
      : 'BPA_AUTH_TRACE_UNKNOWN';
    const details = scrub(body?.details ?? {});
    const page = scrub(body?.page ?? {});
    console.info('[BPA_AUTH_POPUP_TRACE]', JSON.stringify({ event, details, page }));
  } catch {
    console.info('[BPA_AUTH_POPUP_TRACE]', JSON.stringify({ event: 'BPA_AUTH_TRACE_PARSE_FAILED' }));
  }

  return Response.json({ ok: true });
}
