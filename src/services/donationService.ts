import { donationApi } from '../features/donations/api/donation.api.ts';
import type { Donation, SubmitReceiptPayload } from '../features/donations/types/donation.types.ts';

export const donationService = {
  submitReceiptVerification: async (
    donationId: string,
    payload: SubmitReceiptPayload,
  ): Promise<Donation> => donationApi.submitReceiptVerification(donationId, payload),
};
