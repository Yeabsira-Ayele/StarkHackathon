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
  selectedBankId: string;

  // Step 4: Account Details & Copy
  accountCopied: boolean;

  // Step 5: Payment Reference
  reference: string;
  proofUrl?: string;

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
  setSelectedBankId: (bankId: string) => void;
  setAccountCopied: (copied: boolean) => void;
  setReference: (ref: string) => void;
  setProofUrl: (url?: string) => void;
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
  selectedBankId: 'bank_cbe',
  accountCopied: false,
  reference: '',
  proofUrl: undefined,
  createdDonation: null,
  activeCertificate: null,

  // Setters
  setStep: (step) => set({ step, pledgeStep: step }),
  setAmount: (amt) => set({ amount: amt, pledgeAmount: amt, customAmountStr: String(amt) }),
  setCustomAmountStr: (str) => set({ customAmountStr: str }),
  setDonorName: (name) => set({ donorName: name }),
  setDonorEmail: (email) => set({ donorEmail: email }),
  setIsAnonymous: (anon) => set({ isAnonymous: anon }),
  setDonorMessage: (msg) => set({ donorMessage: msg }),
  setSelectedBankId: (bankId) => set({ selectedBankId: bankId }),
  setAccountCopied: (copied) => set({ accountCopied: copied }),
  setReference: (ref) => set({ reference: ref }),
  setProofUrl: (url) => set({ proofUrl: url }),
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
      selectedBankId: 'bank_cbe',
      accountCopied: false,
      reference: '',
      proofUrl: undefined,
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
