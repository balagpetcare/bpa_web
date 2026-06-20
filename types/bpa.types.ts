// ─── Pagination ──────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
}

// ─── News ────────────────────────────────────────────────────────

export interface NewsTag {
  id: string;
  name: string;
  slug: string;
}

export interface NewsListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  authorName: string;
  categoryName: string | null;
  tags: NewsTag[];
  status: string;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewsArticle extends NewsListItem {
  body: string;
  coverImageId: string | null;
  authorId: string;
  categoryId: string | null;
}

// ─── Events ──────────────────────────────────────────────────────

export interface EventListItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImageUrl: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
  status: string;
  capacity: number | null;
  registrationCount: number;
  isPaid: boolean;
  fee: string | null;
  createdAt: string;
  updatedAt: string;
}

// EventDetail is identical to EventListItem — both endpoints return the same shape
export type EventDetail = EventListItem;

// ─── Committee ───────────────────────────────────────────────────

export interface CommitteeMember {
  id: string;
  name: string;
  designation: string;
  bio: string | null;
  photoUrl: string | null;
  email: string | null;
  phone: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── SEO ─────────────────────────────────────────────────────────

export interface SeoData {
  id: string;
  route: string;
  title: string | null;
  description: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageUrl: string | null;
  schemaJson: Record<string, unknown> | null;
  updatedAt: string;
}

// ─── Contact form ────────────────────────────────────────────────

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

// ─── Volunteer form ──────────────────────────────────────────────

export interface VolunteerFormData {
  name: string;
  email: string;
  phone?: string;
  areaOfInterest?: string;
  availability?: string;
  message?: string;
}

// ─── Campaigns ───────────────────────────────────────────────────

export type CampaignType = 'vaccination' | 'deworming' | 'microchip' | 'health_camp' | 'spay_neuter';
export type CampaignStatus = 'draft' | 'published' | 'registration_open' | 'registration_closed' | 'completed' | 'cancelled';
export type CampaignMediaRole = 'hero' | 'thumbnail' | 'mobile_banner' | 'gallery';

export interface CampaignMedia {
  id: string;
  campaignId: string;
  mediaFileId: string;
  role: CampaignMediaRole;
  sortOrder: number;
  altText: string | null;
  createdAt: string;
  mediaFile: { id: string; url: string; mimeType: string };
}
export type PetType = 'dog' | 'cat' | 'bird' | 'rabbit' | 'guinea_pig' | 'fish' | 'reptile' | 'other';
export type PetGender = 'male' | 'female' | 'unknown';
export type CampaignRegistrationStatus = 'pending_payment' | 'paid' | 'checked_in' | 'vaccinated' | 'certificate_issued' | 'completed' | 'no_show' | 'cancelled';

export interface CampaignVenue {
  id: string;
  name: string;
  address: string | null;
  googleMapsUrl: string | null;
  latitude: string | null;
  longitude: string | null;
  zone: { id: string; name: string; cityCorporation: { id: string; name: string } } | null;
}

export interface CampaignSession {
  id: string;
  campaignId: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  isActive: boolean;
  notes: string | null;
  venue: CampaignVenue;
}

export interface CampaignService {
  id: string;
  name: string;
  description: string | null;
  isRequired: boolean;
  sortOrder: number;
  priceBdt: number | null;
  vaccineCatalog: {
    id: string;
    name: string;
    description: string | null;
    species: string;
    standardIntervalDays: number | null;
    manufacturer: string | null;
  } | null;
}

export interface CampaignListItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  campaignType: CampaignType;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  registrationOpenAt: string | null;
  registrationCloseAt: string | null;
  /** Prisma Decimal serialized as string — always use safeNumber() before arithmetic */
  basePriceBdt: string | number;
  maxPetsPerBooking: number;
  isFeatured: boolean;
  coverImage: { id: string; url: string; altText: string | null } | null;
  media?: Pick<CampaignMedia, 'id' | 'role' | 'sortOrder' | 'altText' | 'mediaFile'>[];
  /** Lightweight service prices included in list for discount calculation */
  services?: { id: string; priceBdt: number | null }[];
  _count: { sessions: number; services: number };
  createdAt: string;
  updatedAt: string;
}

export interface CampaignFaqItem {
  question: string;
  answer: string;
}

