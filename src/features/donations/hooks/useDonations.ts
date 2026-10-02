import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { donationApi } from '../api/donation.api';
import {
  CreateDonationPayload,
  SubmitReferencePayload,
  DonationSubmitPayload,
} from '../types/donation.types';
import { CAMPAIGNS_QUERY_KEY } from '../../campaigns/hooks/useCampaigns';

export const BANKS_QUERY_KEY = ['banks'];
export const DONATIONS_QUERY_KEY = ['my-donations'];
export const CERTIFICATES_QUERY_KEY = ['my-certificates'];

export const useBanks = () => {
  return useQuery({
    queryKey: BANKS_QUERY_KEY,
    queryFn: () => donationApi.getBanks(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

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
    mutationFn: (payload: CreateDonationPayload) => donationApi.createDonation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DONATIONS_QUERY_KEY });
    },
  });
};

/**
 * Submits a payment reference for automatic verification via Links.et.
 *
 * The mock implementation simulates what the real backend will do:
 * accepts a reference, returns after a short simulated delay (1–2 seconds),
 * and resolves to either a `confirmed` or `failed` result — so the UI's
 * loading/success/failure states can all be built and tested now,
 * before the real backend exists.
 *
 * In production, POST /donations/:donationId/verify triggers the backend's
 * Links.et API call. The frontend only submits the reference and displays
 * whatever status comes back.
 */
export const useSubmitPaymentReference = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      donationId,
      payload,
    }: {
      donationId: string;
      payload: SubmitReferencePayload;
    }) => donationApi.submitPaymentReference(donationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DONATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CERTIFICATES_QUERY_KEY });
    },
  });
};

// Keep the old name as an alias for backward compatibility
export const useSubmitReference = useSubmitPaymentReference;

/**
 * Admin fallback: manually confirm a donation.
 * This is the exception path for edge cases where Links.et verification
 * fails or is inconclusive. Not the default path every donation goes through.
 */
export const useConfirmDonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (donationId: string) => donationApi.confirmDonation(donationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DONATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEY });
    },
  });
};

// Backward compatibility hook
export const useSubmitDonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DonationSubmitPayload) => donationApi.submitDonation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DONATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CERTIFICATES_QUERY_KEY });
    },
  });
};
