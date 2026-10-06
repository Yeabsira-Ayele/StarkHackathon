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

export interface TransparencyAuditRecord {
  id: string;
  campaignTitle: string;
  organization: string;
  disbursedAmount: number;
  beneficiaryCount: number;
  disbursementDate: string;
  escrowReference: string;
  verificationReportUrl?: string;
  status: 'fully_audited' | 'in_disbursement' | 'verified_complete';
}

export interface TransparencyOverview {
  totalDisbursedETB: number;
  totalBeneficiaries: number;
  totalDonors: number;
  activeProjectsAudited: number;
  sectorBreakdowns: SectorBreakdown[];
  auditRecords: TransparencyAuditRecord[];
}
