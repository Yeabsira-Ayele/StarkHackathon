import { mockDonationAdapter as adapter } from './adapters/mock/donationAdapter.ts';
import type { ContributionCertificate } from '../types/index.ts';
import type {
  LinksPaymentVerificationRequest,
  LinksPaymentVerificationResponse,
} from './payment/linksetService.ts';

/**
 * Donation & Settlement Service
 */
export const donationService = {
  getCertificate: async (id: string): Promise<ContributionCertificate | null> =>
    adapter.getCertificate(id),

  verifyPayment: async (
    req: LinksPaymentVerificationRequest
  ): Promise<LinksPaymentVerificationResponse> => adapter.verifyPayment(req),
};
