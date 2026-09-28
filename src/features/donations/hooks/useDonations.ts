import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { donationApi } from '../api/donation.api';
import { DonationSubmitPayload } from '../types/donation.types';
import { CAMPAIGNS_QUERY_KEY } from '../../campaigns/hooks/useCampaigns';

export const usePatronCertificates = () => {
  return useQuery({
    queryKey: ['my-certificates'],
    queryFn: () => donationApi.getPatronCertificates(),
  });
};

export const useSubmitDonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DonationSubmitPayload) => donationApi.submitDonation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['my-certificates'] });
    },
  });
};
