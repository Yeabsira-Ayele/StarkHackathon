import type { PaymentRail as AppPaymentRail } from '../../../types/index.ts';

export type PaymentRail = 'telebirr' | 'cbe_birr' | 'bank_card' | 'chapa' | 'cbe' | 'boa' | 'awash' | 'coop' | 'dashen';

/**
 * Persisted donation records are exposed only after Links.et verification returns
 * a final result.
 */
export type DonationStatus = 'successful' | 'failed';

export interface CampaignPayoutAccount {
  bankId: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

/**
 * Verification details returned by the backend after it verifies the receipt
 * with Links.et.
 */
export interface VerificationResult {
  verifiedAt: string | null;
  verifiedAmount: number | null;
  verifiedSender: string | null;
  failureReason: string | null;
}

export interface VerifiedReceiptData {
  verified: boolean;
  status: 'completed' | 'failed';
  amount: number;
  sender: string;
  receiver: string;
  timestamp: string;
  transactionId: string;
  railReference: string;
  receiptUrl: string;
  paymentRail?: AppPaymentRail;
  railName?: string;
  networkMessage: string;
  failureReason?: string;
}

export interface Donation {
  id: string;
  campaignId: string;
  donorId?: string;
  campaignTitle?: string;
  beneficiaryName?: string;
  amount: number;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  anonymous: boolean;
  message?: string;
  bankId: string;
  bankName?: string;
  accountNumber?: string;
  reference?: string;
  proofUrl?: string;
  receiptUrl?: string;
  verifiedPayment?: VerifiedReceiptData;
  status: DonationStatus;
  verification?: VerificationResult;
  createdAt: string;
  verifiedAt?: string;
  certificateId?: string;
  
  // Backward compatibility fields
  paymentRail?: PaymentRail;
  transactionReference?: string;
}

export interface ContributionCertificate {
  certificateId: string;
  donationId: string;
  campaignId: string;
  campaignTitle: string;
  organizationName: string;
  donorName: string;
  amount: number;
  amountGeEz?: string;
  currency: string;
  impactSummary: string;
  location: string;
  issuedAt: string;
  transactionRef: string;
  paymentRail?: AppPaymentRail;
  status?: DonationStatus;
}

export interface CreateDonationPayload {
  campaignId: string;
  amount: number;
  receiptUrl: string;
  donorName?: string;
  donorEmail?: string;
  donorPhone?: string;
  anonymous: boolean;
  bankId: string;
  message?: string;
}

export interface DonationSummaryStats {
  totalAmount: number;
  totalDonationsCount: number;
  causesSupportedCount: number;
  successfulCount: number;
  failedCount: number;
  largestDonation: number;
}
