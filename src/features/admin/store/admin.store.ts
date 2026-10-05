import { create } from 'zustand';
import { AuditLog, AdminStats } from '../types/admin.types';

interface AdminState {
  stats: AdminStats;
  auditLogs: AuditLog[];
  selectedCampaignId: string | null;
  setStats: (stats: AdminStats) => void;
  addAuditLog: (log: AuditLog) => void;
  setSelectedCampaignId: (id: string | null) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  stats: {
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    totalVolumeETB: 0,
    activeFoundations: 0,
  },
  auditLogs: [],
  selectedCampaignId: null,
  setStats: (stats) => set({ stats }),
  addAuditLog: (log) =>
    set((state) => ({ auditLogs: [log, ...state.auditLogs] })),
  setSelectedCampaignId: (id) => set({ selectedCampaignId: id }),
}));
