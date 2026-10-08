export type CampaignCategory = 'medical' | 'education' | 'emergency' | 'business' | 'water' | 'environment' | 'community' | 'other';

export type CampaignStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'completed' | 'paused' | 'needs_changes';

export type PaymentStatus = 'completed' | 'failed';

export type PaymentRail = 'telebirr' | 'cbe_birr' | 'bank_card' | 'chapa';

export interface Donation {
  id: string;
  campaignId: string;
  donorId?: string;
  amount: number; // In ETB (Ethiopian Birr)
  donorName: string; // Defaults to "Anonymous"
  message?: string;
  paymentStatus: PaymentStatus;
  paymentRail?: PaymentRail;
  transactionReference?: string;
  createdAt: string; // ISO date string or formatted
  certificateId?: string;
}

export interface CampaignUpdate {
  id: string;
  campaignId: string;
  title: string;
  content: string;
  createdAt: string;
  authorName: string;
  images?: string[];
}

export interface BudgetItem {
  item: string;
  cost: number;
  description?: string;
}

export interface Campaign {
  id: string;
  title: string;
  story: string;
  goalAmount: number; // In ETB
  raisedAmount: number; // In ETB, calculated strictly from completed donations
  creatorName: string;
  organizationId?: string;
  organizationName?: string;
  category: CampaignCategory;
  imageUrl?: string;
  status: CampaignStatus;
  createdAt: string;
  location?: string;
  donationsCount?: number;
  donations?: Donation[];
  verifiedOrganization?: boolean;
  impactMetric?: string;
  beneficiariesTarget?: number;
  budgetBreakdown?: BudgetItem[];
  updates?: CampaignUpdate[];
  serialCode?: string; // e.g. LW-0421
}

export type OrganizationVerificationStatus =
  | 'pending'
  | 'approved'
  | 'needs_changes'
  | 'rejected'
  | 'verified'
  | 'under_review';

export interface OrganizationRepresentative {
  name: string;
  role: string;
  phone: string;
  email?: string;
}

export interface OrganizationBankAccount {
  bank: string;
  accountNumber: string;
  accountName: string;
}

export interface Organization {
  id: string;
  name: string;
  type: 'registered_ngo' | 'charity_foundation' | 'community_coop' | 'faith_based';
  registrationNo: string;
  verified: boolean;
  verificationStatus: OrganizationVerificationStatus;
  foundedYear: number;
  location: string;
  description: string;
  website?: string;
  contactEmail: string;
  contactPhone: string;
  activeProjectsCount: number;
  totalRaised: number;
  totalSupporters: number;
  logoUrl?: string;
  representative?: OrganizationRepresentative;
  bank?: OrganizationBankAccount;
  documents?: string[];
  submittedAt?: string;
  decisionNote?: string;
  userId?: string;
}

export interface ContributionCertificate {
  certificateId: string; // e.g. LW-ETB-004821
  donationId: string;
  campaignId: string;
  campaignTitle: string;
  organizationName: string;
  donorName: string;
  amount: number;
  amountGeEz?: string; // e.g. ፭፻ ብር
  currency: string;
  impactSummary: string;
  location: string;
  issuedAt: string;
  transactionRef: string;
  paymentRail?: PaymentRail;
}

export interface DonorProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  location: string;
  isAnonymousDefault: boolean;
  notifyOnUpdates: boolean;
  totalDonated: number;
  supportedCausesCount: number;
  livesImpactedEstimate: number;
}

export interface VoiceExtractionResult {
  title?: string;
  story?: string;
  goalAmount?: number;
  category?: CampaignCategory;
  creatorName?: string;
  campaignId?: string;
  donationAmount?: number;
  donorName?: string;
  donorMessage?: string;
  rawTranscript: string;
  confidence: number;
}
