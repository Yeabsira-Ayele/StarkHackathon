import type { FormErrors, Fundraiser, FundraiserFormValues } from '../types/fundraiser.types.ts';

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
  documents: [],
};

export function fundraiserToValues(f: Fundraiser): FundraiserFormValues {
  return {
    title: f.title,
    category: f.category,
    location: f.location,
    story: f.story,
    images: f.images,
    goalAmount: f.goalAmount ? String(f.goalAmount) : '',
    deadline: f.deadline,
    beneficiaryType: f.beneficiaryType,
    beneficiary: f.beneficiary,
    organizationId: f.organizationId ?? '',
    bank: f.bank,
    documents: f.documents,
  };
}

const PHONE = /^(\+251|0)[79]\d{8}$/;

/** 'draft' only needs a title. 'submit' needs everything. */
export function validate(v: FundraiserFormValues, mode: 'draft' | 'submit'): FormErrors {
  const e: FormErrors = {};
  if (v.title.trim().length < (mode === 'draft' ? 1 : 5)) {
    e.title = mode === 'draft' ? 'Add a title so you can find this draft later.' : 'Title must be at least 5 characters.';
  }
  if (mode === 'draft') return e;

  if (!v.category) e.category = 'Choose a category.';
  if (!v.location.trim()) e.location = 'Enter the location.';
  if (v.story.trim().length < 50) e.story = 'Tell the story in at least 50 characters.';
  if (v.images.length === 0) e.images = 'Add at least one image.';

  const goal = Number(v.goalAmount);
  if (!goal || goal <= 0) e.goalAmount = 'Enter a goal amount in ETB.';

  const today = new Date().toISOString().slice(0, 10);
  if (!v.deadline) e.deadline = 'Choose a deadline.';
  else if (v.deadline <= today) e.deadline = 'The deadline must be in the future.';

  if (v.beneficiaryType === 'friend_family' || v.beneficiaryType === 'other') {
    if (!v.beneficiary.name.trim()) e['beneficiary.name'] = 'Enter the beneficiary name.';
    if (!PHONE.test(v.beneficiary.phone.replace(/\s/g, ''))) e['beneficiary.phone'] = 'Use an Ethiopian number like 0911223344.';
    if (!v.beneficiary.info.trim()) e['beneficiary.info'] = 'Explain who the beneficiary is.';
  }
  if (v.beneficiaryType === 'community_org' && !v.organizationId) {
    e.organizationId = 'Choose the community or organization.';
  }

  if (!v.bank.bankId) e['bank.bankId'] = 'Choose a bank.';
  if (!/^\d{8,16}$/.test(v.bank.accountNumber.trim())) e['bank.accountNumber'] = 'Account number must be 8–16 digits.';
  if (!v.bank.accountName.trim()) e['bank.accountName'] = 'Enter the account holder name.';

  if (v.documents.length === 0) e.documents = 'Add at least one supporting document.';
  return e;
}
