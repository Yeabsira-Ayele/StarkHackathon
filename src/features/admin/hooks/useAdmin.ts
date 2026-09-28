import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';
import { useAdminStore } from '../store/admin.store';
import { ModerationAction } from '../types/admin.types';

export const useAdmin = () => {
  const queryClient = useQueryClient();
  const { stats, auditLogs, addAuditLog, selectedCampaignId, setSelectedCampaignId } = useAdminStore();

  const pendingQuery = useQuery({
    queryKey: ['admin', 'pendingCampaigns'],
    queryFn: () => adminApi.getPendingCampaigns(),
  });

  const statsQuery = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.getAdminStats(),
  });

  const auditQuery = useQuery({
    queryKey: ['admin', 'auditLogs'],
    queryFn: () => adminApi.getAuditLogs(),
  });

  const moderateMutation = useMutation({
    mutationFn: ({
      campaignId,
      action,
      reason,
      title,
    }: {
      campaignId: string;
      action: ModerationAction;
      reason?: string;
      title: string;
    }) => adminApi.moderateCampaign(campaignId, action, reason),
    onSuccess: (_, variables) => {
      addAuditLog({
        id: `audit-${Date.now()}`,
        action: variables.action,
        targetId: variables.campaignId,
        targetTitle: variables.title,
        adminEmail: 'oversight@acso.gov.et',
        reason: variables.reason,
        timestamp: new Date().toISOString(),
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'pendingCampaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });

  return {
    pendingCampaigns: pendingQuery.data || [],
    isLoadingPending: pendingQuery.isLoading,
    stats: statsQuery.data || stats,
    auditLogs: auditQuery.data || auditLogs,
    selectedCampaignId,
    setSelectedCampaignId,
    moderateCampaign: moderateMutation.mutateAsync,
    isModerating: moderateMutation.isPending,
  };
};
