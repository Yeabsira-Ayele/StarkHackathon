import { create } from 'zustand';
import { FundraiserCreationData } from '../types/fundraiser.types';

interface FundraiserState {
  currentStep: number;
  draft: Partial<FundraiserCreationData>;
  isSubmitting: boolean;
  setStep: (step: number) => void;
  updateDraft: (data: Partial<FundraiserCreationData>) => void;
  resetDraft: () => void;
  setIsSubmitting: (submitting: boolean) => void;
}

const initialDraft: Partial<FundraiserCreationData> = {
  category: 'medical',
  goalAmount: 50000,
  location: 'Addis Ababa, Ethiopia',
};

export const useFundraiserStore = create<FundraiserState>((set) => ({
  currentStep: 1,
  draft: initialDraft,
  isSubmitting: false,
  setStep: (step) => set({ currentStep: step }),
  updateDraft: (data) =>
    set((state) => ({ draft: { ...state.draft, ...data } })),
  resetDraft: () => set({ draft: initialDraft, currentStep: 1 }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
}));
