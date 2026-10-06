import type { PaymentRail } from '../../types/index.ts';

export interface LinksPaymentVerificationRequest {
  campaignId: string;
  amount: number;
  paymentRail: PaymentRail;
  donorName?: string;
  phoneNumber?: string;
}

export interface LinksPaymentVerificationResponse {
  verified: boolean;
  status: 'completed' | 'failed' | 'pending';
  transactionId: string;
  railReference: string;
  settledAmount: number;
  timestamp: string;
  networkMessage: string;
}

export interface LinksReceiptVerificationRequest {
  receiptUrl: string;
  expectedAmount?: number;
  campaignId?: string;
  donorName?: string;
  beneficiaryName?: string;
}

export interface LinksReceiptVerificationResponse {
  verified: boolean;
  status: 'completed' | 'failed' | 'pending';
  amount: number;
  sender: string;
  receiver: string;
  timestamp: string;
  transactionId: string;
  railReference: string;
  receiptUrl: string;
  paymentRail: PaymentRail;
  networkMessage: string;
  failureReason?: string;
}

export function isValidReceiptUrl(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  try {
    const url = new URL(value.trim());
    return ['https:', 'http:'].includes(url.protocol) && Boolean(url.hostname);
  } catch {
    return false;
  }
}
