import type { ApiDashboard } from './api.types';
import type {
  DashboardData,
  DashboardKpi,
  DashboardMembership,
  DashboardPet,
  DashboardBooking,
  DashboardContribution,
  DashboardCareCard,
  DashboardImpact,
  DashboardDocument,
  DashboardNotification,
  TransparencyUpdate,
  ActivityItem,
  AchievementBadge,
  MembershipStatus,
  CareCardStatus,
  BookingStatus,
  ActivityType,
  DocumentType,
} from './types';

function normalizeMembershipStatus(status: string): MembershipStatus {
  if (status === 'paid' || status === 'active') return 'active';
  if (status === 'expired') return 'expired';
  if (status === 'pending_payment' || status === 'pending') return 'pending';
  return 'none';
}

function normalizeCareCardStatus(status: string): CareCardStatus {
  const valid: CareCardStatus[] = ['active', 'pending', 'expired', 'revoked'];
  return valid.includes(status as CareCardStatus) ? (status as CareCardStatus) : 'pending';
}

function normalizePaymentStatus(status: string | null): 'paid' | 'pending' | 'failed' {
  if (status === 'success' || status === 'paid') return 'paid';
  if (status === 'failed' || status === 'cancelled') return 'failed';
  return 'pending';
}

function normalizeBookingStatus(status: string): BookingStatus {
  const valid: BookingStatus[] = [
    'pending_payment', 'paid', 'checked_in', 'vaccinated',
    'certificate_issued', 'completed', 'no_show', 'cancelled',
  ];
  return valid.includes(status as BookingStatus) ? (status as BookingStatus) : 'pending_payment';
}

function normalizeActivityType(type: string): ActivityType {
  const valid: ActivityType[] = [
    'campaign_registered', 'payment_submitted', 'payment_verified',
    'pet_vaccinated', 'certificate_issued', 'membership_purchased', 'donation_made',
  ];
  return valid.includes(type as ActivityType) ? (type as ActivityType) : 'campaign_registered';
}

function normalizeNotifType(type: string): DashboardNotification['type'] {
  const valid = ['payment_pending', 'vaccine_due', 'membership_renewal', 'certificate_ready', 'campaign_update'];
  return valid.includes(type) ? (type as DashboardNotification['type']) : 'campaign_update';
}

function normalizeDocType(type: string): DocumentType {
  const valid: DocumentType[] = [
    'membership_card', 'vaccination_certificate', 'payment_receipt',
    'validation_slip', 'care_partner_card',
  ];
  return valid.includes(type as DocumentType) ? (type as DocumentType) : 'payment_receipt';
}

const STATIC_BADGES: AchievementBadge[] = [
  { id: 'first_pet', title: 'First Pet', description: 'Registered your first pet', icon: '🐾', earned: false },
  { id: 'first_campaign', title: 'Campaign Pioneer', description: 'Joined your first vaccination campaign', icon: '💉', earned: false },
  { id: 'care_partner', title: 'Care Partner', description: 'Became a Community Care Partner', icon: '💚', earned: false },
  { id: 'impact_maker', title: 'Impact Maker', description: 'Made your first community contribution', icon: '🌟', earned: false },
  { id: 'community_champion', title: 'Community Champion', description: 'Active in 3+ vaccination campaigns', icon: '🏆', earned: false },
  { id: 'pet_guardian', title: 'Pet Guardian', description: 'Vaccinated 5+ pets through BPA', icon: '🛡️', earned: false },
];

