import api from '../../../api/axios';
import { Campaign } from '../../campaigns/types/campaign.types';
import { AdminStats, AuditLog, ModerationAction } from '../types/admin.types';
import { INITIAL_ADMIN_STATS, INITIAL_AUDIT_LOGS } from '../data/admin.data';
import { campaignApi } from '../../campaigns/api/campaign.api';

export const adminApi = {
  async getPendingCampaigns(): Promise<Campaign[]> {
    try {
      const response = await api.get<Campaign[]>('/admin/campaigns/pending');
      return response.data;
    } catch {
      const all = await campaignApi.getAdminCampaigns();
      return all.filter((c: Campaign) => c.status === 'pending');
    }
  },

  async getAdminStats(): Promise<AdminStats> {
    try {
      const response = await api.get<AdminStats>('/admin/stats');
      return response.data;
    } catch {
      return INITIAL_ADMIN_STATS;
    }
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    try {
      const response = await api.get<AuditLog[]>('/admin/audit-logs');
      return response.data;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  },

  async moderateCampaign(campaignId: string, action: ModerationAction, reason?: string): Promise<{ success: boolean }> {
    try {
      await api.post(`/admin/campaigns/${campaignId}/moderate`, { action, reason });
      return { success: true };
    } catch {
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      await campaignApi.updateCampaignStatus(campaignId, newStatus);
      return { success: true };
    }
  },
};
