// ─── Dashboard TypeScript Types ────────────────────────────────────────────

export type MembershipTier = 'Care Partner' | 'Champion' | 'Guardian' | 'None';
export type MembershipStatus = 'active' | 'expired' | 'pending' | 'none';
export type ContributionStatus = 'paid' | 'pending_payment' | 'refunded' | 'cancelled';
export type BookingStatus =
  | 'pending_payment'
  | 'paid'
  | 'checked_in'
  | 'vaccinated'
  | 'certificate_issued'
  | 'completed'
  | 'no_show'
  | 'cancelled';
export type CareCardStatus = 'active' | 'pending' | 'expired' | 'revoked';
export type PetType = 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
export type DocumentType =
  | 'membership_card'
  | 'vaccination_certificate'
  | 'payment_receipt'
  | 'validation_slip'
  | 'care_partner_card';

export interface DashboardMembership {
  tier: MembershipTier;
  status: MembershipStatus;
  memberNumber: string;
  validFrom: string;
  validUntil: string;
  benefits: string[];
  zonePreference: string;
}

export interface DashboardPet {
  id: string;
  name: string;
  petType: PetType;
  breed: string | null;
  gender: string;
  approxAge: number | null;
  photoUrl: string | null;
}

export interface DashboardBooking {
  id: string;
  bookingNumber: string;
  campaignTitle: string;
  campaignSlug: string;
  sessionDate: string;
  petCount: number;
  status: BookingStatus;
  paymentStatus: 'paid' | 'pending' | 'failed';
  hasCertificate: boolean;
  totalAmountBdt: number;
}

export interface DashboardContribution {
  id: string;
  contributionNumber: string;
  amountBdt: number;
  status: ContributionStatus;
  zoneName: string;
  planTitle: string;
  createdAt: string;
}

export interface DashboardCareCard {
  cardId: string;
  cardNumber: string | null;
  status: CareCardStatus;
  zoneName: string;
  zoneSlug: string;
  issuedAt: string;
  expiresAt: string;
  memberName: string;
  verifyUrl: string | null;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
}

export interface DashboardImpact {
  vaccinatedPets: number;
  supportedAnimals: number;
  volunteerHours: number;
  impactScore: number;
  badges: AchievementBadge[];
}

export interface DashboardDocument {
  id: string;
  title: string;
  type: DocumentType;
  issuedAt: string;
  downloadUrl: string | null;
  verifyUrl: string | null;
}

export interface DashboardNotification {
  id: string;
  type: 'payment_pending' | 'vaccine_due' | 'membership_renewal' | 'certificate_ready' | 'campaign_update';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
}

export interface TransparencyUpdate {
  totalFundBdt: number;
  collectedBdt: number;
  activeZones: number;
  totalZones: number;
  lastUpdated: string;
}

export type ActivityType =
  | 'campaign_registered'
  | 'payment_submitted'
  | 'payment_verified'
  | 'pet_vaccinated'
  | 'certificate_issued'
  | 'membership_purchased'
  | 'donation_made';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  createdAt: string;
  referenceNumber?: string;
}

export interface DashboardKpi {
  membershipStatus: MembershipStatus;
  totalPets: number;
  activeBookings: number;
  totalContributions: number;
  certificates: number;
  impactScore: number;
}

export interface DashboardData {
  kpi: DashboardKpi;
  membership: DashboardMembership | null;
  pets: DashboardPet[];
  bookings: DashboardBooking[];
  contributions: DashboardContribution[];
  careCard: DashboardCareCard | null;
  impact: DashboardImpact;
  documents: DashboardDocument[];
  notifications: DashboardNotification[];
  transparency: TransparencyUpdate;
  activity: ActivityItem[];
  profileCompletion: number;
  joinedAt: string;
}
