import type { CampaignCategory } from '../../campaigns/types/campaign.types.ts'; // Member 1

/**
 * STATUS VALUES — must be agreed with Member 5 (admin review).
 * 'pending', 'approved', 'rejected', 'completed', 'paused' already exist in the shared
 * CampaignStatus type. 'draft' and 'changes_requested' are new and only used by Member 2 / 5.
 */
export type FundraiserStatus =
  | 'draft'
  | 'pending'
  | 'changes_requested'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'paused';

export type BeneficiaryType = 'myself' | 'friend_family' | 'community_org' | 'other';
export type DocumentKind = 'supporting_letter' | 'verification' | 'other';

export interface Beneficiary {
  name: string;
  phone: string;
  info: string;
}

/** Bank is referenced by ID (bankId), never copied as a whole object. Member 4 owns banks. */
export interface BankAccount {
  bankId: string;
  accountNumber: string;
  accountName: string;
}

export interface EvidenceDocument {
  id: string;
  kind: DocumentKind;
  fileName: string;
  sizeKb: number;
}

/** What Member 2 stores. Field names follow the team Campaign contract (goalAmount, raisedAmount...). */
export interface Fundraiser {
  id: string; // this is the campaignId other members use
  creatorId: string; // from Member 3 (current user)
  status: FundraiserStatus;
  title: string;
  category: CampaignCategory;
  location: string;
  story: string;
  images: string[];
  goalAmount: number;
  raisedAmount: number;
  deadline: string; // YYYY-MM-DD
  beneficiaryType: BeneficiaryType;
  beneficiary: Beneficiary;
  organizationId?: string; // only for community_org
  bank: BankAccount;
  banks?: BankAccount[];
  documents: EvidenceDocument[];
  reviewNote?: string; // message from admin when changes are requested / rejected
  deleteRequested?: boolean;
  createdAt: string;
  updatedAt: string;
}

/** The form keeps goalAmount as text so people can type freely. */
export interface FundraiserFormValues {
  title: string;
  category: CampaignCategory | '';
  location: string;
  story: string;
  images: string[];
  goalAmount: string;
  deadline: string;
  beneficiaryType: BeneficiaryType;
  beneficiary: Beneficiary;
  organizationId: string;
  bank: BankAccount;
  banks?: BankAccount[];
  documents: EvidenceDocument[];
}

export type FormErrors = Record<string, string>;
