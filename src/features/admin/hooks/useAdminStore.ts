import { useCallback, useEffect, useMemo, useState } from 'react';
import { Campaign } from '../../../types/index.ts';
import { campaignApi } from '../../../services/api/campaignApi.ts';
import { adminApi } from '../api/admin.api.ts';
import { AdminSnapshot } from '../types/admin.types.ts';

export interface AdminStoreOptions {
  // Existing App handlers: approving / rejecting also refreshes the public feed.
  onApproveCampaign?: (id: string) => void | Promise<void>;
  onRejectCampaign?: (id: string) => void | Promise<void>;
}

// NOW: reads mock data. LATER: swap internals for TanStack Query + axios (same return shape).
export function useAdminStore({ onApproveCampaign, onRejectCampaign }: AdminStoreOptions) {
  const [snapshot, setSnapshot] = useState<AdminSnapshot | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [snap, all] = await Promise.all([adminApi.getSnapshot(), campaignApi.getAllCampaigns()]);
      setSnapshot(snap);
      setCampaigns(all);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load admin data');
    } finally {
      setLoading(false);
    }
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
          else await campaignApi.updateCampaignStatus(c.id, 'approved');
          return adminApi.logEvent('fundraiser_approved', `Fundraiser approved: ${c.title}`, c.id);
        }),
      requestFundraiserChanges: (c: Campaign, reason: string) =>
        run(async () => {
          await campaignApi.updateCampaignStatus(c.id, 'needs_changes');
          return adminApi.logEvent('fundraiser_changes_requested', `Changes requested on ${c.title}: ${reason}`, c.id);
        }),
      rejectFundraiser: (c: Campaign, reason: string) =>
        run(async () => {
          if (onRejectCampaign) await onRejectCampaign(c.id);
          else await campaignApi.updateCampaignStatus(c.id, 'rejected');
          return adminApi.logEvent('fundraiser_rejected', `Fundraiser rejected: ${c.title} (${reason})`, c.id);
        }),
      // Donations
      confirmDonation: (id: string) => run(() => adminApi.decideDonation(id, 'confirmed')),
      rejectDonation: (id: string, note: string) => run(() => adminApi.decideDonation(id, 'rejected', note)),
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
      addAdmin: (a: Parameters<typeof adminApi.addAdmin>[0]) => run(() => adminApi.addAdmin(a)),
      updateAdmin: (id: string, patch: Parameters<typeof adminApi.updateAdmin>[1], message?: string) =>
        run(() => adminApi.updateAdmin(id, patch, message)),
    }),
    [refresh, run, onApproveCampaign, onRejectCampaign]
  );

  return { snapshot, campaigns, campaignById, loading, error, actions };
}

export type AdminStore = ReturnType<typeof useAdminStore>;