export function adaptDashboard(api: ApiDashboard): DashboardData {
  const { user, membership, pets, bookings, contributions, carePartnerCard, impact, documents, notifications, transparency, recentActivities } = api;

  const membershipStatus: MembershipStatus = membership
    ? normalizeMembershipStatus(membership.status)
    : 'none';

  const kpi: DashboardKpi = {
    membershipStatus,
    totalPets: pets.total,
    activeBookings: bookings.upcoming,
    totalContributions: contributions.totalAmount,
    certificates: impact.certificatesIssued,
    impactScore: impact.score,
  };

  const membershipData: DashboardMembership | null = membership
    ? {
        tier: membership.tierName as DashboardMembership['tier'] ?? 'None',
        status: membershipStatus,
        memberNumber: membership.cardNumber ?? membership.purchaseId.slice(0, 8).toUpperCase(),
        validFrom: membership.startedAt ?? new Date().toISOString(),
        validUntil: membership.expiresAt ?? new Date().toISOString(),
        benefits: [],
        zonePreference: membership.preferredZone ?? 'All Zones',
      }
    : null;

  const petsData: DashboardPet[] = pets.items.map((p) => ({
    id: p.id,
    name: p.name,
    petType: (p.petType.toLowerCase() as DashboardPet['petType']) ?? 'other',
    breed: p.breed,
    gender: p.gender,
    approxAge: p.approxAge,
    photoUrl: null,
  }));

  const bookingsData: DashboardBooking[] = bookings.latest.map((b) => ({
    id: b.id,
    bookingNumber: b.bookingNumber,
    campaignTitle: b.campaignTitle,
    campaignSlug: b.campaignSlug,
    sessionDate: b.sessionDate,
    petCount: b.petCount,
    status: normalizeBookingStatus(b.status),
    paymentStatus: normalizePaymentStatus(b.paymentStatus),
    hasCertificate: b.hasCertificate,
    totalAmountBdt: b.totalAmountBdt,
  }));

  const contributionsData: DashboardContribution[] = contributions.latest.map((c) => ({
    id: c.id,
    contributionNumber: c.contributionNumber,
    amountBdt: c.amountBdt,
    status: c.status as DashboardContribution['status'] ?? 'pending_payment',
    zoneName: c.zoneName,
    planTitle: c.planTitle,
    createdAt: c.createdAt,
  }));

  const careCardData: DashboardCareCard | null = carePartnerCard
    ? {
        cardId: carePartnerCard.cardId,
        cardNumber: carePartnerCard.cardNumber,
        status: normalizeCareCardStatus(carePartnerCard.status),
        zoneName: carePartnerCard.zone,
        zoneSlug: carePartnerCard.zoneSlug,
        issuedAt: carePartnerCard.issuedAt ?? new Date().toISOString(),
        expiresAt: carePartnerCard.expiresAt ?? new Date().toISOString(),
        memberName: user.name,
        verifyUrl: carePartnerCard.verifyUrl,
      }
    : null;

  const badges: AchievementBadge[] = STATIC_BADGES.map((badge) => {
    let earned = false;
    if (badge.id === 'first_pet') earned = pets.total > 0;
    else if (badge.id === 'first_campaign') earned = bookings.total > 0;
    else if (badge.id === 'care_partner') earned = !!carePartnerCard;
    else if (badge.id === 'impact_maker') earned = contributions.totalCount > 0;
    else if (badge.id === 'community_champion') earned = impact.campaignsParticipated >= 3;
    else if (badge.id === 'pet_guardian') earned = impact.vaccinatedPets >= 5;
    return { ...badge, earned };
  });

  const impactData: DashboardImpact = {
    vaccinatedPets: impact.vaccinatedPets,
    supportedAnimals: impact.supportedAnimals,
    volunteerHours: 0,
    impactScore: impact.score,
    badges,
  };

  const documentsData: DashboardDocument[] = documents.map((d) => ({
    id: d.id,
    title: d.title,
    type: normalizeDocType(d.type),
    issuedAt: d.issuedAt,
    downloadUrl: d.downloadUrl,
    verifyUrl: d.verifyUrl,
  }));

  const notificationsData: DashboardNotification[] = notifications.map((n) => ({
    id: n.id,
    type: normalizeNotifType(n.type),
    title: n.title,
    message: n.message,
    priority: n.priority,
    actionUrl: n.actionUrl ?? undefined,
  }));

  const transparencyData: TransparencyUpdate = {
    totalFundBdt: 30_000_000,
    collectedBdt: transparency.totalRaisedBdt,
    activeZones: transparency.activeZones,
    totalZones: Math.max(transparency.totalZones, 1),
    lastUpdated: transparency.latestReportPublishedAt ?? new Date().toISOString(),
  };

  const activityData: ActivityItem[] = recentActivities.map((a) => ({
    id: a.id,
    type: normalizeActivityType(a.type),
    title: a.title,
    description: a.description,
    createdAt: a.occurredAt,
    referenceNumber: a.referenceNumber ?? undefined,
  }));

  return {
    kpi,
    membership: membershipData,
    pets: petsData,
    bookings: bookingsData,
    contributions: contributionsData,
    careCard: careCardData,
    impact: impactData,
    documents: documentsData,
    notifications: notificationsData,
    transparency: transparencyData,
    activity: activityData,
    profileCompletion: user.profileCompletion,
    joinedAt: user.joinedAt,
  };
}
