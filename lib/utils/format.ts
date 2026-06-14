// ─── Media URL resolution ─────────────────────────────────────────────────────

const MEDIA_BASE =
  typeof window === 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000')
    : (process.env.NEXT_PUBLIC_API_URL ?? '');

export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${MEDIA_BASE}${url}`;
  return url;
}

// ─── Safe number conversion ───────────────────────────────────────────────────

/**
 * Converts any value to a finite number, returning 0 for anything
 * that cannot be represented (null, undefined, NaN, Infinity, object, etc.).
 * Handles:
 *   - numbers and numeric strings ("600", "600.00")
 *   - Prisma Decimal objects that may leak through as {s,d,e} plain objects
 *     or as actual Decimal instances with a .toString() method
 */
export function safeNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;

  // Already a finite number
  if (typeof value === 'number') return isFinite(value) ? value : 0;

  // Numeric string
  if (typeof value === 'string') {
    const n = parseFloat(value);
    return isFinite(n) ? n : 0;
  }

  // Decimal-like object (Prisma Decimal / decimal.js)
  // Could arrive as an actual Decimal instance OR as a plain object {s, d, e}
  // when serialization is incomplete. Both cases: call .toString() if available.
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;
    if (typeof obj['toString'] === 'function') {
      const str = (obj as { toString(): string }).toString();
      // Plain-object toString returns "[object Object]" — skip it
      if (str !== '[object Object]') {
        const n = parseFloat(str);
        return isFinite(n) ? n : 0;
      }
    }
  }

  return 0;
}

// ─── Currency ─────────────────────────────────────────────────────────────────

/**
 * Formats a value as BDT currency.
 * Handles strings, numbers, and Decimal-like objects safely.
 */
export function formatMoney(value: unknown): string {
  const num = safeNumber(value);
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num).replace('BDT', '৳').trim();
}

// ─── Safe string conversion ───────────────────────────────────────────────────

export function toDisplayString(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return String(value);

  if (typeof value === 'object') {
    if (value instanceof Date) return value.toLocaleDateString();
    // Decimal-like: use safeNumber
    const n = safeNumber(value);
    if (n !== 0) return String(n);
    try {
      return JSON.stringify(value);
    } catch {
      return '[Object]';
    }
  }

  return String(value);
}

// ─── Campaign pricing ─────────────────────────────────────────────────────────

export interface CampaignPricing {
  /** Sum of all service.priceBdt values (market value per pet) */
  serviceTotal: number;
  /** Campaign registration fee per pet (basePriceBdt) */
  campaignFee: number;
  /** serviceTotal - campaignFee (per pet) */
  savings: number;
  /** savings / serviceTotal * 100, rounded to nearest integer */
  discountPercent: number;
  /** true when serviceTotal > campaignFee > 0 */
  hasDiscount: boolean;
  /** true when campaignFee === 0 */
  isFree: boolean;
}

/**
 * Computes campaign pricing summary from any campaign shape.
 * Safe against null, undefined, Decimal objects, and missing services.
 */
export function normalizeCampaignPricing(campaign: {
  basePriceBdt?: unknown;
  services?: Array<{ priceBdt?: number | null }> | null;
} | null | undefined): CampaignPricing {
  const campaignFee = safeNumber(campaign?.basePriceBdt);
  const services = campaign?.services;
  const serviceTotal = Array.isArray(services)
    ? services.reduce((sum, s) => sum + (s.priceBdt != null ? s.priceBdt : 0), 0)
    : 0;

  const savings = serviceTotal > campaignFee ? serviceTotal - campaignFee : 0;
  const discountPercent =
    serviceTotal > 0 && savings > 0
      ? Math.round((savings / serviceTotal) * 100)
      : 0;

  return {
    serviceTotal,
    campaignFee,
    savings,
    discountPercent,
    hasDiscount: savings > 0 && discountPercent > 0,
    isFree: campaignFee === 0,
  };
}

// ─── Campaign media ───────────────────────────────────────────────────────────

export function getCampaignRoleUrl(campaign: unknown, role: string): string {
  const c = campaign as { media?: unknown[] } | null | undefined;
  if (!c?.media || !Array.isArray(c.media)) return '';
  const item = c.media.find((m: unknown) => (m as { role?: string }).role === role);
  const m = item as { mediaFile?: { url?: string }; url?: string } | undefined;
  return resolveMediaUrl(m?.mediaFile?.url ?? m?.url) ?? '';
}

export function getCampaignMediaUrl(campaign: unknown, role: string = 'thumbnail'): string {
  if (!campaign) return '';
  const c = campaign as {
    media?: Array<{ role: string; mediaFile?: { url?: string }; url?: string }>;
    coverImage?: { url?: string };
    coverImageUrl?: string;
  };

  if (c.media && Array.isArray(c.media)) {
    const item = c.media.find((m) => m.role === role);
    const primary = resolveMediaUrl(item?.mediaFile?.url ?? item?.url);
    if (primary) return primary;

    const fallbacks: string[] =
      role === 'hero'
        ? ['thumbnail', 'mobile_banner']
        : role === 'thumbnail' || role === 'mobile_banner'
        ? ['hero', 'thumbnail', 'mobile_banner'].filter((r) => r !== role)
        : [];

    for (const fr of fallbacks) {
      const fb = c.media.find((m) => m.role === fr);
      const fbUrl = resolveMediaUrl(fb?.mediaFile?.url ?? fb?.url);
      if (fbUrl) return fbUrl;
    }

    const first = c.media.find((m) => m.role !== 'gallery');
    const firstUrl = resolveMediaUrl(first?.mediaFile?.url ?? first?.url);
    if (firstUrl) return firstUrl;
  }

  const coverUrl = resolveMediaUrl(c.coverImage?.url ?? c.coverImageUrl);
  if (coverUrl) return coverUrl;

  return '';
}
