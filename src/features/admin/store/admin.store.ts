import { create } from 'zustand';
import { AuditLog, AdminStats } from '../types/admin.types';
import { INITIAL_ADMIN_STATS, INITIAL_AUDIT_LOGS } from '../data/admin.data';

interface AdminState {
  stats: AdminStats;
  auditLogs: AuditLog[];
  selectedCampaignId: string | null;
  setStats: (stats: AdminStats) => void;
  addAuditLog: (log: AuditLog) => void;
  setSelectedCampaignId: (id: string | null) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  stats: INITIAL_ADMIN_STATS,
  auditLogs: INITIAL_AUDIT_LOGS,
  selectedCampaignId: null,
  setStats: (stats) => set({ stats }),
  addAuditLog: (log) =>
    set((state) => ({ auditLogs: [log, ...state.auditLogs] })),
  setSelectedCampaignId: (id) => set({ selectedCampaignId: id }),
}));
