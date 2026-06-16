import type { MembershipOverview, MembershipTierPublic } from './api/community-membership';

export interface NormalizedProgram {
  nameEn: string;
  nameBn: string;
  offerStartAt: Date | null;
  offerEndAt: Date | null;
  isOfferActive: boolean;
  isOfferExpired: boolean;
  isOfferFuture: boolean;
  offerBannerEn: string;
  offerBannerBn: string;
  priceAfterOffer: 'USE_REGULAR_PRICE' | 'HIDE_TIER' | 'SHOW_EXPIRED_MESSAGE';
  cardValidityLabel: string;
  isActive: boolean;
}

export interface NormalizedTier extends MembershipTierPublic {
  displayPrice: number;
  strikePrice: number | null;
  isOfferActiveForTier: boolean;
  petLimitLabel: string;
  validityLabel: string;
  savingsBdt: number | null;
  savingsPercent: number | null;
}

export function normalizeProgram(program: MembershipOverview['program']): NormalizedProgram {
  const now = new Date();
  const start = program?.offerStartAt ? new Date(program.offerStartAt) : null;
  const end = program?.offerEndAt ? new Date(program.offerEndAt) : null;

  const isOfferFuture = start ? now < start : false;
  const isOfferExpired = end ? now > end : false;

  // Only offerEndAt gates offer activation. offerStartAt is informational only.
  // We compute independently of backend isOfferActive to handle server-clock skew.
  let isOfferActive = false;
  if (end && now <= end) {
    isOfferActive = true;
  }

  return {
    nameEn: program?.nameEn ?? 'Community Care Partner Card',
    nameBn: program?.nameBn ?? 'কমিউনিটি কেয়ার পার্টনার কার্ড',
    offerStartAt: start,
    offerEndAt: end,
    isOfferActive,
    isOfferExpired,
    isOfferFuture,
    offerBannerEn: program?.offerBannerEn ?? 'Founding Member Offer — Limited Time!',
    offerBannerBn: program?.offerBannerBn ?? 'লঞ্চ অফার: আজই BPA কমিউনিটি কেয়ার পার্টনার কার্ড নিন এবং বিশেষ মূল্যে এক্সক্লুসিভ পেট কেয়ার সুবিধা উপভোগ করুন।',
    priceAfterOffer: (program?.priceAfterOffer as 'USE_REGULAR_PRICE' | 'HIDE_TIER' | 'SHOW_EXPIRED_MESSAGE') ?? 'USE_REGULAR_PRICE',
    cardValidityLabel: program?.cardValidityLabel ?? '5 Years Validity',
    isActive: true, // Defaulting to true as we are seeing it
  };
}

export function normalizeTier(tier: MembershipTierPublic, isProgramOfferActive: boolean): NormalizedTier {
  const launchPrice = Number(tier.launchPriceBdt ?? 0);
  const regularPrice = Number(tier.regularPriceBdt ?? 0);
  
  // A tier has an active offer if:
  // 1. The program offer is active
  // 2. Launch price is lower than regular price
  const isOfferActiveForTier = isProgramOfferActive && launchPrice > 0 && regularPrice > 0 && launchPrice < regularPrice;

  const displayPrice = isOfferActiveForTier ? launchPrice : regularPrice;
  const strikePrice = isOfferActiveForTier ? regularPrice : null;
  
  const savingsBdt = isOfferActiveForTier ? regularPrice - launchPrice : null;
  const savingsPercent = isOfferActiveForTier ? Math.round(((regularPrice - launchPrice) / regularPrice) * 100) : null;

  return {
    ...tier,
    displayPrice,
    strikePrice,
    isOfferActiveForTier,
    petLimitLabel: `${tier.petLimitMin}-${tier.petLimitMax} Pets`,
    validityLabel: tier.validityMonths >= 60 ? '5 Years' : `${tier.validityMonths} Months`,
    savingsBdt,
    savingsPercent,
  };
}

export function normalizeMembershipOverview(overview: MembershipOverview | null) {
  if (!overview) return null;

  const program = normalizeProgram(overview.program);
  const tiers = (overview.tiers ?? []).map(t => normalizeTier(t, program.isOfferActive));

  return {
    ...overview,
    program,
    tiers,
  };
}
