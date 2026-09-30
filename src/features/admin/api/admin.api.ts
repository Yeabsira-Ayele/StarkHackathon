import {
  ActivityEvent,
  ActivityType,
  AdminAccount,
  AdminDonation,
  AdminReport,
  AdminSnapshot,
  OrgApplication,
  PlatformUser,
} from '../types/admin.types.ts';
import { seedSnapshot } from '../data/admin.data.ts';

// Mock admin API. Same persistence pattern as campaignApi (localStorage).
// Each function notes the backend endpoint it will be swapped for later.
const KEY = 'lewegene_admin_v1';
const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

function read(): AdminSnapshot {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* fall through to seed */
  }
  const seed = seedSnapshot();
  write(seed);
  return seed;
}

function write(s: AdminSnapshot) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch (err) {
    console.error('Failed to persist admin data', err);
  }
}

function withEvent(s: AdminSnapshot, type: ActivityType, message: string, refId?: string): AdminSnapshot {
  const me = s.admins.find((a) => a.id === s.currentAdminId);
  const ev: ActivityEvent = {
    id: `ev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type,
    message,
    actor: me?.name || 'Admin',
    actorIsAdmin: true,
    refId,
    at: new Date().toISOString(),
  };
  return { ...s, activity: [ev, ...s.activity] };
}

async function mutate(fn: (s: AdminSnapshot) => AdminSnapshot): Promise<AdminSnapshot> {
  await delay();
  const next = fn(read());
  write(next);
  return next;
}

export const adminApi = {
  async getSnapshot(): Promise<AdminSnapshot> {
    await delay(80);
    return read();
  },

  // Generic event log entry, used for fundraiser actions handled through campaignApi.
  logEvent: (type: ActivityType, message: string, refId?: string) =>
    mutate((s) => withEvent(s, type, message, refId)),

  // POST /admin/donations/:id/confirm | reject
  decideDonation: (id: string, decision: 'confirmed' | 'rejected', note?: string) =>
    mutate((s) => {
      const d = s.donations.find((x) => x.id === id);
      const next: AdminSnapshot = {
        ...s,
        donations: s.donations.map((x): AdminDonation =>
          x.id === id ? { ...x, status: decision, decisionNote: note } : x
        ),
      };
      return withEvent(
        next,
        decision === 'confirmed' ? 'donation_confirmed' : 'donation_rejected',
        `Donation of ${(d?.amount || 0).toLocaleString()} ETB ${decision}`,
        id
      );
    }),

  // POST /admin/reports/:id/(review|resolve|dismiss)
  updateReport: (id: string, status: AdminReport['status'], note?: string) =>
    mutate((s) => {
      const next: AdminSnapshot = {
        ...s,
        reports: s.reports.map((r): AdminReport =>
          r.id === id ? { ...r, status, resolutionNote: note ?? r.resolutionNote } : r
        ),
      };
      const type = (`report_${status}` as ActivityType);
      return withEvent(next, type, `Report moved to ${status}`, id);
    }),

  // POST /admin/organizations/:id/(approve|request-changes|reject)
  decideOrganization: (id: string, status: OrgApplication['status'], note?: string) =>
    mutate((s) => {
      const org = s.organizations.find((o) => o.id === id);
      const next: AdminSnapshot = {
        ...s,
        organizations: s.organizations.map((o): OrgApplication =>
          o.id === id ? { ...o, status, decisionNote: note } : o
        ),
      };
      const map = {
        approved: ['organization_approved', 'approved'],
        needs_changes: ['organization_changes_requested', 'asked for changes'],
        rejected: ['organization_rejected', 'rejected'],
        pending: ['admin_action', 'set to pending'],
      } as const;
      const [type, verb] = map[status];
      return withEvent(next, type as ActivityType, `${org?.name || 'Organization'} ${verb}`, id);
    }),

  contactOrganization: (id: string, channel: 'email' | 'phone') =>
    mutate((s) => {
      const org = s.organizations.find((o) => o.id === id);
      const next: AdminSnapshot = {
        ...s,
        organizations: s.organizations.map((o) =>
          o.id === id ? { ...o, lastContactedAt: new Date().toISOString() } : o
        ),
      };
      return withEvent(next, 'organization_contacted', `Contacted ${org?.name} by ${channel}`, id);
    }),

  setUserStatus: (id: string, status: PlatformUser['status']) =>
    mutate((s) => {
      const u = s.users.find((x) => x.id === id);
      const next = { ...s, users: s.users.map((x) => (x.id === id ? { ...x, status } : x)) };
      return withEvent(next, 'admin_action', `User ${u?.name} ${status === 'suspended' ? 'suspended' : 'reactivated'}`, id);
    }),

  // POST /admin/admins
  addAdmin: (admin: Omit<AdminAccount, 'id' | 'lastActive' | 'status'>) =>
    mutate((s) => {
      const created: AdminAccount = {
        ...admin,
        id: `adm-${Date.now()}`,
        status: 'active',
        lastActive: new Date().toISOString(),
      };
      return withEvent({ ...s, admins: [...s.admins, created] }, 'admin_action', `Admin account created: ${admin.name}`, created.id);
    }),

  // PATCH /admin/admins/:id
  updateAdmin: (id: string, patch: Partial<AdminAccount>, message?: string) =>
    mutate((s) => {
      const next = { ...s, admins: s.admins.map((a) => (a.id === id ? { ...a, ...patch } : a)) };
      const a = s.admins.find((x) => x.id === id);
      return message ? withEvent(next, 'admin_action', message.replace('{name}', a?.name || ''), id) : next;
    }),

  resetDemoData: async () => {
    const seed = seedSnapshot();
    write(seed);
    return seed;
  },
};
