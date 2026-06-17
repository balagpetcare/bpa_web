import { apiFetch, apiPost } from '@/lib/api';

type NumberLike = number | string | null | undefined;

function toSafeNumber(value: NumberLike): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

interface MembershipTierApiBenefit {
  id?: string | null;
  slug?: string | null;
  titleEn?: string | null;
  titleBn?: string | null;
  title?: string | null;
  nameEn?: string | null;
  nameBn?: string | null;
  name?: string | null;
  descriptionEn?: string | null;
  descriptionBn?: string | null;
  description?: string | null;
  icon?: string | null;
}

interface MembershipTierApiResponse {
  id: string;
  nameEn: string;
  nameBn: string;
  slug: string;
  isActive: boolean;
  launchPriceBdt: NumberLike;
  regularPriceBdt: NumberLike;
  currentPriceBdt?: NumberLike;
  isOfferActive: boolean;
  offerRemainingSeconds: number;
  petLimitMin: number;
  petLimitMax: number;
  validityMonths: number;
  badgeTextEn: string | null;
  badgeTextBn: string | null;
  shortDescEn: string | null;
  shortDescBn: string | null;
  fullDescEn: string | null;
  fullDescBn: string | null;
  cardTheme: string | null;
  sortOrder: number;
  benefits: MembershipTierApiBenefit[];
  serviceDiscounts: Array<{
    serviceId: string;
    serviceNameEn: string;
    serviceNameBn: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    minDiscount: number | null;
    maxDiscount: number | null;
  }>;
}

export interface MembershipTierPublic {
  id: string;
  nameEn: string;
  nameBn: string;
  slug: string;
  isActive: boolean;
  launchPriceBdt: number | null;
  regularPriceBdt: number | null;
  currentPriceBdt: number | null;
  isOfferActive: boolean;
  offerRemainingSeconds: number;
  petLimitMin: number;
  petLimitMax: number;
  validityMonths: number;
  badgeTextEn: string | null;
  badgeTextBn: string | null;
  shortDescEn: string | null;
  shortDescBn: string | null;
  fullDescEn: string | null;
  fullDescBn: string | null;
  cardTheme: string | null;
  sortOrder: number;
  benefits: Array<{
    id: string;
    slug: string | null;
    titleEn: string;
    titleBn: string | null;
    title: string;
    nameEn?: string | null;
    nameBn?: string | null;
    name?: string | null;
    descriptionEn: string | null;
    descriptionBn: string | null;
    description: string | null;
    icon: string | null;
  }>;
  serviceDiscounts: Array<{
    serviceId: string;
    serviceNameEn: string;
    serviceNameBn: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    minDiscount: number | null;
    maxDiscount: number | null;
  }>;
}

export interface MembershipOverview {
  program: {
    nameEn: string;
    nameBn: string;
    descriptionEn: string | null;
    descriptionBn: string | null;
    offerStartAt: string | null;
    offerEndAt: string | null;
    priceAfterOffer: string;
    offerBannerEn: string | null;
    offerBannerBn: string | null;
    legalDisclaimer: string | null;
    cardValidityLabel: string | null;
    isOfferActive: boolean;
    offerRemainingSeconds: number;
  } | null;
  tiers: MembershipTierPublic[];
  services: Array<{
    id: string;
    nameEn: string;
    nameBn: string;
    category: string;
    basePriceBdt: number;
    descriptionEn: string | null;
    descriptionBn: string | null;
  }>;
  discounts: Array<{
    id: string;
    tierId: string;
    tierName: string;
    serviceId: string;
    serviceName: string;
    discountType: string;
    discountValue: number;
    minDiscount: number | null;
    maxDiscount: number | null;
  }>;
  benefits: Array<{
    id: string;
    titleEn: string;
    titleBn: string;
    descriptionEn: string | null;
    descriptionBn: string | null;
    icon: string | null;
    tierIds: string[];
  }>;
}

function normalizeTier(tier: MembershipTierApiResponse): MembershipTierPublic {
  const launchPrice = toSafeNumber(tier.launchPriceBdt);
  const regularPrice = toSafeNumber(tier.regularPriceBdt);
  const currentPrice = toSafeNumber(tier.currentPriceBdt);
  return {
    ...tier,
    launchPriceBdt: launchPrice,
    regularPriceBdt: regularPrice,
    currentPriceBdt: currentPrice,
    benefits: (tier.benefits ?? [])
      .map((benefit, index) => {
        const titleEn = benefit.titleEn ?? benefit.title ?? benefit.nameEn ?? benefit.name ?? '';
        const titleBn = benefit.titleBn ?? benefit.nameBn ?? null;
        const descriptionEn = benefit.descriptionEn ?? benefit.description ?? null;
        const descriptionBn = benefit.descriptionBn ?? null;
        const title = titleEn || titleBn || benefit.name || '';
        const id = benefit.id ?? benefit.slug ?? `${index}-${title}`;
        return {
          id,
          slug: benefit.slug ?? null,
          titleEn,
          titleBn,
          title,
          descriptionEn,
          descriptionBn,
          description: descriptionEn ?? descriptionBn ?? null,
          icon: benefit.icon ?? null,
        };
      })
      .filter((benefit) => Boolean((benefit.titleEn || benefit.title || benefit.titleBn || '').trim())),
    serviceDiscounts: (tier.serviceDiscounts ?? []).map((discount) => ({
      ...discount,
      discountValue: Number(discount.discountValue),
      minDiscount: discount.minDiscount === null || discount.minDiscount === undefined ? null : Number(discount.minDiscount),
      maxDiscount: discount.maxDiscount === null || discount.maxDiscount === undefined ? null : Number(discount.maxDiscount),
    })),
  };
}

