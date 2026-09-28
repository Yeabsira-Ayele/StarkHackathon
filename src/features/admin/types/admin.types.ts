import { Campaign } from '../../campaigns/types/campaign.types';

export type ModerationAction = 'approve' | 'reject' | 'request_changes';

export interface AuditLog {
  id: string;
  action: ModerationAction;
  targetId: string;
  targetTitle: string;
  adminEmail: string;
  reason?: string;
  timestamp: string;
}

export interface AdminStats {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalVolumeETB: number;
  activeFoundations: number;
}
