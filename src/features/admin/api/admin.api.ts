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
  FundraiserReviewInfo,
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

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

function readArray<T>(payload: unknown, keys: string[], depth = 0): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (depth > 4) throw new Error('The admin backend response was nested too deeply to read.');
  const record = asRecord(payload);
  if (!record) throw new Error('The admin backend response did not contain the expected list.');

  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value as T[];
    const nested = asRecord(value);
    if (nested && Array.isArray(nested.items)) return nested.items as T[];
  }
  for (const key of ['data', 'result']) {
    if (record[key] !== undefined) return readArray<T>(record[key], keys, depth + 1);
  }
  throw new Error(`The admin backend response did not contain ${keys.join(' or ')}.`);
}

function readRelatedId(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  const record = asRecord(value);
  if (!record) return '';
  const id = record.id ?? record._id ?? record.userId ?? record.campaignId;
  return id === undefined || id === null ? '' : String(id);
}

async function readAllPages<T>(path: string, keys: string[]): Promise<T[]> {
  const pageSize = 100;
  const firstResponse = await api.get<unknown>(path, { params: { page: 1, limit: pageSize } });
  const first = readArray<T>(firstResponse.data, keys);
  const root = asRecord(firstResponse.data);
  const payload = asRecord(root?.data) ?? root;
  const pagination = asRecord(payload?.pagination);
  const pagesValue = pagination?.pages ?? payload?.pages;
  const total = Number(pagination?.total ?? payload?.total ?? first.length);
  const limit = Number(pagination?.limit ?? payload?.limit ?? pageSize);
  const pageCount = pagesValue !== undefined
    ? Math.max(1, Number(pagesValue) || 1)
    : pagination || payload?.page !== undefined || payload?.limit !== undefined
      ? Math.max(1, Math.ceil(total / (limit || pageSize)))
      : 1;
  if (pageCount <= 1) return first;

  const rest = await Promise.all(Array.from({ length: pageCount - 1 }, (_, index) =>
    api.get<unknown>(path, { params: { page: index + 2, limit: pageSize } })
  ));
  return first.concat(...rest.map((response) => readArray<T>(response.data, keys)));
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

function normalizeDonation(item: Record<string, unknown>): AdminDonation | null {
  const status = String(item.paymentStatus ?? item.status ?? '').toLowerCase();
  if (status !== 'completed' && status !== 'successful') return null;
  const amount = Number(item.amount ?? 0);
  const campaignId = readRelatedId(item.campaignId);
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
    status: 'successful',
    createdAt: String(item.createdAt ?? new Date().toISOString()),
  };
}

