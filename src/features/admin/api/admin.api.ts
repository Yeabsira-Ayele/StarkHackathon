import { campaignApi } from '../../../services/api/campaignApi.ts';
import { Campaign, Organization } from '../../../types/index.ts';
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
import { INITIAL_AUDIT_LOGS } from '../data/admin.data';

const STORAGE_KEY = 'lewegene_admin_snapshot_v1';

export function organizationToOrgApplication(org: Organization): OrgApplication {
  const status: OrgApplication['status'] =
    org.verificationStatus === 'verified'
      ? 'approved'
      : org.verificationStatus === 'under_review'
      ? 'pending'
      : (org.verificationStatus as OrgApplication['status']) || (org.verified ? 'approved' : 'pending');

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
      name: 'Authorized Official',
      role: 'Executive Director',
      phone: org.contactPhone,
      email: org.contactEmail,
    },
    bank: org.bank || {
      bank: 'Commercial Bank of Ethiopia (CBE)',
      accountNumber: '1000284920194',
      accountName: org.name,
    },
    documents: org.documents || [],
    status,
    submittedAt: org.submittedAt || new Date().toISOString(),
    activeCauses: org.activeProjectsCount || 0,
    totalRaised: org.totalRaised || 0,
    decisionNote: org.decisionNote,
  };
}
const DEMO_USERS: AdminSnapshot['users'] = [
  {
    id: 'demo-donor-001',
    name: 'Mimi Bekele',
    email: 'donor@demo.lewegene',
    phone: '+251 91 234 5678',
    accountType: 'individual',
    status: 'active',
    joinedAt: '2025-05-12T09:00:00.000Z',
    fundraisers: [],
  },
  {
    id: 'demo-fundraiser-001',
    name: 'Mimi Community Initiative',
    email: 'fundraiser@demo.lewegene',
    phone: '+251 92 345 6789',
    accountType: 'organization',
    status: 'active',
    joinedAt: '2025-01-20T09:00:00.000Z',
    fundraisers: [{ id: 'camp-105', title: 'Community campaign submission', status: 'pending' }],
  },
  {
    id: 'demo-admin-001',
    name: 'Lewegene Demo Admin',
    email: 'admin@demo.lewegene',
    phone: '+251 11 000 0000',
    accountType: 'individual',
    status: 'active',
    joinedAt: '2024-01-01T09:00:00.000Z',
    fundraisers: [],
  },
];

const DEMO_REPORTS: AdminReport[] = [{
  id: 'demo-report-001',
  reporterId: 'demo-donor-001',
  campaignId: 'camp-101',
  category: 'Misleading Content',
  details: 'Demo report for reviewing the local moderation workflow. Confirm campaign details with the listed organization.',
  evidence: [],
  status: 'pending',
  createdAt: '2026-09-20T12:00:00.000Z',
}];

