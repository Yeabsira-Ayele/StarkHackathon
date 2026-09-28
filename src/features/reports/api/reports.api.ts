import api from '../../../api/axios';
import { TransparencyOverview, TransparencyAuditRecord } from '../types/reports.types';
import { MOCK_TRANSPARENCY_OVERVIEW } from '../data/reports.data';

export const reportsApi = {
  async getTransparencyOverview(): Promise<TransparencyOverview> {
    try {
      const response = await api.get<TransparencyOverview>('/reports/transparency');
      return response.data;
    } catch {
      return MOCK_TRANSPARENCY_OVERVIEW;
    }
  },

  async getAuditRecordById(id: string): Promise<TransparencyAuditRecord | undefined> {
    try {
      const response = await api.get<TransparencyAuditRecord>(`/reports/audits/${id}`);
      return response.data;
    } catch {
      return MOCK_TRANSPARENCY_OVERVIEW.auditRecords.find((r) => r.id === id);
    }
  },
};
