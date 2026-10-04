import type { FormErrors, Fundraiser, FundraiserFormValues, BankAccount } from '../types/fundraiser.types.ts';

export const emptyValues: FundraiserFormValues = {
  title: '',
  category: '',
  location: '',
  story: '',
  images: [],
  goalAmount: '',
  deadline: '',
  beneficiaryType: 'myself',
  beneficiary: { name: '', phone: '', info: '' },
  organizationId: '',
  bank: { bankId: '', accountNumber: '', accountName: '' },
  banks: [],
  documents: [],
};

export function fundraiserToValues(f: Fundraiser): FundraiserFormValues {
  const initialBanks: BankAccount[] =
    f.banks && f.banks.length > 0
      ? f.banks
      : f.bank?.bankId
        ? [f.bank]
        : [];

  return {
    title: f.title,
    category: f.category,
    location: f.location,
    story: f.story,
    images: f.images,
    goalAmount: f.goalAmount ? String(f.goalAmount) : '',
    deadline: f.deadline || '',
    beneficiaryType: f.beneficiaryType,
    beneficiary: f.beneficiary,
    organizationId: f.organizationId ?? '',
    bank: initialBanks[0] || f.bank || { bankId: '', accountNumber: '', accountName: '' },
    banks: initialBanks,
    documents: f.documents || [],
  };
}

const PHONE = /^(\+251|0)[79]\d{8}$/;

/** 'draft' only needs a title. 'submit' needs everything required. */
export function validate(v: FundraiserFormValues, mode: 'draft' | 'submit'): FormErrors {
  const e: FormErrors = {};
  if (v.title.trim().length < (mode === 'draft' ? 1 : 5)) {
    e.title = mode === 'draft' ? 'Add a title so you can find this draft later.' : 'Title must be at least 5 characters.';
  }
  if (mode === 'draft') return e;

  if (!v.category) e.category = 'Choose a category.';
  if (!v.location || !v.location.trim()) e.location = 'Choose a location.';
  if (v.story.trim().length < 50) e.story = 'Tell the story in at least 50 characters.';
  if (v.images.length === 0) e.images = 'Add at least one image.';

  const goal = Number(v.goalAmount);
  if (!goal || goal <= 0) e.goalAmount = 'Enter a goal amount in ETB.';

  // Deadline: OPTIONAL. Only validate date in the future if a deadline was specified.
  if (v.deadline && v.deadline.trim()) {
    const today = new Date().toISOString().slice(0, 10);
    if (v.deadline <= today) {
      e.deadline = 'The deadline must be in the future.';
    }
  }

  // Beneficiary details validation
  if (v.beneficiaryType === 'friend_family' || v.beneficiaryType === 'other') {
    if (!v.beneficiary.name.trim()) e['beneficiary.name'] = 'Enter the beneficiary name.';
    if (!PHONE.test(v.beneficiary.phone.replace(/\s/g, ''))) e['beneficiary.phone'] = 'Use an Ethiopian number like 0911223344.';
    if (!v.beneficiary.info.trim()) e['beneficiary.info'] = 'Explain who the beneficiary is.';
  }

  // Community Beneficiary Rule:
  // When community_org: organizationId is required, but bank accounts are completely hidden and ignored.
  if (v.beneficiaryType === 'community_org') {
    if (!v.organizationId) {
      e.organizationId = 'Choose the community or organization.';
    }
  } else {
    // Other beneficiary types: require at least one bank account
    const selectedBanks: BankAccount[] =
      v.banks && v.banks.length > 0
        ? v.banks
        : v.bank?.bankId
          ? [v.bank]
          : [];

    if (selectedBanks.length === 0) {
      e['banks'] = 'Choose at least one bank account.';
      e['bank.bankId'] = 'Choose a bank.';
    } else {
      selectedBanks.forEach((account, idx) => {
        if (!account.bankId) {
          e[`banks.${idx}.bankId`] = 'Choose a bank.';
          if (idx === 0) e['bank.bankId'] = 'Choose a bank.';
        }
        if (!/^\d{8,16}$/.test(account.accountNumber.trim())) {
          e[`banks.${idx}.accountNumber`] = 'Account number must be 8–16 digits.';
          if (idx === 0) e['bank.accountNumber'] = 'Account number must be 8–16 digits.';
        }
        if (!account.accountName.trim()) {
          e[`banks.${idx}.accountName`] = 'Enter the account holder name.';
          if (idx === 0) e['bank.accountName'] = 'Enter the account holder name.';
        }
      });
    }
  }

  // Verification documents: OPTIONAL. Maximum 3 files.
  if (v.documents && v.documents.length > 3) {
    e.documents = 'You can upload a maximum of 3 supporting documents.';
  }

  return e;
}
