import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';
import { useAdminStore } from '../store/admin.store';
import { ModerationAction } from '../types/admin.types';

export const useAdmin = () => {
  const queryClient = useQueryClient();
  const { selectedCampaignId, setSelectedCampaignId } = useAdminStore();

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pendingCampaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });

  return {
    pendingCampaigns: pendingQuery.data || [],
    isLoadingPending: pendingQuery.isLoading,
    pendingError: pendingQuery.error,
    refetchPending: pendingQuery.refetch,
    stats: statsQuery.data,
    isLoadingStats: statsQuery.isLoading,
    statsError: statsQuery.error,
    refetchStats: statsQuery.refetch,
    auditLogs: auditQuery.data || [],
    isLoadingAudit: auditQuery.isLoading,
    auditError: auditQuery.error,
    refetchAudit: auditQuery.refetch,
    selectedCampaignId,
    setSelectedCampaignId,
    moderateCampaign: moderateMutation.mutateAsync,
    isModerating: moderateMutation.isPending,
  };
};
