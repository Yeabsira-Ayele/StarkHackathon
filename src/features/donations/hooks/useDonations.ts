import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { donationApi } from '../api/donation.api';
import { donationService } from '../../../services/donationService';
import { CreateDonationPayload } from '../types/donation.types';
import { CAMPAIGNS_QUERY_KEY } from '../../campaigns/hooks/useCampaigns';

export const DONATIONS_QUERY_KEY = ['my-donations'];
export const CERTIFICATES_QUERY_KEY = ['my-certificates'];

export const useCampaignPayoutAccounts = (campaignId: string, enabled = true) => useQuery({
  queryKey: ['campaign-payout-accounts', campaignId],
  queryFn: () => donationApi.getCampaignPayoutAccounts(campaignId),
  enabled: Boolean(campaignId) && enabled,
  staleTime: 60_000,
});

export const useDonationDetails = (donationId: string | undefined) => {
  return useQuery({
    queryKey: ['donation-details', donationId],
    queryFn: () => (donationId ? donationApi.getDonationDetails(donationId) : null),
    enabled: !!donationId,
  });
};

export const useMyContributions = () => {
  return useQuery({
    queryKey: DONATIONS_QUERY_KEY,
    queryFn: () => donationApi.getMyContributions(),
  });
};

export const usePatronCertificates = () => {
  return useQuery({
    queryKey: CERTIFICATES_QUERY_KEY,
    queryFn: () => donationApi.getPatronCertificates(),
  });
};

export const useCreateDonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDonationPayload) => donationService.submitDonation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DONATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CERTIFICATES_QUERY_KEY });
    },
  });
};