function getStoredSnapshot(): AdminSnapshot {
  let orgsFromStorage: OrgApplication[] = [];
  try {
    const rawOrgs = localStorage.getItem('lewegene_orgs_v1');
    if (rawOrgs) {
      const parsedOrgs = JSON.parse(rawOrgs) as Organization[];
      orgsFromStorage = parsedOrgs.map(organizationToOrgApplication);
    }
  } catch {}

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const snapshot = JSON.parse(stored) as AdminSnapshot;
      let changed = false;
      if (!snapshot.users?.length) {
        snapshot.users = DEMO_USERS;
        changed = true;
      }
      if (!snapshot.reports) {
        snapshot.reports = [];
        changed = true;
      }

      // Sync organizations between lewegene_orgs_v1 and snapshot
      if (orgsFromStorage.length > 0) {
        const snapOrgMap = new Map(snapshot.organizations.map((o) => [o.id, o]));
        orgsFromStorage.forEach((stOrg) => {
          if (!snapOrgMap.has(stOrg.id)) {
            snapshot.organizations.unshift(stOrg);
            changed = true;
          } else {
            // Keep status/notes synchronized
            const existing = snapOrgMap.get(stOrg.id)!;
            if (existing.status !== stOrg.status || existing.decisionNote !== stOrg.decisionNote) {
              existing.status = stOrg.status;
              existing.decisionNote = stOrg.decisionNote;
              changed = true;
            }
          }
        });
      } else if (snapshot.organizations?.length > 0) {
        // Seed organizations storage from snapshot if empty
        try {
          localStorage.setItem('lewegene_orgs_v1', JSON.stringify(snapshot.organizations));
        } catch {}
      }

      if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      return snapshot;
    }
  } catch {
    // Restore an empty local admin workspace if stored demo data is malformed.
  }
  const initial: AdminSnapshot = {
    users: DEMO_USERS,
    donations: [],
    reports: DEMO_REPORTS,
    organizations: orgsFromStorage,
    activity: [],
    admins: [{
      id: 'local-admin',
      name: 'Local Demo Admin',
      email: 'admin@local.lewegene',
      role: 'super_admin',
      permissions: ['fundraisers', 'reports', 'donations', 'users', 'organizations', 'admins'],
      status: 'active',
      lastActive: new Date().toISOString(),
    }],
    currentAdminId: 'local-admin',
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function saveSnapshot(snapshot: AdminSnapshot): AdminSnapshot {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  return snapshot;
}

function addActivity(snapshot: AdminSnapshot, type: ActivityType, message: string, refId?: string): AdminSnapshot {
  return {
    ...snapshot,
    activity: [{
      id: `local-activity-${crypto.randomUUID()}`,
      type,
      message,
      actor: 'Local Demo Admin',
      actorIsAdmin: true,
      refId,
      at: new Date().toISOString(),
    }, ...snapshot.activity],
  };
}

function updateSnapshot(update: (snapshot: AdminSnapshot) => AdminSnapshot): AdminSnapshot {
  return saveSnapshot(update(getStoredSnapshot()));
}

export const adminApi = {
  async getSnapshot(): Promise<AdminSnapshot> {
    return getStoredSnapshot();
  },

  async logEvent(type: ActivityType, message: string, refId?: string): Promise<AdminSnapshot> {
    return updateSnapshot((snapshot) => addActivity(snapshot, type, message, refId));
  },

  async decideDonation(id: string, decision: 'confirmed' | 'rejected', note?: string): Promise<AdminSnapshot> {
    return updateSnapshot((snapshot) => addActivity({
      ...snapshot,
      donations: snapshot.donations.map((donation) => donation.id === id
        ? { ...donation, status: decision, decisionNote: note }
        : donation),
    }, decision === 'confirmed' ? 'donation_confirmed' : 'donation_rejected', `Donation ${decision}: ${id}`, id));
  },

  async updateReport(id: string, status: AdminReport['status'], note?: string): Promise<AdminSnapshot> {
    return updateSnapshot((snapshot) => addActivity({
      ...snapshot,
      reports: snapshot.reports.map((report) => report.id === id
        ? { ...report, status, resolutionNote: note }
        : report),
    }, status === 'reviewed' ? 'report_reviewed' : status === 'resolved' ? 'report_resolved' : 'report_dismissed', `Report ${status}: ${id}`, id));
  },

  async submitReport(report: Omit<AdminReport, 'id' | 'status' | 'createdAt'>): Promise<AdminSnapshot> {
    return updateSnapshot((snapshot) => addActivity({
      ...snapshot,
      reports: [{
        ...report,
        id: `local-report-${crypto.randomUUID()}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }, ...snapshot.reports],
    }, 'report_submitted', `Cause reported: ${report.campaignId}`, report.campaignId));
  },

  async decideOrganization(id: string, status: OrgApplication['status'], note?: string): Promise<AdminSnapshot> {
    try {
      const raw = localStorage.getItem('lewegene_orgs_v1');
      if (raw) {
        const orgs = JSON.parse(raw) as Organization[];
        const idx = orgs.findIndex((o) => o.id === id);
        if (idx >= 0) {
          orgs[idx] = {
            ...orgs[idx],
            verificationStatus: status,
            verified: status === 'approved',
            decisionNote: note,
          };
          localStorage.setItem('lewegene_orgs_v1', JSON.stringify(orgs));
        }
      }
    } catch {}

    return updateSnapshot((snapshot) => addActivity({
      ...snapshot,
      organizations: snapshot.organizations.map((organization) => organization.id === id
        ? { ...organization, status, decisionNote: note }
        : organization),
    }, status === 'approved' ? 'organization_approved' : status === 'needs_changes' ? 'organization_changes_requested' : 'organization_rejected', `Organization ${status}: ${id}`, id));
  },

  async contactOrganization(id: string, channel: 'email' | 'phone'): Promise<AdminSnapshot> {
    return updateSnapshot((snapshot) => addActivity({
      ...snapshot,
      organizations: snapshot.organizations.map((organization) => organization.id === id
        ? { ...organization, lastContactedAt: new Date().toISOString() }
        : organization),
    }, 'organization_contacted', `Organization contacted by ${channel}: ${id}`, id));
  },

  async setUserStatus(id: string, status: PlatformUser['status']): Promise<AdminSnapshot> {
    return updateSnapshot((snapshot) => addActivity({
      ...snapshot,
      users: snapshot.users.map((user) => user.id === id ? { ...user, status } : user),
    }, 'admin_action', `User ${status}: ${id}`, id));
  },

  async addAdmin(admin: Omit<AdminAccount, 'id' | 'lastActive' | 'status'>): Promise<AdminSnapshot> {
    return updateSnapshot((snapshot) => addActivity({
      ...snapshot,
      admins: [...snapshot.admins, {
        ...admin,
        id: `local-admin-${crypto.randomUUID()}`,
        status: 'active',
        lastActive: new Date().toISOString(),
      }],
    }, 'admin_action', `Administrator added: ${admin.email}`));
  },

  async updateAdmin(id: string, patch: Partial<AdminAccount>, message?: string): Promise<AdminSnapshot> {
    return updateSnapshot((snapshot) => addActivity({
      ...snapshot,
      admins: snapshot.admins.map((admin) => admin.id === id ? { ...admin, ...patch } : admin),
    }, 'admin_action', message || `Administrator updated: ${id}`, id));
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
    const snapshot = getStoredSnapshot();
    if (!snapshot.activity.length) return INITIAL_AUDIT_LOGS;
    return snapshot.activity.map((event) => ({
      id: event.id,
      action: event.type.includes('approved') ? 'approve' : event.type.includes('rejected') ? 'reject' : 'request_changes',
      targetId: event.refId || event.id,
      targetTitle: event.message,
      adminEmail: snapshot.admins.find((admin) => admin.id === snapshot.currentAdminId)?.email || 'admin@local.lewegene',
      reason: event.message,
      timestamp: event.at,
    }));
  },

  async moderateCampaign(campaignId: string, action: ModerationAction, reason?: string): Promise<{ success: boolean }> {
    const status = action === 'approve' ? 'approved' : action === 'request_changes' ? 'needs_changes' : 'rejected';
    await campaignApi.updateCampaignStatus(campaignId, status);
    await this.logEvent(
      action === 'approve' ? 'fundraiser_approved' : action === 'reject' ? 'fundraiser_rejected' : 'fundraiser_changes_requested',
      reason || `Fundraiser ${action}: ${campaignId}`,
      campaignId,
    );
    return { success: true };
  },
};
