// Types matching the GET /api/v1/me/dashboard response shape exactly

export interface ApiUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  memberId: string;
  role: string;
  status: string;
  joinedAt: string;
  profileCompletion: number;
}

export interface ApiMembership {
  purchaseId: string;
  tierName: string;
  tierSlug: string;
  status: string;
  amountBdt: number;
  startedAt: string | null;
  expiresAt: string | null;
  renewalDate: string | null;
  canUpgrade: boolean;
  petLimit: number;
  cardNumber: string | null;
  cardStatus: string | null;
  cardQrToken: string | null;
  verifyUrl: string | null;
  preferredZone: string | null;
}

export interface ApiPetItem {
  id: string;
  name: string;
  petType: string;
  gender: string;
  breed: string | null;
  approxAge: number | null;
  isActive: boolean;
}

export interface ApiPets {
  total: number;
  items: ApiPetItem[];
}

export interface ApiBookingItem {
  id: string;
  bookingNumber: string;
  campaignTitle: string;
  campaignSlug: string;
  sessionDate: string;
  petCount: number;
  status: string;
  paymentStatus: string | null;
  totalAmountBdt: number;
  hasCertificate: boolean;
  certificateNumber: string | null;
  verifyToken: string | null;
  createdAt: string;
}

export interface ApiBookings {
  total: number;
  upcoming: number;
  latest: ApiBookingItem[];
}

export interface ApiContributionItem {
  id: string;
  contributionNumber: string;
  amountBdt: number;
  status: string;
  planTitle: string;
  zoneName: string;
  zoneSlug: string;
  createdAt: string;
}

export interface ApiContributions {
  totalAmount: number;
  totalCount: number;
  paidCount: number;
  pendingCount: number;
  latest: ApiContributionItem[];
  byZone: Array<{ zoneName: string; amount: number; count: number }>;
}

export interface ApiCarePartnerCard {
  cardId: string;
  cardNumber: string;
  status: string;
  qrToken: string;
  verifyUrl: string;
  issuedAt: string | null;
  expiresAt: string | null;
  zone: string;
  zoneSlug: string;
}

export interface ApiImpact {
  score: number;
  vaccinatedPets: number;
  supportedAnimals: number;
  certificatesIssued: number;
  campaignsParticipated: number;
  contributionsMade: number;
}

export interface ApiDocument {
  id: string;
  type: string;
  title: string;
  reference: string;
  issuedAt: string;
  downloadUrl: string | null;
  verifyUrl: string | null;
}

export interface ApiNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionUrl: string | null;
}

export interface ApiTransparency {
  totalRaisedBdt: number;
  totalContributors: number;
  userContributionShare: number;
  activeZones: number;
  totalZones: number;
  latestReportTitle: string | null;
  latestReportSlug: string | null;
  latestReportPublishedAt: string | null;
}

export interface ApiActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  referenceNumber: string | null;
  occurredAt: string;
}

export interface ApiDashboard {
  user: ApiUser;
  membership: ApiMembership | null;
  pets: ApiPets;
  bookings: ApiBookings;
  contributions: ApiContributions;
  carePartnerCard: ApiCarePartnerCard | null;
  impact: ApiImpact;
  documents: ApiDocument[];
  notifications: ApiNotification[];
  transparency: ApiTransparency;
  recentActivities: ApiActivity[];
}
