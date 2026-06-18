import { apiFetch } from '@/lib/api';

export interface DonationPurpose {
  id: string;
  titleEn: string;
  titleBn?: string;
  slug: string;
  shortDescriptionEn?: string;
  shortDescriptionBn?: string;
  icon?: string;
  imageUrl?: string;
  suggestedAmounts?: any;
  impactTextEn?: string;
  impactTextBn?: string;
}

export interface DonationCampaign {
  id: string;
  titleEn: string;
  titleBn?: string;
  slug: string;
  descriptionEn?: string;
  descriptionBn?: string;
  goalAmount: string;
  raisedAmount: string;
  featuredImageUrl?: string;
  videoUrl?: string;
  status: string;
  allowCustomAmount: boolean;
  defaultAmount?: string;
  purposeId?: string;
  purpose?: DonationPurpose;
}

export interface DonationImpactStory {
  id: string;
  titleEn: string;
  titleBn?: string;
  slug: string;
  storyType: string;
  location?: string;
  animalType?: string;
  shortDescriptionEn?: string;
  fullStoryEn: string;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  costUsed?: string;
  storyDate?: string;
  campaign?: DonationCampaign;
  purpose?: DonationPurpose;
}

export interface DonorWallEntry {
  id: string;
  donorName: string;
  amount: string;
  currency: string;
  isAnonymous: boolean;
  message?: string;
  createdAt: string;
  campaign?: { titleEn: string };
  purpose?: { titleEn: string };
}

export interface DonationPageSettings {
  heroTitleEn: string;
  heroSubtitleEn?: string;
  heroImageUrl?: string;
  primaryCtaTextEn?: string;
  secondaryCtaTextEn?: string;
  showImpactCounters: boolean;
  showPurposeCards: boolean;
  showCampaigns: boolean;
  showImpactStories: boolean;
  showDonorWall: boolean;
  showTransparency: boolean;
  showQrSection: boolean;
  faqJson?: any;
}

export interface DonationTransparencyReport {
  id: string;
  reportMonth: string;
  titleEn: string;
  totalReceived: string;
  totalUsed: string;
  vaccinationExpense: string;
  foodExpense: string;
  treatmentExpense: string;
  pdfUrl?: string;
}

export interface DonationPageData {
  purposes: DonationPurpose[];
  campaigns: DonationCampaign[];
  settings: DonationPageSettings;
  donors: DonorWallEntry[];
  stories: DonationImpactStory[];
  transparencySummary?: DonationTransparencyReport;
}

export async function getDonationPageData(options?: RequestInit) {
  const res = await apiFetch('/public/donations/page-data', options);
  return res.data as DonationPageData;
}

export async function getDonationCampaign(slug: string, options?: RequestInit) {
  const res = await apiFetch(`/public/donations/campaigns/${slug}`, options);
  return res.data as DonationCampaign;
}

export async function initializeDonation(data: {
  amount: number;
  currency?: string;
  purposeId?: string;
  purposeSlug?: string;
  campaignId?: string;
  campaignSlug?: string;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  donorCountry?: string;
  donorType?: 'INDIVIDUAL' | 'ORGANIZATION' | 'ANONYMOUS';
  organizationName?: string;
  isAnonymous?: boolean;
  showOnDonorWall?: boolean;
  message?: string;
  qrSlug?: string;
  source?: string;
}) {
  const res = await apiFetch('/public/donations/initiate', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data as { referenceNo: string; paymentUrl: string };
}

export async function getDonationStatus(referenceNo: string, options?: RequestInit) {
  const res = await apiFetch(`/public/donations/status/${referenceNo}`, options);
  return res.data as {
    referenceNo: string;
    status: string;
    amount: number;
    currency: string;
    createdAt: string;
    paidAt?: string;
    donorName: string;
    campaignTitle: string | null;
    purposeTitle: string | null;
  };
}

export interface DonationReceipt {
  referenceNo: string;
  status: string;
  amount: number;
  currency: string;
  createdAt: string;
  paidAt?: string;
  donorName: string;
  isAnonymous: boolean;
  donorEmail?: string;
  donorPhone?: string;
  donorCountry?: string;
  organizationName?: string;
  campaignTitle: string | null;
  purposeTitle: string | null;
  gatewayTransactionId?: string;
  paymentProvider?: string;
  verifyUrl: string;
  supportEmail: string;
  supportPhone: string;
  policy: string;
}

export async function getDonationReceipt(referenceNo: string, options?: RequestInit) {
  const res = await apiFetch(`/public/donations/receipt/${referenceNo}`, options);
  return res.data as DonationReceipt;
}

