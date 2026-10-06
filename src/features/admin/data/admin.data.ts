import { AdminPermission, AdminRoleName, AdminStats, AuditLog, FundraiserReviewInfo } from '../types/admin.types';

export const INITIAL_ADMIN_STATS: AdminStats = {
  pendingCount: 0,
  approvedCount: 0,
  rejectedCount: 0,
  totalVolumeETB: 0,
  activeFoundations: 0,
};

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const ADMIN_ALL_PERMISSIONS: AdminPermission[] = [
  'fundraisers',
  'reports',
  'donations',
  'users',
  'organizations',
  'admins',
];

export const ADMIN_ROLE_LABELS: Record<AdminRoleName, string> = {
  super_admin: 'Super admin',
  moderator: 'Moderator',
  finance: 'Finance',
};

export const ADMIN_ROLE_DEFAULT_PERMISSIONS: Record<AdminRoleName, AdminPermission[]> = {
  super_admin: [...ADMIN_ALL_PERMISSIONS],
  moderator: ['fundraisers', 'reports', 'users', 'organizations'],
  finance: ['donations', 'reports'],
};

export const getFundraiserReviewInfo = (
  _fundraiserId: string,
  _creatorName: string,
): FundraiserReviewInfo | null => {
  return null;
};
