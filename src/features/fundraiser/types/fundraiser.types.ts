import { CampaignCategory } from '../../campaigns/types/campaign.types';

export interface FundraiserCreationData {
  title: string;
  story: string;
  goalAmount: number;
  category: CampaignCategory;
  creatorName: string;
  location: string;
  beneficiariesTarget?: number;
  impactMetric?: string;
  imageUrl: string;
}

export interface OrganizationProfile {
  id: string;
  name: string;
  registrationNo: string;
  verified: boolean;
  contactEmail: string;
  location: string;
  totalRaised: number;
}
