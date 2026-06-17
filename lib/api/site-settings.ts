import { apiFetch } from '@/lib/api';

export interface PublicSiteSettings {
  // Identity
  siteName: string;
  siteTagline: string | null;
  organizationName: string;
  // Contact
  officialPhone: string | null;
  supportPhone: string | null;
  emergencyPhone: string | null;
  whatsappNumber: string | null;
  generalEmail: string | null;
  supportEmail: string | null;
  officeHours: string | null;
  // Address
  officeAddress: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  area: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
  mapEmbedUrl: string | null;
  mapLink: string | null;
  // Branding
  primaryLogoUrl: string | null;
  secondaryLogoUrl: string | null;
  faviconUrl: string | null;
  defaultMetaTitle: string | null;
  defaultMetaDescription: string | null;
  // Social
  facebookUrl: string | null;
  youtubeUrl: string | null;
  linkedinUrl: string | null;
  // Public messages
  registrationErrorTitle: string;
  registrationErrorMessage: string;
  emergencyNotice: string | null;
}

const DEFAULT_SETTINGS: PublicSiteSettings = {
  siteName: 'Bangladesh Pet Association',
  siteTagline: null,
  organizationName: 'Bangladesh Pet Association',
  officialPhone: null,
  supportPhone: null,
  emergencyPhone: null,
  whatsappNumber: null,
  generalEmail: null,
  supportEmail: null,
  officeHours: null,
  officeAddress: null,
  addressLine1: null,
  addressLine2: null,
  area: null,
  city: null,
  postalCode: null,
  country: null,
  mapEmbedUrl: null,
  mapLink: null,
  primaryLogoUrl: null,
  secondaryLogoUrl: null,
  faviconUrl: null,
  defaultMetaTitle: null,
  defaultMetaDescription: null,
  facebookUrl: null,
  youtubeUrl: null,
  linkedinUrl: null,
  registrationErrorTitle: 'Online registration temporarily unavailable',
  registrationErrorMessage:
    'Online registration/payment is temporarily unavailable. Please call BPA support for assistance.',
  emergencyNotice: null,
};

let _cached: PublicSiteSettings | null = null;
let _cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getPublicSiteSettings(fetchOptions?: RequestInit): Promise<PublicSiteSettings> {
  // Return cache if fresh (client-side only)
  if (typeof window !== 'undefined' && _cached && Date.now() - _cacheTime < CACHE_TTL) {
    return _cached;
  }
  try {
    const res = await apiFetch<PublicSiteSettings>('/public/site-settings', fetchOptions);
    const settings = { ...DEFAULT_SETTINGS, ...res.data };
    if (typeof window !== 'undefined') {
      _cached = settings;
      _cacheTime = Date.now();
    }
    return settings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** Build a single-line formatted address from structured fields. Returns null if no address data. */
export function formatAddress(s: PublicSiteSettings): string | null {
  const parts = [
    s.addressLine1,
    s.addressLine2,
    [s.area, s.city, s.postalCode].filter(Boolean).join(', '),
    s.country,
  ].filter(Boolean);
  if (parts.length > 0) return parts.join(', ');
  return s.officeAddress ?? null;
}

/** Return address as an array of display lines. Returns [] if no data. */
export function addressLines(s: PublicSiteSettings): string[] {
  if (s.addressLine1 || s.addressLine2 || s.area || s.city) {
    const lines: string[] = [];
    if (s.addressLine1) lines.push(s.addressLine1);
    if (s.addressLine2) lines.push(s.addressLine2);
    const cityLine = [s.area, s.city, s.postalCode].filter(Boolean).join(', ');
    if (cityLine) lines.push(cityLine);
    if (s.country) lines.push(s.country);
    return lines;
  }
  if (s.officeAddress) return s.officeAddress.split('\n').map(l => l.trim()).filter(Boolean);
  return [];
}
