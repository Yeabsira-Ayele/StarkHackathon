import api from '../../../api/axios';
import { campaignApi } from '../../../services/api/campaignApi.ts';
import { Campaign } from '../../campaigns/types/campaign.types';
import { Organization } from '../../../types/index.ts';
import {
  ActivityType,
  AdminAccount,
  AdminDonation,
  AdminReport,
  AdminSnapshot,
  AdminStats,
  AuditLog,
  ModerationAction,
  OrgApplication,
  PlatformUser,
} from '../types/admin.types';

interface BackendOrganization {
  _id: string;
  name: string;
  organizationType: string;
  officialEmail: string;
  phone: string;
  location: string;
  description: string;
  logo?: string;
  authorizedRepresentative: { name: string; phone: string };
  payoutAccounts: { bankName: string; accountNumber: string; accountHolderName: string }[];
  verificationDocuments: { name?: string; url: string }[];
  verificationStatus: 'pending' | 'approved' | 'changes_requested' | 'rejected';
  createdAt: string;
  reviewNotes?: string;
};

function toOrgApplication(org: BackendOrganization): OrgApplication {
  const account = org.payoutAccounts[0];
  return {
    id: org._id,
    name: org.name,
    organizationType: org.organizationType,
    officialEmail: org.officialEmail,
    phone: org.phone,
    address: org.location,
    description: org.description,
    logoUrl: org.logo,
    representative: {
      name: org.authorizedRepresentative.name,
      role: 'Authorized representative',
      phone: org.authorizedRepresentative.phone,
    },
    bank: {
      bank: account?.bankName || '',
      accountNumber: account?.accountNumber || '',
      accountName: account?.accountHolderName || '',
    },
    documents: org.verificationDocuments.map((document) => document.url),
    status: org.verificationStatus === 'changes_requested' ? 'needs_changes' : org.verificationStatus,
    submittedAt: org.createdAt,
    activeCauses: 0,
    totalRaised: 0,
    decisionNote: org.reviewNotes,
  };
}

export function organizationToOrgApplication(org: Organization): OrgApplication {
  const status: OrgApplication['status'] =
    org.verificationStatus === 'verified' ? 'approved' :
      org.verificationStatus === 'under_review' ? 'pending' :
        org.verificationStatus === 'needs_changes' ? 'needs_changes' :
          org.verificationStatus || (org.verified ? 'approved' : 'pending');
  return {
    id: org.id,
    name: org.name,
    organizationType: org.type,
    officialEmail: org.contactEmail,
    phone: org.contactPhone,
    address: org.location,
    description: org.description,
    logoUrl: org.logoUrl,
    representative: org.representative || {
      name: 'Authorized representative',
      role: 'Authorized representative',
      phone: org.contactPhone,
    },
    bank: org.bank || { bank: '', accountNumber: '', accountName: '' },
    documents: org.documents || [],
    status,
    submittedAt: org.submittedAt || '',
    activeCauses: org.activeProjectsCount || 0,
    totalRaised: org.totalRaised || 0,
    decisionNote: org.decisionNote,
  };
}

function unavailable(feature: string): never {
  throw new Error(`${feature} is not yet supported by the MongoDB backend.`);
}

async function getSnapshot(): Promise<AdminSnapshot> {
  const response = await api.get<{ data: { items: BackendOrganization[] } }>('/admin/organizations');
  return {
    users: [],
    donations: [],
    reports: [],
    organizations: response.data.data.items.map(toOrgApplication),
    activity: [],
    admins: [],
    currentAdminId: '',
  };
}

export const adminApi = {
  getSnapshot,

  async logEvent(_type: ActivityType, _message: string, _refId?: string): Promise<AdminSnapshot> {
    return unavailable('Admin activity logging');
  },

  async decideDonation(_id: string, _decision: 'confirmed' | 'rejected', _note?: string): Promise<AdminSnapshot> {
    return unavailable('Donation moderation');
  },

  async updateReport(_id: string, _status: AdminReport['status'], _note?: string): Promise<AdminSnapshot> {
    return unavailable('Report moderation');
  },

  async submitReport(_report: Omit<AdminReport, 'id' | 'status' | 'createdAt'>): Promise<AdminSnapshot> {
    return unavailable('Report submission');
  },

  async decideOrganization(id: string, status: OrgApplication['status'], note?: string): Promise<AdminSnapshot> {
    await api.patch(`/organizations/${id}/verification`, {
      status: status === 'needs_changes' ? 'changes_requested' : status,
      notes: note,
    });
    return getSnapshot();
  },

  async contactOrganization(_id: string, _channel: 'email' | 'phone'): Promise<AdminSnapshot> {
    return unavailable('Organization contact tracking');
  },

  async setUserStatus(id: string, status: PlatformUser['status']): Promise<AdminSnapshot> {
    await api.patch(`/users/${id}/status`, { status });
    return getSnapshot();
  },

  async addAdmin(_admin: Omit<AdminAccount, 'id' | 'lastActive' | 'status'>): Promise<AdminSnapshot> {
    return unavailable('Admin account creation');
  },

  async updateAdmin(_id: string, _patch: Partial<AdminAccount>, _message?: string): Promise<AdminSnapshot> {
    return unavailable('Admin account management');
  },

  async getPendingCampaigns(): Promise<Campaign[]> {
    return campaignApi.getCampaigns({ status: 'pending' });
  },

  async getAdminStats(): Promise<AdminStats> {
    const campaigns = await campaignApi.getAllCampaigns();
    return {
      pendingCount: campaigns.filter((campaign) => campaign.status === 'pending').length,
      approvedCount: campaigns.filter((campaign) => campaign.status === 'approved').length,
      rejectedCount: campaigns.filter((campaign) => campaign.status === 'rejected').length,
      totalVolumeETB: campaigns.reduce((total, campaign) => total + campaign.raisedAmount, 0),
      activeFoundations: new Set(campaigns.filter((campaign) => campaign.status === 'approved').map((campaign) => campaign.organizationId)).size,
    };
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    return [];
  },

  async moderateCampaign(campaignId: string, action: ModerationAction, reason?: string): Promise<{ success: boolean }> {
    const status = action === 'approve' ? 'approved' : action === 'request_changes' ? 'needs_changes' : 'rejected';
    if (action === 'request_changes') {
      await api.patch(`/admin/campaigns/${campaignId}`, { status: 'changes_requested', reason });
    } else {
      await api.patch(`/admin/campaigns/${campaignId}`, { status, reason });
    }
    return { success: true };
  },
};
