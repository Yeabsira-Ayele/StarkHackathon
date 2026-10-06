import type { PaymentRail as AppPaymentRail } from '../../../types/index.ts';

export type PaymentRail = 'telebirr' | 'cbe_birr' | 'bank_card' | 'chapa' | 'cbe' | 'boa' | 'awash' | 'coop' | 'dashen';

/**
 * Donation status values — Links.et automatic verification flow:
 *   - pending:   donation record created, payment reference not yet submitted
 *   - verifying: reference submitted, backend is calling Links.et to verify (resolves near-instantly)
 *   - confirmed: Links.et verified the payment successfully
 *   - failed:    Links.et could not verify the reference; donor can resubmit a different reference
 *
 * Admin manual confirm/reject is kept as a fallback path only (see Member 5 admin area),
 * not the default path every donation goes through.
 */
export type DonationStatus = 'pending' | 'verifying' | 'confirmed' | 'failed';
export type PaymentStatus = 'pending' | 'completed' | 'failed'; // for backward compatibility

export interface CampaignPayoutAccount {
  bankId: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

/**
 * Verification result returned by the Links.et payment verification service.
 * The backend calls Links.et — the frontend only submits the reference and displays
 * whatever status comes back.
 */
export interface VerificationResult {
  verifiedAt: string | null;
  verifiedAmount: number | null;
  verifiedSender: string | null;
  failureReason: string | null;
}

export interface VerifiedReceiptData {
  verified: boolean;
  status: 'completed' | 'failed' | 'pending';
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
  paymentStatus?: PaymentStatus;
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
  donorName?: string;
  donorEmail?: string;
  donorPhone?: string;
  anonymous: boolean;
  bankId: string;
  message?: string;
}

export interface SubmitReferencePayload {
  donationId: string;
  reference: string;
  proofUrl?: string;
}

export interface SubmitReceiptPayload {
  donationId: string;
  receiptUrl: string;
  proofUrl?: string;
  reference?: string;
}

export interface DonationSummaryStats {
  totalAmount: number;
  totalDonationsCount: number;
  causesSupportedCount: number;
  confirmedCount: number;
  pendingCount: number;
  verifyingCount: number;
  failedCount: number;
  largestDonation: number;
}

// Backward compatibility alias
export interface DonationSubmitPayload {
  campaignId: string;
  amount: number;
  donorName: string;
  message?: string;
  paymentRail: PaymentRail;
  donorEmail?: string;
  anonymous?: boolean;
  bankId?: string;
  reference?: string;
}
