import { campaignApi } from '../../api/campaignApi.ts';
import {
  linksetService,
  LinksPaymentVerificationRequest,
  LinksPaymentVerificationResponse,
  LinksReceiptVerificationRequest,
  LinksReceiptVerificationResponse,
} from '../../payment/linksetService.ts';
import { donationApi } from '../../../features/donations/api/donation.api.ts';
import type { ContributionCertificate } from '../../../types/index.ts';
import type { Donation, SubmitReceiptPayload } from '../../../features/donations/types/donation.types.ts';

export const mockDonationAdapter = {
  getCertificate: async (id: string): Promise<ContributionCertificate | null> => {
    return campaignApi.getCertificate(id);
  },

  verifyPayment: async (
    req: LinksPaymentVerificationRequest
  ): Promise<LinksPaymentVerificationResponse> => {
    return linksetService.verifyPayment(req);
  },

  /**
   * Verify an official payment receipt link with the simulated gateway.
   */
  verifyReceiptLink: async (
    req: LinksReceiptVerificationRequest
  ): Promise<LinksReceiptVerificationResponse> => {
    return linksetService.verifyReceipt(req);
  },

  /**
   * Submit receipt verification to finalize a pending donation.
   */
  submitReceiptVerification: async (
    donationId: string,
    payload: SubmitReceiptPayload
  ): Promise<Donation> => {
    return donationApi.submitReceiptVerification(donationId, payload);
  },
};
