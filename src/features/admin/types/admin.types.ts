import { Campaign } from '../../campaigns/types/campaign.types';

export type ModerationAction = 'approve' | 'reject' | 'request_changes';

export interface AuditLog {
  id: string;
  action: ModerationAction;
  targetId: string;
  targetTitle: string;
  adminEmail: string;
  reason?: string;
  timestamp: string;
}

export interface AdminStats {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalVolumeETB: number;
  activeFoundations: number;
}

export type AdminSection =
  | 'dashboard'
  | 'fundraisers'
  | 'reports'
  | 'donations'
  | 'users'
  | 'organizations'
  | 'activity'
  | 'admins'
  | 'profile';

export type AdminRoleName = 'super_admin' | 'moderator' | 'finance';

export type AdminPermission =
  | 'fundraisers'
  | 'reports'
  | 'donations'
  | 'users'
  | 'organizations'
  | 'admins';

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: AdminRoleName;
  permissions: AdminPermission[];
  status: 'active' | 'disabled';
  lastActive: string;
  photo?: string;
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountType: 'individual' | 'organization';
  status: 'active' | 'suspended';
  joinedAt: string;
  fundraisers: { id: string; title: string; status: string }[];
}

export type DonationStatus = 'pending' | 'confirmed' | 'rejected';

export interface AdminDonation {
  id: string;
  campaignId: string;
  donorName: string;
  donorEmail: string;
  anonymous: boolean;
  amount: number;
  bank: string;
  accountNumber: string;
  reference: string;
  status: DonationStatus;
  createdAt: string;
  decisionNote?: string;
}

export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';
export type ReportCategory = 'False Information' | 'Fraud / Scam' | 'Misleading Content' | 'Other';

export interface AdminReport {
  id: string;
  reporterId: string;
  campaignId: string;
  category: ReportCategory;
  details: string;
  evidence: string[];
  status: ReportStatus;
  createdAt: string;
  resolutionNote?: string;
}

export type OrgApplicationStatus = 'pending' | 'approved' | 'needs_changes' | 'rejected';

export interface OrgApplication {
  id: string;
  name: string;
  organizationType: string;
  officialEmail: string;
  phone: string;
  address: string;
  description: string;
  logoUrl?: string;
  representative: { name: string; role: string; phone: string };
  bank: { bank: string; accountNumber: string; accountName: string };
  documents: string[];
  status: OrgApplicationStatus;
  submittedAt: string;
  activeCauses: number;
  totalRaised: number;
  lastContactedAt?: string;
  decisionNote?: string;
}

export type ActivityType =
  | 'user_registered'
  | 'organization_registered'
  | 'fundraiser_submitted'
  | 'fundraiser_approved'
  | 'fundraiser_changes_requested'
  | 'fundraiser_rejected'
  | 'fundraiser_edited'
  | 'fundraiser_deleted'
  | 'donation_submitted'
  | 'donation_confirmed'
  | 'donation_rejected'
  | 'report_submitted'
  | 'report_reviewed'
  | 'report_resolved'
  | 'report_dismissed'
  | 'organization_approved'
  | 'organization_changes_requested'
  | 'organization_rejected'
  | 'organization_contacted'
  | 'admin_action';

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  message: string;
  actor: string;
  actorIsAdmin?: boolean;
  refId?: string;
  at: string;
}

export interface AdminSnapshot {
  users: PlatformUser[];
  donations: AdminDonation[];
  reports: AdminReport[];
  organizations: OrgApplication[];
  activity: ActivityEvent[];
  admins: AdminAccount[];
  currentAdminId: string;
  unavailableSections?: AdminSection[];
}

export interface FundraiserReviewInfo {
  beneficiary: { name: string; relation: string; phone: string };
  receiving: { bank: string; accountNumber: string; accountName: string };
  documents: { name: string; kind: string }[];
  verificationNotes: string;
}
