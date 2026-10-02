import type { FundraiserStatus } from '../types/fundraiser.types.ts';

export const formatEtb = (n: number) => `${n.toLocaleString('en-US')} ETB`;

export const formatDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const STATUS_LABELS: Record<FundraiserStatus, string> = {
  draft: 'Draft',
  pending: 'Pending review',
  changes_requested: 'Changes requested',
  approved: 'Live',
  rejected: 'Rejected',
  completed: 'Completed',
  paused: 'Paused',
};

/** Statuses the creator may still edit. Rejected and completed are locked. */
export const EDITABLE: FundraiserStatus[] = ['draft', 'changes_requested', 'pending', 'approved', 'paused'];