export interface CampaignFaq {
  id: string;
  campaignId: string;
  questionEn: string;
  questionBn: string | null;
  answerEn: string;
  answerBn: string | null;
  category: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignDetail extends CampaignListItem {
  sessions: CampaignSession[];
  services: CampaignService[];
  media: CampaignMedia[];
  allowedPetTypes: string[];
  termsAndConditions: string | null;
  faq: CampaignFaqItem[] | null;
}

export interface PetBooking {
  id: string;
  petId: string;
  status: CampaignRegistrationStatus;
  qrToken: string | null;
  checkedInAt: string | null;
  pet: { id: string; name: string; petType: PetType; gender: PetGender; breed: string | null };
  services: { id: string; campaignServiceId: string; administered: boolean; campaignService: { id: string; name: string } }[];
}

export interface CampaignRegistration {
  id: string;
  bookingNumber: string;
  campaignId: string;
  sessionId: string;
  ownerId: string;
  status: CampaignRegistrationStatus;
  totalAmountBdt: string;
  isGuest: boolean;
  notes: string | null;
  createdAt: string;
  campaign: { id: string; title: string; slug: string; startDate: string; endDate: string };
  session: CampaignSession;
  owner: { id: string; ownerName: string; mobile: string; email: string | null };
  petBookings: PetBooking[];
  payment: { id: string; status: string; amount: number } | null;
}

export interface CampaignWaitlistEntry {
  id: string;
  campaignId: string;
  sessionId: string;
  ownerId: string;
  petCount: number;
  position: number;
  status: 'waiting' | 'promoted' | 'expired' | 'cancelled';
  expiresAt: string | null;
  createdAt: string;
}

export interface CertificateVerification {
  id: string;
  certificateNumber: string;
  verifyToken: string;
  issuedAt: string;
  supersededAt: string | null;
  petBooking: {
    id: string;
    pet: { id: string; name: string; petType: PetType; breed: string | null };
    session: { sessionDate: string; venue: CampaignVenue };
    registration: { owner: { ownerName: string; mobile: string } };
  };
  campaign: { id: string; title: string };
  services: { name: string; administeredAt: string; nextDueDate: string | null }[];
}

// Guest pet creation
export interface GuestPet {
  name: string;
  petType: PetType;
  gender: PetGender;
  approxAge?: number;
  breed?: string;
  color?: string;
  weightKg?: number;
}

export interface GuestPetBatchResponse {
  ownerId: string;
  petIds: string[];
}

// Registration payload
export interface RegisterCampaignPayload {
  campaignId: string;
  sessionId: string;
  ownerName: string;
  mobile: string;
  email?: string;
  address?: string;
  petIds: string[];
  notes?: string;
}

export interface RegisterResponse {
  registration: CampaignRegistration;
  paymentUrl: string | null;
  isFree: boolean;
  paymentGatewayUnavailable?: boolean;
  paymentMode?: 'MANUAL_FALLBACK' | 'PAYMENT_INIT_FAILED';
}

// Waitlist payload
export interface JoinWaitlistPayload {
  campaignId: string;
  sessionId: string;
  ownerName: string;
  mobile: string;
  email?: string;
  petCount: number;
}

// ─── Membership form ─────────────────────────────────────────────

export interface MembershipFormData {
  name: string;
  email: string;
  phone?: string;
  membershipType: 'regular' | 'student' | 'corporate';
  message?: string;
}

// Homepage CMS
export interface HomepageMediaRef {
  id: string;
  url: string;
  mimeType: string;
  altText: string | null;
}

export interface HeroSlide {
  id: string;
  locale: string;
  title: string;
  badgeText: string | null;
  eyebrow: string | null;
  headline: string;
  body: string | null;
  campaignTag: string | null;
  status: string;
  isActive: boolean;
  mediaType: 'image' | 'video';
  overlayPosition: 'left' | 'center' | 'right';
  ctaType: 'none' | 'internal' | 'external';
  ctaLabel: string | null;
  ctaHref: string | null;
  ctaTarget: '_self' | '_blank';
  secondaryCtaType: 'none' | 'internal' | 'external';
  secondaryCtaLabel: string | null;
  secondaryCtaHref: string | null;
  secondaryCtaTarget: '_self' | '_blank';
  desktopImage: HomepageMediaRef;
  mobileImage: HomepageMediaRef | null;
  video: HomepageMediaRef | null;
  stats: Array<{ label: string; value: string }>;
  countdownLabel: string | null;
  countdownTargetAt: string | null;
  startAt: string | null;
  endAt: string | null;
  sortOrder: number;
}

export type HomepageSectionType =
  | 'hero'
  | 'stats'
  | 'mission'
  | 'campaigns'
  | 'news'
  | 'events'
  | 'vision'
  | 'committee'
  | 'cta'
  | 'partners'
  | 'custom';

export interface HomepageSectionItem {
  id: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  href: string | null;
  media: HomepageMediaRef | null;
  metadata: Record<string, unknown> | null;
  isVisible: boolean;
  sortOrder: number;
}

export interface HomepageSection {
  id: string;
  type: HomepageSectionType;
  source: 'manual' | 'automatic' | 'static';
  title: string | null;
  eyebrow: string | null;
  subtitle: string | null;
  body: string | null;
  ctaType: 'none' | 'internal' | 'external';
  ctaLabel: string | null;
  ctaHref: string | null;
  ctaTarget: '_self' | '_blank';
  itemLimit: number;
  content: Record<string, unknown> | null;
  isVisible: boolean;
  sortOrder: number;
  items: HomepageSectionItem[];
  dynamicItems?: unknown;
}

export interface Partner {
  id: string;
  name: string;
  description: string | null;
  logo: HomepageMediaRef | null;
  url: string | null;
  tier: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface FooterLink {
  label: string;
  href: string;
  target: '_self' | '_blank';
  sortOrder: number;
  isVisible: boolean;
}

export interface FooterLinkGroup {
  title: string;
  sortOrder: number;
  isVisible: boolean;
  links: FooterLink[];
}

export interface FooterConfig {
  locale: string;
  brandName: string | null;
  brandText: string | null;
  logo: HomepageMediaRef | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  copyrightText: string | null;
  socialLinks: Array<{ label: string; href: string }> | null;
  groups: FooterLinkGroup[];
}

// ─── Community Pet Care (Phase 5) ────────────────────────────────

export interface CommunityZonePublic {
  id: string;
  name: string;
  nameBn?: string | null;
  slug: string;
  description: string | null;
  city: string;
  district: string;
  division: string;
  targetContributors: number;
  currentContributors: number;
  targetAmountBdt: string;
  currentAmountBdt: string;
  clinicAddress: string | null;
  clinicPhone: string | null;
  mapEmbedUrl: string | null;
  status: 'active' | 'inactive' | 'coming_soon';
  // Phase 1: clinic expansion fields
  clinicStatus?: 'planned' | 'priority' | 'in_progress' | 'active' | 'paused' | null;
  priorityOrder?: number | null;
  targetMembers?: number | null;
  expectedLaunchNote?: string | null;
  publicVisible?: boolean;
  // Phase 1: computed demand stats from membership purchases
  paidMemberCount?: number;
  totalPurchaseCount?: number;
  rank?: number;
  coverImage: { url: string; altText: string | null } | null;
}

export interface ContributionPlanPublic {
  id: string;
  title: string;
  slug: string;
  amountBdt: string;
  currency: string;
  description: string | null;
  benefitsSummaryJson: string[] | null;
  legalDisclaimerText: string | null;
}

export interface CareFundOverview {
  totalContributors: number;
  totalAmountBdt: string;
  totalActiveCards: number;
  totalRaised?: number | string | null;
  totalPetsSupported?: number | null;
  zones: {
    id: string;
    name: string;
    slug: string;
    currentContributors: number;
    targetContributors: number;
    currentAmountBdt: string;
    targetAmountBdt: string;
    progressPercent: number;
  }[];
}

export interface TransparencySummary {
  totalCollectedBdt: number;
  totalContributors: number;
  totalPublishedSpentBdt: number;
  totalPublishedReportCollectedBdt: number;
  publishedReportCount: number;
  balanceBdt: number;
  balanceLabel: string;
  zones: {
    id: string;
    name: string;
    slug: string;
    targetContributors: number;
    currentContributors: number;
    targetAmountBdt: number;
    currentAmountBdt: number;
    progressPercent: number;
  }[];
}

export interface InitiateContributionPayload {
  planId: string;
  zoneId: string;
  contributorName: string;
  contributorMobile: string;
  contributorEmail?: string;
  contributorAddress?: string;
  isAnonymous?: boolean;
}

export interface InitiateContributionResponse {
  contributionId: string;
  contributionNumber: string;
  paymentUrl: string;
}

export interface ContributionStatusPublic {
  contributionId: string;
  contributionNumber: string;
  status: 'pending_payment' | 'paid' | 'refunded' | 'cancelled';
  amountBdt: string;
  planTitle: string;
  zoneName: string;
  contributorName: string;
  isAnonymous: boolean;
  cardNumber: string | null;
  cardStatus: string | null;
  disclaimer: string | null;
}

export interface CareCardVerifyResult {
  valid: boolean;
  cardNumber: string | null;
  contributorName: string | null;
  zoneName: string | null;
  planTitle: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  status: string | null;
  disclaimer: string;
}

// ─── Public Contributors & Impact ────────────────────────────────

export interface PublicContributor {
  id: string;
  contributionNumber: string;
  displayName: string;
  isAnonymous: boolean;
  zoneName: string;
  createdAt: string;
}

export interface PublicImpactStats {
  strayAnimalsSupported: number;
  animalsVaccinated: number;
  rescueCasesSupported: number;
  feedingProgramsRun: number;
  lowIncomeFamiliesAssisted: number;
  totalContributors: number;
  totalZones: number;
}

// ─── Enterprise Content (Phase 4) ────────────────────────────────

export interface CarePartnerBenefit {
  id: string;
  titleEn: string;
  titleBn: string;
  descriptionEn: string | null;
  descriptionBn: string | null;
  icon: string | null;
  category: string;
  sortOrder: number;
  isActive: boolean;
}

export interface SocialImpactProgram {
  id: string;
  titleEn: string;
  titleBn: string;
  descriptionEn: string | null;
  descriptionBn: string | null;
  icon: string | null;
  impactType: string;
  sortOrder: number;
  isActive: boolean;
}

export interface RoadmapItem {
  id: string;
  titleEn: string;
  titleBn: string;
  descriptionEn: string | null;
  descriptionBn: string | null;
  phase: string | null;
  year: number | null;
  status: 'PLANNED' | 'IN_PROGRESS' | 'LIVE';
  sortOrder: number;
  isActive: boolean;
}

export interface DiagnosticCenterService {
  id: string;
  titleEn: string;
  titleBn: string;
  descriptionEn: string | null;
  descriptionBn: string | null;
  icon: string | null;
  category: string;
  sortOrder: number;
  isActive: boolean;
}

export interface PetCensusPayload {
  ownerName: string;
  mobile: string;
  email?: string;
  address?: string;
  zoneId?: string;
  area?: string;
  petType: 'cat' | 'dog' | 'bird' | 'other';
  petCount: number;
  breed?: string;
  vaccinationInterest: boolean;
  communityClinicInterest: boolean;
  communityPetShopInterest: boolean;
  carePartnerInterest: boolean;
  notes?: string;
  consent: true;
  source: 'PET_CENSUS_2026';
  sourceRoute?: string;
}

export interface PetCensusCampaign {
  active: boolean;
  id?: string;
  title: string;
  description?: string | null;
  status: 'draft' | 'published' | 'registration_open' | 'registration_closed' | 'completed' | 'cancelled';
  registrationStartAt?: string;
  registrationEndAt?: string;
  countdownTargetAt?: string | null;
  targetSubmissions: number;
  currentSubmissions: number;
  settings?: Record<string, unknown> | null;
}

export interface TransparencyReportPublic {
  id: string;
  title: string;
  slug: string;
  reportType: string;
  periodStart: string;
  periodEnd: string;
  totalCollectedBdt: string;
  totalSpentBdt: string;
  balanceBdt: string;
  summaryMd: string | null;
  bodyMd?: string | null;
  attachmentUrl: string | null;
  coverImage?: { id: string; url: string; altText: string | null } | null;
  publishedAt: string | null;
}

export interface PublicHomepagePayload {
  homepage: {
    id: string;
    locale: string;
    title: string | null;
    description: string | null;
    status: string;
    settings: Record<string, unknown> | null;
    publishedAt: string | null;
    updatedAt: string;
  } | null;
  sections: HomepageSection[];
  heroSlides: HeroSlide[];
  partners: Partner[];
  footer: FooterConfig | null;
}
