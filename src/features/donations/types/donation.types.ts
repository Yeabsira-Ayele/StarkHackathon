export type PaymentRail = 'telebirr' | 'cbe_birr' | 'bank_card' | 'chapa';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface Donation {
  id: string;
  campaignId: string;
  amount: number;
  donorName: string;
  message?: string;
  paymentStatus: PaymentStatus;
  paymentRail?: PaymentRail;
  transactionReference?: string;
  createdAt: string;
  certificateId?: string;
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
  paymentRail: PaymentRail;
}

export interface DonationSubmitPayload {
  campaignId: string;
  amount: number;
  donorName: string;
  message?: string;
  paymentRail: PaymentRail;
}
