import { create } from 'zustand';
import { Donation, ContributionCertificate, PaymentRail } from '../types/donation.types';

export type SupportFlowStep = 1 | 2 | 3 | 4 | 5 | 6;

interface DonationWizardState {
  // Current Step
  step: SupportFlowStep;
  
  // Step 1: Amount
  amount: number;
  customAmountStr: string;

  // Step 2: Donor Info
  donorName: string;
  donorEmail: string;
  isAnonymous: boolean;
  donorMessage: string;

  // Step 3: Bank
  selectedAccountId: string;

  // Step 4: Account Details & Copy
  accountCopied: boolean;

  // Step 5: Payment Receipt Link
  receiptUrl: string;

  // Step 6: Created Result
  createdDonation: Donation | null;
  activeCertificate: ContributionCertificate | null;

  // Setters
  setStep: (step: SupportFlowStep) => void;
  setAmount: (amt: number) => void;
  setCustomAmountStr: (str: string) => void;
  setDonorName: (name: string) => void;
  setDonorEmail: (email: string) => void;
  setIsAnonymous: (anon: boolean) => void;
  setDonorMessage: (msg: string) => void;
  setSelectedAccountId: (accountId: string) => void;
  setAccountCopied: (copied: boolean) => void;
  setReceiptUrl: (url: string) => void;
  setCreatedDonation: (donation: Donation | null) => void;
  setActiveCertificate: (cert: ContributionCertificate | null) => void;
  resetWizard: () => void;

  // Backward compatibility aliases
  pledgeStep: number;
  pledgeAmount: number;
  selectedPaymentRail: PaymentRail;
  setPledgeStep: (step: number) => void;
  setPledgeAmount: (amt: number) => void;
  setSelectedPaymentRail: (rail: PaymentRail) => void;
}

export const useDonationStore = create<DonationWizardState>((set, get) => ({
  step: 1,
  amount: 500,
  customAmountStr: '500',
  donorName: '',
  donorEmail: '',
  isAnonymous: false,
  donorMessage: '',
  selectedAccountId: '',
  accountCopied: false,
  receiptUrl: '',
  createdDonation: null,
  activeCertificate: null,

  // Setters
  setStep: (step) => set({ step, pledgeStep: step }),
  setAmount: (amt) => set({ amount: amt, pledgeAmount: amt, customAmountStr: String(amt) }),
  setCustomAmountStr: (str) => {
    const amount = Number(str);
    set({
      customAmountStr: str,
      amount: Number.isFinite(amount) ? amount : 0,
      pledgeAmount: Number.isFinite(amount) ? amount : 0,
    });
  },
  setDonorName: (name) => set({ donorName: name }),
  setDonorEmail: (email) => set({ donorEmail: email }),
  setIsAnonymous: (anon) => set({ isAnonymous: anon }),
  setDonorMessage: (msg) => set({ donorMessage: msg }),
  setSelectedAccountId: (accountId) => set({ selectedAccountId: accountId }),
  setAccountCopied: (copied) => set({ accountCopied: copied }),
  setReceiptUrl: (url) => set({ receiptUrl: url }),
  setCreatedDonation: (donation) => set({ createdDonation: donation }),
  setActiveCertificate: (cert) => set({ activeCertificate: cert }),

  resetWizard: () =>
    set({
      step: 1,
      pledgeStep: 1,
      amount: 500,
      pledgeAmount: 500,
      customAmountStr: '500',
      donorName: '',
      donorEmail: '',
      isAnonymous: false,
      donorMessage: '',
      selectedAccountId: '',
      accountCopied: false,
      receiptUrl: '',
      createdDonation: null,
      activeCertificate: null,
    }),

  // Backward compatibility
  pledgeStep: 1,
  pledgeAmount: 500,
  selectedPaymentRail: 'telebirr',
  setPledgeStep: (s) => set({ pledgeStep: s, step: (s as any) }),
  setPledgeAmount: (amt) => set({ pledgeAmount: amt, amount: amt, customAmountStr: String(amt) }),
  setSelectedPaymentRail: (rail) => set({ selectedPaymentRail: rail }),
}));
