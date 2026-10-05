import api from '../../../api/axios';
import { TransparencyOverview, TransparencyAuditRecord } from '../types/reports.types';

export const reportsApi = {
  async getTransparencyOverview(): Promise<TransparencyOverview> {
    const response = await api.get<TransparencyOverview>('/reports/transparency');
    return response.data;
  },

  async getAuditRecordById(id: string): Promise<TransparencyAuditRecord | undefined> {
    const response = await api.get<TransparencyAuditRecord>(`/reports/audits/${id}`);
    return response.data;
  },
};
