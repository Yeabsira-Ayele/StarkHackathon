export type CampaignCategory =
  | 'medical'
  | 'education'
  | 'emergency'
  | 'water'
  | 'environment'
  | 'community'
  | 'other';

export type CampaignStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'paused';

export interface BudgetItem {
  item: string;
  cost: number;
  description?: string;
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

export interface Campaign {
  id: string;
  title: string;
  story: string;
  goalAmount: number;
  raisedAmount: number;
  creatorName: string;
  organizationId?: string;
  organizationName?: string;
  category: CampaignCategory;
  imageUrl?: string;
  status: CampaignStatus;
  createdAt: string;
  location?: string;
  donationsCount?: number;
  verifiedOrganization?: boolean;
  impactMetric?: string;
  beneficiariesTarget?: number;
  budgetBreakdown?: BudgetItem[];
  updates?: CampaignUpdate[];
  serialCode?: string;
}

export type CampaignFilterStatus = 'all' | 'active' | 'nearly_funded' | 'completed';