function normalizeUser(item: Record<string, unknown>): PlatformUser {
  const role = String(item.role ?? item.accountType ?? 'USER').toUpperCase();
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

function normalizeAdmin(item: Record<string, unknown>): AdminAccount {
  const role = String(item.role ?? '').toUpperCase();
  return {
    id: String(item.id ?? item._id ?? ''),
    name: String(item.name ?? 'Admin'),
    email: String(item.email ?? ''),
    phone: String(item.phone ?? ''),
    role: role === 'SUPER_ADMIN' ? 'super_admin' : 'admin',
    permissions: [],
    status: String(item.status ?? 'active') === 'active' ? 'active' : 'disabled',
    lastActive: String(item.createdAt ?? ''),
    photo: typeof item.profilePhoto === 'string' ? item.profilePhoto : undefined,
  };
}

function normalizeAdminCandidate(item: Record<string, unknown>): PlatformUser {
  return {
    id: String(item.id ?? item._id ?? ''),
    name: String(item.name ?? 'User'),
    email: String(item.email ?? ''),
    phone: String(item.phone ?? ''),
    accountType: 'individual',
    status: 'active',
    joinedAt: String(item.createdAt ?? ''),
    fundraisers: [],
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

function normalizeReport(item: Record<string, unknown>): AdminReport {
  return {
    id: String(item.id ?? item._id ?? ''),
    reporterId: readRelatedId(item.reporterId),
    campaignId: readRelatedId(item.campaignId),
    category: String(item.category ?? 'Other') as AdminReport['category'],
    details: String(item.details ?? ''),
    evidence: Array.isArray(item.evidence) ? item.evidence.map(String) : [],
    status: String(item.status ?? 'pending') as AdminReport['status'],
    createdAt: String(item.createdAt ?? new Date().toISOString()),
    resolutionNote: typeof item.resolutionNote === 'string' ? item.resolutionNote : undefined,
  };
}

async function getSnapshot(): Promise<AdminSnapshot> {
  const [profileResult] = await Promise.allSettled([api.get('/users/me')]);
  const profileResponse = profileResult.status === 'fulfilled' ? profileResult.value.data : null;
  const profile = profileResponse?.data?.user ?? profileResponse?.user;
  const profileRole = String(profile?.role ?? '');
  const isSuperAdmin = profileRole === 'SUPER_ADMIN';

  const [usersResult, donationsResult, organizationsResult, activityResult, reportsResult, adminsResult, candidatesResult] = await Promise.allSettled([
    readAllPages<Record<string, unknown>>('/admin/users', ['users', 'items']),
    readAllPages<Record<string, unknown>>('/admin/donations', ['donations', 'items']),
    readAllPages<Record<string, unknown>>('/admin/organizations', ['items', 'organizations']),
    api.get('/admin/activity'),
    readAllPages<Record<string, unknown>>('/admin/reports', ['reports', 'items']),
    isSuperAdmin ? api.get<unknown>('/admin/admins') : Promise.resolve({ data: { admins: [] } }),
    isSuperAdmin
      ? readAllPages<Record<string, unknown>>('/admin/admin-candidates', ['users', 'items'])
      : Promise.resolve([] as Record<string, unknown>[]),
  ]);

  const users = usersResult.status === 'fulfilled' ? usersResult.value.map(normalizeUser) : [];
  const donations = donationsResult.status === 'fulfilled'
    ? donationsResult.value
        .map(normalizeDonation)
        .filter((donation): donation is AdminDonation => donation !== null)
    : [];
  const organizations = organizationsResult.status === 'fulfilled'
    ? organizationsResult.value.map((organization) => toOrgApplication(organization as unknown as BackendOrganization))
    : [];
  const activity = activityResult.status === 'fulfilled' ? readArray<Record<string, unknown>>(activityResult.value.data, ['activity', 'items']).map(normalizeActivity) : [];
  const reports = reportsResult.status === 'fulfilled' ? reportsResult.value.map(normalizeReport) : [];
  const fetchedAdmins = isSuperAdmin && adminsResult.status === 'fulfilled'
    ? readArray<Record<string, unknown>>(adminsResult.value.data, ['admins', 'items']).map(normalizeAdmin)
    : [];
  const profileRecord = asRecord(profile);
  const profileAdmin = profileRecord ? normalizeAdmin(profileRecord) : null;
  const admins = isSuperAdmin ? fetchedAdmins : profileRole === 'ADMIN' && profileAdmin ? [profileAdmin] : [];
  const adminCandidates = isSuperAdmin && candidatesResult.status === 'fulfilled'
    ? candidatesResult.value.map(normalizeAdminCandidate)
    : [];
  const currentAdminId = String(profile?._id ?? profile?.id ?? '');

  return {
    users,
    donations,
    reports,
    organizations,
    activity,
    admins,
    adminCandidates,
    currentAdminId,
    isSuperAdmin,
    unavailableSections: [
      ...(usersResult.status === 'rejected' ? ['users' as const] : []),
      ...(donationsResult.status === 'rejected' ? ['donations' as const] : []),
      ...(organizationsResult.status === 'rejected' ? ['organizations' as const] : []),
      ...(activityResult.status === 'rejected' ? ['activity' as const] : []),
      ...(reportsResult.status === 'rejected' ? ['reports' as const] : []),
      ...(profileResult.status === 'rejected' || !admins.length ? ['profile' as const] : []),
      ...(!isSuperAdmin || adminsResult.status === 'rejected' || candidatesResult.status === 'rejected' ? ['admins' as const] : []),
    ],
  };
}

export const adminApi = {
  getSnapshot,

  async getFundraiserReviewInfo(id: string): Promise<FundraiserReviewInfo> {
    const response = await api.get<unknown>(`/admin/fundraisers/${id}/review`);
    let payload: unknown = response.data;
    for (let depth = 0; depth < 4; depth += 1) {
      const record = asRecord(payload);
      if (!record) break;
      if (record.beneficiary || record.receiving || record.documents || record.verificationNotes) break;
      payload = record.data ?? record.review ?? record.fundraiser ?? record.campaign ?? record.result;
    }
    const record = asRecord(payload);
    if (!record) throw new Error('The backend did not return fundraiser review details.');
    const beneficiaryRecord = asRecord(record.beneficiary);
    const receivingRecord = asRecord(record.receiving);
    const documents = Array.isArray(record.documents) ? record.documents : [];
    const notes = record.verificationNotes ?? record.reviewNotes ?? record.reviewReason;
    return {
      beneficiary: {
        name: String(beneficiaryRecord?.name ?? record.beneficiaryName ?? record.fundraiserName ?? '—'),
        relation: String(beneficiaryRecord?.relation ?? 'Campaign owner'),
        phone: String(beneficiaryRecord?.phone ?? record.phone ?? ''),
        info: String(beneficiaryRecord?.info ?? ''),
      },
      receiving: {
        bank: String(receivingRecord?.bank ?? receivingRecord?.bankName ?? ''),
        accountNumber: String(receivingRecord?.accountNumber ?? ''),
        accountName: String(receivingRecord?.accountName ?? receivingRecord?.accountHolderName ?? ''),
      },
      deadline: String(record.deadline ?? ''),
      images: Array.isArray(record.images)
        ? record.images.filter((image): image is string => typeof image === 'string')
        : [],
      documents: documents.map((value, index) => {
        const document = asRecord(value);
        return {
          name: String(document?.name ?? document?.fileName ?? document?.url ?? value ?? `Document ${index + 1}`),
          kind: String(document?.kind ?? document?.type ?? 'Supporting document'),
          url: typeof document?.url === 'string' ? document.url : undefined,
        };
      }),
      verificationNotes: typeof notes === 'string' ? notes : '',
    };
  },

  async logEvent(_type: ActivityType, _message: string, _refId?: string): Promise<AdminSnapshot> {
    return unavailable('Admin activity logging');
  },

  async updateReport(id: string, status: AdminReport['status'], note?: string): Promise<AdminSnapshot> {
    await api.patch(`/admin/reports/${id}`, { status, note });
    return getSnapshot();
  },

  async submitReport(report: Omit<AdminReport, 'id' | 'status' | 'createdAt' | 'reporterId'> & { reporterId?: string }): Promise<void> {
    await api.post('/reports', {
      campaignId: report.campaignId,
      category: report.category,
      details: report.details,
      evidence: report.evidence,
    });
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

  async addAdmin(userId: string): Promise<AdminSnapshot> {
    await api.post('/admin/admins', { userId });
    return getSnapshot();
  },

  async removeAdmin(id: string): Promise<AdminSnapshot> {
    await api.delete(`/admin/admins/${id}`);
    return getSnapshot();
  },

  async updateAdmin(id: string, patch: Partial<AdminAccount>, _message?: string): Promise<AdminSnapshot> {
    const snapshot = await getSnapshot();
    if (id !== snapshot.currentAdminId) return unavailable('Admin account management');
    await api.patch('/users/me', {
      ...(patch.name === undefined ? {} : { name: patch.name }),
      ...(patch.email === undefined ? {} : { email: patch.email }),
      ...(patch.photo === undefined ? {} : { profilePhoto: patch.photo }),
    });
    return getSnapshot();
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<string> {
    const response = await api.patch<{ data: { token: string } }>('/users/me/password', {
      currentPassword,
      newPassword,
    });
    return response.data.data.token;
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
