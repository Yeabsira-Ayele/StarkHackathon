import { campaignApi } from '../../api/campaignApi.ts';
import { linksetService, LinksPaymentVerificationRequest, LinksPaymentVerificationResponse } from '../../payment/linksetService.ts';
import type { ContributionCertificate } from '../../../types/index.ts';

export const mockDonationAdapter = {
  getCertificate: async (id: string): Promise<ContributionCertificate | null> => {
    return campaignApi.getCertificate(id);
  },

  verifyPayment: async (
    req: LinksPaymentVerificationRequest
  ): Promise<LinksPaymentVerificationResponse> => {
    return linksetService.verifyPayment(req);
  },
};
