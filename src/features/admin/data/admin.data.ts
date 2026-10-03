import {
  AdminPermission,
  AdminRoleName,
  AdminStats,
  AuditLog,
  FundraiserReviewInfo,
} from '../types/admin.types';
import type { Fundraiser } from '../../fundraising/types/fundraiser.types.ts';
import { mockBanks } from '../../donations/data/banks.data.ts';

export const INITIAL_ADMIN_STATS: AdminStats = {
  pendingCount: 2,
  approvedCount: 14,
  rejectedCount: 1,
  totalVolumeETB: 3450000,
  activeFoundations: 8,
};

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-01',
    action: 'approve',
    targetId: 'camp-bethlehem-cardiac',
    targetTitle: 'የህጻን ቤተልሔም አስቸኳይ የልብ ቀዶ-ጥገና ህክምና ድጋፍ',
    adminEmail: 'oversight@acso.gov.et',
    reason: 'የህክምና ቦርድ እና የሲቪል ማኅበራት ፈቃድ ተረጋግጧል',
    timestamp: '2024-03-01T10:00:00Z',
  },
  {
    id: 'audit-02',
    action: 'approve',
    targetId: 'camp-oromia-school-stem',
    targetTitle: 'ለኦሮሚያ ገጠር ትምህርት ቤቶች የኮምፒውተር ቤተ-ሙከራ ማደራጃ',
    adminEmail: 'oversight@acso.gov.et',
    reason: 'ከትምህርት ቢሮ የተሰጠ የትብብር ደብዳቤ ትክክለኛ ነው',
    timestamp: '2024-03-05T14:30:00Z',
  },
  {
    id: 'audit-03',
    action: 'reject',
    targetId: 'camp-unverified-09',
    targetTitle: 'የግል የንግድ እንቅስቃሴ ማስፋፊያ የህዝብ ፈንድ ጥያቄ',
    adminEmail: 'oversight@acso.gov.et',
    reason: 'በሲቪል ማኅበራት ህግ መሰረት ለግል ትርፍ የህዝብ ልገሳ መሰብሰብ አይፈቀድም',
    timestamp: '2024-03-10T09:15:00Z',
  },
];

export const ADMIN_ALL_PERMISSIONS: AdminPermission[] = [
  'fundraisers',
  'reports',
  'donations',
  'users',
  'organizations',
  'admins',
];

export const ADMIN_ROLE_LABELS: Record<AdminRoleName, string> = {
  super_admin: 'Super admin',
  moderator: 'Moderator',
  finance: 'Finance',
};

export const ADMIN_ROLE_DEFAULT_PERMISSIONS: Record<AdminRoleName, AdminPermission[]> = {
  super_admin: [...ADMIN_ALL_PERMISSIONS],
  moderator: ['fundraisers', 'reports', 'users', 'organizations'],
  finance: ['donations', 'reports'],
};

export const getFundraiserReviewInfo = (
  fundraiserId: string,
  creatorName: string,
): FundraiserReviewInfo | null => {
  try {
    const fundraisers = JSON.parse(localStorage.getItem('lewegene_fundraisers_v1') || '[]') as Fundraiser[];
    const fundraiser = fundraisers.find((item) => item.id === fundraiserId);
    if (!fundraiser) return null;

    const beneficiaryRelations: Record<Fundraiser['beneficiaryType'], string> = {
      myself: 'Self',
      friend_family: 'Friend or family',
      community_org: 'Community organization',
      other: 'Other',
    };
    const bank = mockBanks.find((item) => item.id === fundraiser.bank.bankId);
    const beneficiaryName = fundraiser.beneficiaryType === 'myself'
      ? creatorName
      : fundraiser.beneficiary.name || (fundraiser.beneficiaryType === 'community_org' ? fundraiser.organizationId || 'Community organization' : 'Not provided');

    return {
      beneficiary: {
        name: beneficiaryName,
        relation: beneficiaryRelations[fundraiser.beneficiaryType],
        phone: fundraiser.beneficiary.phone || 'Not provided',
      },
      receiving: {
        bank: bank?.name.en || fundraiser.bank.bankId,
        accountNumber: fundraiser.bank.accountNumber,
        accountName: fundraiser.bank.accountName,
      },
      documents: fundraiser.documents.map((document) => ({
        name: document.fileName,
        kind: document.kind.replace('_', ' '),
      })),
      verificationNotes: 'Frontend prototype only. File contents are not uploaded or verified.',
    };
  } catch {
    return null;
  }
};
