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

export const linksetService = {
  // Simulate backend-authoritative Links.et payment gateway verification
  async verifyPayment(
    req: LinksPaymentVerificationRequest
  ): Promise<LinksPaymentVerificationResponse> {
    // Realistic payment network roundtrip (300-500ms)
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
