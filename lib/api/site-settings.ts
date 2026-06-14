import { apiFetch } from '@/lib/api';

export interface PublicSiteSettings {
  siteName: string;
  siteTagline: string | null;
  organizationName: string;
  officialPhone: string | null;
  supportPhone: string | null;
  supportEmail: string | null;
  officeAddress: string | null;
  primaryLogoUrl: string | null;
  secondaryLogoUrl: string | null;
  faviconUrl: string | null;
  defaultMetaTitle: string | null;
  defaultMetaDescription: string | null;
  facebookUrl: string | null;
  youtubeUrl: string | null;
  linkedinUrl: string | null;
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
  supportEmail: null,
  officeAddress: null,
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
