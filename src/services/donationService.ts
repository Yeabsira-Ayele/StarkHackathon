import { mockDonationAdapter as adapter } from './adapters/mock/donationAdapter.ts';
import type { ContributionCertificate } from '../types/index.ts';
import type {
  LinksPaymentVerificationRequest,
  LinksPaymentVerificationResponse,
  LinksReceiptVerificationRequest,
  LinksReceiptVerificationResponse,
} from './payment/linksetService.ts';
import type { Donation, SubmitReceiptPayload } from '../features/donations/types/donation.types.ts';

/**
 * Donation & Settlement Service
 * Follows UI → donationService → mockAdapter architecture
 */
export const donationService = {
  getCertificate: async (id: string): Promise<ContributionCertificate | null> =>
    adapter.getCertificate(id),

  verifyPayment: async (
    req: LinksPaymentVerificationRequest
  ): Promise<LinksPaymentVerificationResponse> => adapter.verifyPayment(req),

  /**
   * Primary verification flow: verify a payment receipt link with Links.et mock adapter
   */
  verifyReceiptLink: async (
    req: LinksReceiptVerificationRequest
  ): Promise<LinksReceiptVerificationResponse> => adapter.verifyReceiptLink(req),

  /**
   * Finalize donation by submitting the validated receipt link
   */
  submitReceiptVerification: async (
    donationId: string,
    payload: SubmitReceiptPayload
  ): Promise<Donation> => adapter.submitReceiptVerification(donationId, payload),
};
