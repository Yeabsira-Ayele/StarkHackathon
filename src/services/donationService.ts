import { donationApi } from '../features/donations/api/donation.api.ts';
import type { CreateDonationPayload, Donation } from '../features/donations/types/donation.types.ts';

export const donationService = {
  submitDonation: (payload: CreateDonationPayload): Promise<Donation> =>
    donationApi.createDonation(payload),
};
