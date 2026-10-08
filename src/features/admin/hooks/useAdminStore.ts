import { useCallback, useEffect, useMemo, useState } from 'react';
import { Campaign } from '../../../types/index.ts';
import { campaignApi } from '../../../services/api/campaignApi.ts';
import { adminApi } from '../api/admin.api.ts';
import { AdminSnapshot } from '../types/admin.types.ts';

const EMPTY_ADMIN_SNAPSHOT: AdminSnapshot = {
  users: [],
  donations: [],
  reports: [],
  organizations: [],
  activity: [],
  admins: [],
  adminCandidates: [],
  currentAdminId: '',
  isSuperAdmin: false,
  unavailableSections: ['users', 'donations', 'reports', 'organizations', 'activity', 'admins', 'profile'],
};

export interface AdminStoreOptions {
  // Existing App handlers: approving / rejecting also refreshes the public feed.
  onApproveCampaign?: (id: string) => void | Promise<void>;
  onRejectCampaign?: (id: string) => void | Promise<void>;
}

// Admin records are loaded from the API; unsupported backend resources are left empty or report errors.
export function useAdminStore({ onApproveCampaign, onRejectCampaign }: AdminStoreOptions) {
  const [snapshot, setSnapshot] = useState<AdminSnapshot | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [snapshotResult, campaignResult] = await Promise.allSettled([
      adminApi.getSnapshot(),
      campaignApi.getAllCampaigns(),
    ]);
    const errors: string[] = [];

    if (snapshotResult.status === 'fulfilled') {
      setSnapshot(snapshotResult.value);
    } else {
      errors.push(snapshotResult.reason instanceof Error ? snapshotResult.reason.message : 'Could not load admin records');
      setSnapshot((current) => {
        const snapshot = current ?? EMPTY_ADMIN_SNAPSHOT;
        return {
          ...snapshot,
          unavailableSections: Array.from(new Set([...(snapshot.unavailableSections ?? []), 'organizations'])),
        };
      });
    }

    if (campaignResult.status === 'fulfilled') {
      setCampaigns(campaignResult.value);
      setSnapshot((current) => {
        const snapshot = current ?? EMPTY_ADMIN_SNAPSHOT;
        return {
          ...snapshot,
          unavailableSections: (snapshot.unavailableSections ?? []).filter((section) => section !== 'fundraisers'),
        };
      });
    } else {
      errors.push(campaignResult.reason instanceof Error ? campaignResult.reason.message : 'Could not load fundraisers');
      setSnapshot((current) => {
        const snapshot = current ?? EMPTY_ADMIN_SNAPSHOT;
        return {
          ...snapshot,
          unavailableSections: Array.from(new Set([...(snapshot.unavailableSections ?? []), 'fundraisers'])),
        };
      });
    }
    setError(errors.length ? errors.join(' ') : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const run = useCallback(
    async (fn: () => Promise<AdminSnapshot | void>) => {
      const res = await fn();
      if (res) setSnapshot(res);
      setCampaigns(await campaignApi.getAllCampaigns());
    },
    []
  );

  const campaignById = useMemo(() => new Map(campaigns.map((c) => [c.id, c])), [campaigns]);

  const actions = useMemo(
    () => ({
      refresh,
      // Fundraisers
      approveFundraiser: (c: Campaign) =>
        run(async () => {
          if (onApproveCampaign) await onApproveCampaign(c.id);
          else await adminApi.moderateCampaign(c.id, 'approve');
        }),
      requestFundraiserChanges: (c: Campaign, reason: string) =>
        run(async () => {
          await adminApi.moderateCampaign(c.id, 'request_changes', reason);
        }),
      rejectFundraiser: (c: Campaign, reason: string) =>
        run(async () => {
          if (onRejectCampaign) await onRejectCampaign(c.id);
          else await adminApi.moderateCampaign(c.id, 'reject', reason);
        }),
      // Reports
      updateReport: (id: string, status: 'reviewed' | 'resolved' | 'dismissed', note?: string) =>
        run(() => adminApi.updateReport(id, status, note)),
      // Organizations
      decideOrganization: (id: string, status: 'approved' | 'needs_changes' | 'rejected', note?: string) =>
        run(() => adminApi.decideOrganization(id, status, note)),
      contactOrganization: (id: string, channel: 'email' | 'phone') =>
        run(() => adminApi.contactOrganization(id, channel)),
      // Users
      setUserStatus: (id: string, status: 'active' | 'suspended') => run(() => adminApi.setUserStatus(id, status)),
      // Admins
      addAdmin: (userId: string) => run(() => adminApi.addAdmin(userId)),
      removeAdmin: (id: string) => run(() => adminApi.removeAdmin(id)),
      updateAdmin: (id: string, patch: Parameters<typeof adminApi.updateAdmin>[1], message?: string) =>
        run(() => adminApi.updateAdmin(id, patch, message)),
      changePassword: (currentPassword: string, newPassword: string) =>
        adminApi.changePassword(currentPassword, newPassword),
    }),
    [refresh, run, onApproveCampaign, onRejectCampaign]
  );

  return { snapshot, campaigns, campaignById, loading, error, actions };
}

export type AdminStore = ReturnType<typeof useAdminStore>;
