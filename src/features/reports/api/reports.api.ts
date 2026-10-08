import api from '../../../api/axios';
import { TransparencyOverview, TransparencyAuditRecord } from '../types/reports.types';
import type { AdminReport, ReportCategory, ReportStatus } from '../../admin/types/admin.types';

interface BackendReport {
  _id: string;
  reporterId: string;
  campaignId: string;
  category: ReportCategory;
  details: string;
  evidence?: string[];
  status: ReportStatus;
  createdAt: string;
  resolutionNote?: string;
}

function normalizeReport(report: BackendReport): AdminReport {
  return {
    id: report._id,
    reporterId: String(report.reporterId),
    campaignId: String(report.campaignId),
    category: report.category,
    details: report.details,
    evidence: report.evidence || [],
    status: report.status,
    createdAt: report.createdAt,
    resolutionNote: report.resolutionNote,
  };
}

export const reportsApi = {
  async getTransparencyOverview(): Promise<TransparencyOverview> {
    const response = await api.get<{ data: TransparencyOverview }>('/reports/transparency');
    return response.data.data;
  },

  async getAuditRecordById(id: string): Promise<TransparencyAuditRecord | undefined> {
    const response = await api.get<{ data: { record: TransparencyAuditRecord } }>(`/reports/audits/${id}`);
    return response.data.data.record;
  },

  async getMyReports(): Promise<AdminReport[]> {
    const response = await api.get<{ data: { items: BackendReport[] } }>('/reports/me');
    return response.data.data.items.map(normalizeReport);
  },
};
