import { create } from 'zustand';
import { PaymentRail } from '../types/donation.types';

interface DonationWizardState {
  pledgeStep: number;
  pledgeAmount: number;
  customAmountStr: string;
  donorName: string;
  isAnonymous: boolean;
  donorMessage: string;
  selectedPaymentRail: PaymentRail;
  setPledgeStep: (step: number) => void;
  setPledgeAmount: (amt: number) => void;
  setCustomAmountStr: (str: string) => void;
  setDonorName: (name: string) => void;
  setIsAnonymous: (anon: boolean) => void;
  setDonorMessage: (msg: string) => void;
  setSelectedPaymentRail: (rail: PaymentRail) => void;
  resetWizard: () => void;
}

export const useDonationStore = create<DonationWizardState>((set) => ({
  pledgeStep: 1,
  pledgeAmount: 500,
  customAmountStr: '500',
  donorName: '',
  isAnonymous: false,
  donorMessage: '',
  selectedPaymentRail: 'telebirr',
  setPledgeStep: (step) => set({ pledgeStep: step }),
  setPledgeAmount: (amt) => set({ pledgeAmount: amt, customAmountStr: String(amt) }),
  setCustomAmountStr: (str) => set({ customAmountStr: str }),
  setDonorName: (name) => set({ donorName: name }),
  setIsAnonymous: (anon) => set({ isAnonymous: anon }),
  setDonorMessage: (msg) => set({ donorMessage: msg }),
  setSelectedPaymentRail: (rail) => set({ selectedPaymentRail: rail }),
  resetWizard: () =>
    set({
      pledgeStep: 1,
      pledgeAmount: 500,
      customAmountStr: '500',
      donorName: '',
      isAnonymous: false,
      donorMessage: '',
      selectedPaymentRail: 'telebirr',
    }),
}));
