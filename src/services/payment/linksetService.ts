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
  status: 'completed' | 'failed';
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
  status: 'completed' | 'failed';
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
    const supportedHosts = new Set([
      'transactioninfo.ethiotelecom.et',
      'apps.cbe.com.et',
      'mb.cbe.com.et',
      'mbreciept.cbe.com.et',
      'share.zemenbank.com',
      'cs.bankofabyssinia.com',
      'awashpay.awashbank.com',
    ]);
    return ['https:', 'http:'].includes(url.protocol) && supportedHosts.has(url.hostname);
  } catch {
    return false;
  }
}
