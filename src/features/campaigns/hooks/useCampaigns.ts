import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignApi } from '../api/campaign.api';
import { useCampaignStore } from '../store/campaign.store';
import { CampaignFormData } from '../schemas/campaign.schema';

export const CAMPAIGNS_QUERY_KEY = ['campaigns'] as const;

export const useCampaigns = () => {
  const { searchQuery, selectedCategory, filterStatus } = useCampaignStore();

  const query = useQuery({
    queryKey: CAMPAIGNS_QUERY_KEY,
    queryFn: () => campaignApi.getCampaigns(),
  });

  const campaigns = query.data || [];

  // Filter logic applied on data
  const filteredCampaigns = campaigns.filter((c) => {
    // Search filter
    const matchesSearch =
      !searchQuery.trim() ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.story.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.location && c.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.organizationName && c.organizationName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.serialCode && c.serialCode.toLowerCase().includes(searchQuery.toLowerCase()));

    // Category filter
    const matchesCategory =
      selectedCategory === 'all' || c.category === selectedCategory;

    // Status filter
    let matchesStatus = true;
    if (filterStatus === 'active') {
      matchesStatus = ['pending', 'approved'].includes(c.status) && c.raisedAmount < c.goalAmount;
    } else if (filterStatus === 'nearly_funded') {
      const pct = (c.raisedAmount / c.goalAmount) * 100;
      matchesStatus = pct >= 70 && pct < 100;
    } else if (filterStatus === 'completed') {
      matchesStatus = c.raisedAmount >= c.goalAmount || c.status === 'completed';
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return {
    ...query,
    campaigns,
    filteredCampaigns,
  };
};

export const useCampaignDetails = (id?: string | null) => {
  return useQuery({
    queryKey: ['campaign', id],
    queryFn: () => (id ? campaignApi.getCampaignById(id) : Promise.reject('No ID provided')),
    enabled: Boolean(id),
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CampaignFormData) => campaignApi.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEY });
    },
  });
};
