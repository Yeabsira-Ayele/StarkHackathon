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
    e.title = mode === 'draft'
      ? 'fundraiser.form.validation.draftTitleRequired'
      : 'fundraiser.form.validation.titleTooShort';
  }
  if (mode === 'draft') return e;

  if (!v.category) e.category = 'fundraiser.form.validation.chooseCategory';
  if (!v.location || !v.location.trim()) e.location = 'fundraiser.form.validation.chooseLocation';
  if (v.story.trim().length < 50) e.story = 'fundraiser.form.validation.storyTooShort';
  if (v.images.length === 0) e.images = 'fundraiser.form.validation.addImage';

  const goal = Number(v.goalAmount);
  if (!goal || goal <= 0) e.goalAmount = 'fundraiser.form.validation.goalRequired';

  // Deadline: OPTIONAL. Only validate date in the future if a deadline was specified.
  if (v.deadline && v.deadline.trim()) {
    const today = new Date().toISOString().slice(0, 10);
    if (v.deadline <= today) {
      e.deadline = 'fundraiser.form.validation.deadlineFuture';
    }
  }

  // Beneficiary details validation
  if (v.beneficiaryType === 'friend_family' || v.beneficiaryType === 'other') {
    if (!v.beneficiary.name.trim()) e['beneficiary.name'] = 'fundraiser.form.validation.beneficiaryNameRequired';
    if (!PHONE.test(v.beneficiary.phone.replace(/\s/g, ''))) {
      e['beneficiary.phone'] = 'fundraiser.form.validation.phoneInvalid';
    }
    if (!v.beneficiary.info.trim()) e['beneficiary.info'] = 'fundraiser.form.validation.beneficiaryInfoRequired';
  }

  // Community Beneficiary Rule:
  // When community_org: organizationId is required, but bank accounts are completely hidden and ignored.
  if (v.beneficiaryType === 'community_org') {
    if (!v.organizationId) {
      e.organizationId = 'fundraiser.form.validation.organizationRequired';
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
      e['banks'] = 'fundraiser.form.validation.bankRequired';
      e['bank.bankId'] = 'fundraiser.form.validation.chooseBank';
    } else {
      selectedBanks.forEach((account, idx) => {
        if (!account.bankId) {
          e[`banks.${idx}.bankId`] = 'fundraiser.form.validation.chooseBank';
          if (idx === 0) e['bank.bankId'] = 'fundraiser.form.validation.chooseBank';
        }
        if (!/^\d{8,16}$/.test(account.accountNumber.trim())) {
          e[`banks.${idx}.accountNumber`] = 'fundraiser.form.validation.accountNumberInvalid';
          if (idx === 0) e['bank.accountNumber'] = 'fundraiser.form.validation.accountNumberInvalid';
        }
        if (!account.accountName.trim()) {
          e[`banks.${idx}.accountName`] = 'fundraiser.form.validation.accountNameRequired';
          if (idx === 0) e['bank.accountName'] = 'fundraiser.form.validation.accountNameRequired';
        }
      });
    }
  }

  // Verification documents: OPTIONAL. Maximum 3 files.
  if (v.documents && v.documents.length > 3) {
    e.documents = 'fundraiser.form.validation.documentsLimit';
  }

  return e;
}
