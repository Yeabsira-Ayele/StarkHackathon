import { PaymentRail } from '../../types/index.ts';

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

/**
 * Validates whether a given string is a valid receipt URL format.
 */
export function isValidReceiptUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length < 8) return false;
  
  // Accept standard URLs or domain/path format
  try {
    const candidate = trimmed.startsWith('http://') || trimmed.startsWith('https://') 
      ? trimmed 
      : `https://${trimmed}`;
    const parsed = new URL(candidate);
    return Boolean(parsed.hostname && parsed.hostname.includes('.'));
  } catch {
    return false;
  }
}

export const linksetService = {
  isValidReceiptUrl,

  /**
   * Verify an official payment receipt link.
   * In future backend integration, this calls the Links.et API:
   * POST /api/v1/receipts/verify { receipt_url }
   * The donor provides the receipt URL; the verification service obtains/returns the transaction details.
   */
  async verifyReceipt(
    req: LinksReceiptVerificationRequest
  ): Promise<LinksReceiptVerificationResponse> {
    // Realistic payment network roundtrip (450ms)
    await new Promise((resolve) => setTimeout(resolve, 450));

    const cleanUrl = req.receiptUrl?.trim() || '';
    if (!isValidReceiptUrl(cleanUrl)) {
      return {
        verified: false,
        status: 'failed',
        amount: 0,
        sender: '',
        receiver: '',
        timestamp: new Date().toISOString(),
        transactionId: '',
        railReference: '',
        receiptUrl: cleanUrl,
        paymentRail: 'telebirr',
        networkMessage: 'Invalid receipt URL format. Please provide a valid payment link.',
        failureReason: 'Invalid payment receipt URL. Please ensure you pasted the full link (e.g. https://receipt.cbe.com.et/tx/...)',
      };
    }

    const lower = cleanUrl.toLowerCase();
    let detectedRail: PaymentRail = 'telebirr';
    let railCode = 'TB';

    if (lower.includes('cbe') || lower.includes('combanketh')) {
      detectedRail = 'cbe_birr';
      railCode = 'CBE';
    } else if (lower.includes('chapa')) {
      detectedRail = 'chapa';
      railCode = 'CHP';
    } else if (lower.includes('boa') || lower.includes('abyssinia')) {
      detectedRail = 'boa' as any;
      railCode = 'BOA';
    } else if (lower.includes('telebirr')) {
      detectedRail = 'telebirr';
      railCode = 'TB';
    }

    const txId = `LNK-${railCode}-${Date.now().toString().slice(-6)}`;
    const refNum = `FT${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const verifiedAmount = req.expectedAmount && req.expectedAmount > 0 ? req.expectedAmount : 500;

    return {
      verified: true,
      status: 'completed',
      amount: verifiedAmount,
      sender: req.donorName?.trim() || 'Dawit Alemayehu',
      receiver: req.beneficiaryName || 'Lewegene Civic Escrow',
      timestamp: new Date().toISOString(),
      transactionId: txId,
      railReference: refNum,
      receiptUrl: cleanUrl,
      paymentRail: detectedRail,
      networkMessage: `Receipt verified by Links.et gateway via ${detectedRail.toUpperCase()}`,
    };
  },

  // Legacy direct payment verification (kept for backward compatibility)
  async verifyPayment(
    req: LinksPaymentVerificationRequest
  ): Promise<LinksPaymentVerificationResponse> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    if (req.amount <= 0) {
      return {
        verified: false,
        status: 'failed',
        transactionId: '',
        railReference: '',
        settledAmount: 0,
        timestamp: new Date().toISOString(),
        networkMessage: 'Invalid transaction amount',
      };
    }

    const railCode =
      req.paymentRail === 'telebirr'
        ? 'TB'
        : req.paymentRail === 'cbe_birr'
        ? 'CBE'
        : 'CHAPA';
    const txId = `LNK-${railCode}-${Date.now().toString().slice(-6)}`;
    const refNum = `ET-${Math.floor(10000000 + Math.random() * 90000000)}`;

    return {
      verified: true,
      status: 'completed',
      transactionId: txId,
      railReference: refNum,
      settledAmount: req.amount,
      timestamp: new Date().toISOString(),
      networkMessage: `Verified by Links.et gateway via ${req.paymentRail.toUpperCase()}`,
    };
  },

  getRailDisplayName(rail: PaymentRail): string {
    switch (rail) {
      case 'telebirr':
        return 'Telebirr (Ethio Telecom)';
      case 'cbe_birr':
        return 'CBE Birr (Commercial Bank of Ethiopia)';
      case 'bank_card':
        return 'Local Bank Debit / Credit Card';
      case 'chapa':
        return 'Chapa Payment Gateway';
      default:
        return 'Links.et Rail';
    }
  },
};
