export interface SectorBreakdown {
  sector: string;
  label: {
    am: string;
    en: string;
    om: string;
  };
  totalAmountETB: number;
  percentage: number;
  projectsCount: number;
  color: string;
}

export interface TransparencyContributionRecord {
  id: string;
  campaignTitle: string;
  sector: string;
  organization: string;
  totalRaisedETB: number;
  contributionCount: number;
  lastContributionAt: string | null;
  status: string;
}

export interface TransparencyOverview {
  totalRaisedETB: number;
  totalContributions: number;
  supportedCampaigns: number;
  sectorBreakdowns: SectorBreakdown[];
  contributionRecords: TransparencyContributionRecord[];
}

export type TransparencyAuditRecord = TransparencyContributionRecord;