export interface MfsInstructions {
  bKash: string | null;
  nagad: string | null;
  rocket: string | null;
  accountHolder: string | null;
  instructionsEn: string | null;
  instructionsBn: string | null;
  reference: string;
}

export interface InitiatePurchaseResponse {
  purchaseId: string;
  paymentId: string;
  merchantTxnId: string;
  redirectUrl: string | null;
  amount: number;
  currency: string;
  tierName: string;
  paymentMode?: 'eps' | 'manual';
  mfs?: MfsInstructions;
}

export interface PurchaseStatusCard {
  cardNumber: string;
  status: string;
  qrToken: string | null;
  pdfDocumentKey: boolean;
  downloadToken: string | null;
}

export interface PurchaseStatusResponse {
  id: string;
  status: string;
  memberName: string;
  tierName: string | null;
  tierNameBn: string | null;
  amountBdt: number;
  petLimit: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  purchasedAt: string | null;
  card: PurchaseStatusCard | null;
  pendingUpgrade: {
    upgradeId: string;
    toTierName: string;
    toTierNameBn: string;
    upgradeAmount: number;
  } | null;
  preferredZone: {
    id: string;
    name: string;
    slug: string;
    city: string;
    district: string;
  } | null;
}

export interface ZoneDemandItem {
  id: string;
  name: string;
  nameBn: string | null;
  slug: string;
  city: string;
  district: string;
  status: string;
  clinicStatus: string | null;
  targetMembers: number | null;
  priorityOrder: number | null;
  paidPurchases: number;
  totalPurchases: number;
  activeCards: number;
  totalRevenueBdt: number;
  demandScore: number;
  progressPercent: number | null;
  rank: number;
}

export interface UpgradeQuoteResponse {
  purchaseId: string;
  currentTier: { name: string };
  targetTier: { name: string; slug: string };
  originalPaidAmount: number;
  targetCurrentPrice: number;
  upgradeAmount: number;
  currency: string;
}

export interface UpgradeRequestResponse {
  upgradeId: string;
  paymentId: string;
  merchantTxnId: string;
  redirectUrl: string | null;
  amount: number;
  currency: string;
  paymentMode?: 'eps' | 'manual';
  mfs?: MfsInstructions;
}

export interface MembershipLookupResult {
  purchaseId: string;
  cardNumber: string;
  cardStatus: string;
  memberName: string;
  tierName: string;
  tierNameBn: string;
  tierSlug: string;
  amountBdt: number;
  petLimit: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  purchasedAt: string | null;
}

export function getMembershipOverview(options?: RequestInit): Promise<MembershipOverview> {
  return apiFetch<{ program: MembershipOverview['program']; tiers: MembershipTierApiResponse[]; services: MembershipOverview['services']; discounts: MembershipOverview['discounts']; benefits: MembershipOverview['benefits']; }>('/public/community-membership/overview', options)
    .then((r) => ({
      ...r.data,
      tiers: r.data.tiers.map(normalizeTier),
    }));
}

export function getMembershipTiers(options?: RequestInit): Promise<MembershipTierPublic[]> {
  return apiFetch<MembershipTierApiResponse[]>('/public/community-membership/tiers', options)
    .then((r) => r.data.map(normalizeTier));
}

export function initiateMembershipPurchase(data: {
  tierSlug: string;
  memberName: string;
  memberMobile: string;
  memberEmail?: string;
  memberAddress?: string;
  petCount?: number;
  preferredZoneId?: string;
}): Promise<InitiatePurchaseResponse> {
  return apiPost<InitiatePurchaseResponse>('/public/community-membership/purchase', data)
    .then((r) => r.data);
}

export function getUpgradeQuote(data: {
  purchaseId: string;
  toTierSlug: string;
}): Promise<UpgradeQuoteResponse> {
  return apiPost<UpgradeQuoteResponse>('/public/community-membership/upgrade/quote', data)
    .then((r) => r.data);
}

export function requestUpgrade(data: {
  purchaseId: string;
  toTierSlug: string;
}): Promise<UpgradeRequestResponse> {
  return apiPost<UpgradeRequestResponse>('/public/community-membership/upgrade/request', data)
    .then((r) => r.data);
}

export function lookupMembership(
  data: { token: string } | { cardNumber: string; mobile: string },
): Promise<MembershipLookupResult> {
  return apiPost<MembershipLookupResult>('/public/community-membership/lookup', data)
    .then((r) => r.data);
}

export function submitUpgradeTransaction(data: {
  upgradeId: string;
  provider: string;
  transactionId: string;
}): Promise<{ submitted: boolean; message: string }> {
  return apiPost<{ submitted: boolean; message: string }>('/public/community-membership/upgrade/submit-transaction', data)
    .then((r) => r.data);
}

export function getTierBySlug(slug: string, options?: RequestInit): Promise<MembershipTierPublic> {
  return apiFetch<MembershipTierApiResponse>(`/public/community-membership/tiers/${encodeURIComponent(slug)}`, options)
    .then((r) => normalizeTier(r.data));
}

export function submitTransaction(data: {
  purchaseId: string;
  provider: string;
  transactionId: string;
}): Promise<{ submitted: boolean; message: string }> {
  return apiPost<{ submitted: boolean; message: string }>('/public/community-membership/purchase/submit-transaction', data)
    .then((r) => r.data);
}

export function getPurchaseStatus(purchaseId: string): Promise<PurchaseStatusResponse | null> {
  return apiFetch<PurchaseStatusResponse | null>(`/public/community-membership/purchase/${encodeURIComponent(purchaseId)}/status`)
    .then((r) => r.data);
}

export function getZoneDemand(options?: RequestInit): Promise<ZoneDemandItem[]> {
  return apiFetch<ZoneDemandItem[]>('/public/community-membership/zone-demand', options)
    .then((r) => r.data);
}
