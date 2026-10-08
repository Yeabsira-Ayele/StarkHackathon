import api from '../../../api/axios';
import { campaignApi } from '../../../services/api/campaignApi.ts';
import { Campaign } from '../../campaigns/types/campaign.types';
import { Organization } from '../../../types/index.ts';
import {
  ActivityEvent,
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
}

function readArray<T>(payload: unknown, keys: string[]): T[] {
  if (!payload || typeof payload !== 'object') return [];
  const record = payload as Record<string, unknown>;
  const candidates = [record, record.data as Record<string, unknown> | undefined].filter(Boolean) as Record<string, unknown>[];

  for (const candidate of candidates) {
    for (const key of keys) {
      const value = candidate[key];
      if (Array.isArray(value)) return value as T[];
      if (value && typeof value === 'object' && Array.isArray((value as Record<string, unknown>).items)) {
        return (value as Record<string, unknown>).items as T[];
      }
    }
  }
  return [];
}

function toOrgApplication(org: BackendOrganization): OrgApplication {
  const account = org.payoutAccounts?.[0];
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
      name: org.authorizedRepresentative?.name || 'Authorized representative',
      role: 'Authorized representative',
      phone: org.authorizedRepresentative?.phone || org.phone,
    },
    bank: {
      bank: account?.bankName || '',
      accountNumber: account?.accountNumber || '',
      accountName: account?.accountHolderName || '',
    },
    documents: org.verificationDocuments?.map((document) => document.url).filter(Boolean) || [],
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

function normalizeDonation(item: Record<string, unknown>): AdminDonation {
  const status = String(item.paymentStatus ?? item.status ?? 'completed').toLowerCase();
  const amount = Number(item.amount ?? 0);
  const campaignId = typeof item.campaignId === 'string'
    ? item.campaignId
    : typeof item.campaignId === 'object' && item.campaignId && '_id' in item.campaignId
      ? String((item.campaignId as Record<string, unknown>)._id ?? '')
      : String(item.campaignId ?? '');
  const reference = String(item.reference ?? item.transactionId ?? item.receiptKey ?? item.certificateId ?? '');
  const donationId = String(item.id ?? item._id ?? (reference || campaignId || String(Math.random())));

  return {
    id: donationId,
    campaignId,
    donorName: String(item.donorName ?? 'Anonymous'),
    donorEmail: String(item.donorEmail ?? ''),
    anonymous: Boolean(item.anonymous),
    amount,
    bank: String(item.bank ?? item.paymentMethod ?? 'Bank transfer'),
    accountNumber: String(item.accountNumber ?? ''),
    reference,
    status: status === 'failed' || status === 'rejected' ? 'failed' : 'successful',
    createdAt: String(item.createdAt ?? new Date().toISOString()),
  };
}

function normalizeUser(item: Record<string, unknown>): PlatformUser {
  const role = String(item.role ?? 'USER');
  const accountType = String(item.accountType ?? (role === 'ORGANIZATION' ? 'organization' : 'individual')); 
  const fundraisers = Array.isArray(item.fundraisers) ? item.fundraisers.map((fundraiser) => ({
    id: String((fundraiser as Record<string, unknown>).id ?? (fundraiser as Record<string, unknown>)._id ?? ''),
    title: String((fundraiser as Record<string, unknown>).title ?? ''),
    status: String((fundraiser as Record<string, unknown>).status ?? 'pending'),
  })) : [];

  return {
    id: String(item.id ?? item._id ?? ''),
    name: String(item.name ?? 'User'),
    email: String(item.email ?? ''),
    phone: String(item.phone ?? ''),
    accountType: accountType === 'organization' ? 'organization' : 'individual',
    status: String(item.status ?? 'active') === 'suspended' || String(item.status ?? 'active') === 'banned' ? 'suspended' : 'active',
    joinedAt: String(item.joinedAt ?? item.createdAt ?? new Date().toISOString()),
    fundraisers,
  };
}

function normalizeActivity(item: Record<string, unknown>): ActivityEvent {
  return {
    id: String(item.id ?? item._id ?? `${String(item.type ?? 'event')}-${String(item.at ?? item.createdAt ?? Date.now())}`),
    type: (item.type as ActivityType) ?? 'admin_action',
    message: String(item.message ?? ''),
    actor: String(item.actor ?? 'System'),
    actorIsAdmin: Boolean(item.actorIsAdmin),
    refId: item.refId ? String(item.refId) : undefined,
    at: String(item.at ?? item.createdAt ?? new Date().toISOString()),
  };
}

async function getSnapshot(): Promise<AdminSnapshot> {
  const [usersResult, donationsResult, organizationsResult, activityResult] = await Promise.allSettled([
    api.get('/admin/users'),
    api.get('/admin/donations'),
    api.get('/admin/organizations'),
    api.get('/admin/activity'),
  ]);

  const users = usersResult.status === 'fulfilled' ? readArray<Record<string, unknown>>(usersResult.value.data, ['users', 'items']).map(normalizeUser) : [];
  const donations = donationsResult.status === 'fulfilled' ? readArray<Record<string, unknown>>(donationsResult.value.data, ['donations', 'items']).map(normalizeDonation) : [];
  const organizations = organizationsResult.status === 'fulfilled'
    ? readArray<Record<string, unknown>>(organizationsResult.value.data, ['items', 'organizations']).map((organization) => toOrgApplication(organization as unknown as BackendOrganization))
    : [];
  const activity = activityResult.status === 'fulfilled' ? readArray<Record<string, unknown>>(activityResult.value.data, ['activity', 'items']).map(normalizeActivity) : [];

  return {
    users,
    donations,
    reports: [],
    organizations,
    activity,
    admins: [],
    currentAdminId: '',
    unavailableSections: ['reports', 'admins', 'profile'],
  };
}

export const adminApi = {
  getSnapshot,

  async logEvent(_type: ActivityType, _message: string, _refId?: string): Promise<AdminSnapshot> {
    return unavailable('Admin activity logging');
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
    await api.patch(`/admin/users/${id}/status`, { status });
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
    const dashboard = await api.get('/admin/dashboard');
    const data = dashboard.data?.data ?? dashboard.data ?? {};
    const fundraising = data.fundraising ?? {};
    const donations = data.donations ?? {};

    return {
      pendingCount: Number(fundraising.pendingCampaigns ?? 0),
      approvedCount: Number(fundraising.approvedCampaigns ?? 0),
      rejectedCount: Number(fundraising.rejectedCampaigns ?? 0),
      totalVolumeETB: Number(donations.totalAmount ?? 0),
      activeFoundations: Number(data.organizations?.total ?? 0),
    };
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    return unavailable('Audit logs');
  },

  async moderateCampaign(campaignId: string, action: ModerationAction, reason?: string): Promise<{ success: boolean }> {
    const status = action === 'approve' ? 'approved' : action === 'request_changes' ? 'changes_requested' : 'rejected';
    await api.patch(`/admin/campaigns/${campaignId}`, { status, reason });
    return { success: true };
  },
};
