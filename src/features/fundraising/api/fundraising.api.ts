import type { Fundraiser, FundraiserFormValues, FundraiserStatus } from '../types/fundraiser.types.ts';
import { getCurrentUser } from '../data/currentUser.ts';
import { fundraiserToValues, validate } from '../schemas/fundraiser.schema.ts';

/**
 * MOCK API stored in localStorage. When the backend exists, replace the bodies with real calls
 * (the function names stay the same, so no component has to change):
 *   getMine()         -> GET   /users/me/campaigns
 *   save(values)      -> POST  /campaigns          (new)   |  PATCH /campaigns/:campaignId (existing)
 *   submit(id)        -> POST  /campaigns/:campaignId/submit
 *   requestDelete(id) -> POST  /campaigns/:campaignId/delete-request
 */
const KEY = 'lewegene_fundraisers_v1';
const wait = (ms = 200) => new Promise((r) => setTimeout(r, ms));

function read(): Fundraiser[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}
function write(list: Fundraiser[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    throw new Error('Could not save. The images may be too large — try smaller ones.');
  }
}

function applyValues(base: Fundraiser, v: FundraiserFormValues): Fundraiser {
  return {
    ...base,
    title: v.title.trim(),
    category: (v.category || 'other') as Fundraiser['category'],
    location: v.location.trim(),
    story: v.story.trim(),
    images: v.images,
    goalAmount: Number(v.goalAmount) || 0,
    deadline: v.deadline,
    beneficiaryType: v.beneficiaryType,
    beneficiary:
      v.beneficiaryType === 'myself' || v.beneficiaryType === 'community_org'
        ? { name: '', phone: '', info: '' }
        : v.beneficiary,
    organizationId: v.beneficiaryType === 'community_org' ? v.organizationId : undefined,
    bank: v.bank,
    documents: v.documents,
    updatedAt: new Date().toISOString(),
  };
}

export const fundraisingApi = {
  async getMine(): Promise<Fundraiser[]> {
    await wait();
    return read()
      .filter((f) => f.creatorId === getCurrentUser().id)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  async getById(id: string): Promise<Fundraiser | null> {
    await wait(100);
    return read().find((f) => f.id === id) ?? null;
  },

  /** Creates a new draft, or updates an existing fundraiser (its status is kept). */
  async save(values: FundraiserFormValues, id?: string): Promise<Fundraiser> {
    await wait();
    const errors = validate(values, 'draft');
    if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
    const list = read();
    const existing = id ? list.find((f) => f.id === id) : undefined;
    if (existing) {
      const updated = applyValues(existing, values);
      write(list.map((f) => (f.id === existing.id ? updated : f)));
      return updated;
    }
    const now = new Date().toISOString();
    const created = applyValues(
      {
        id: `camp-${Date.now()}`,
        creatorId: getCurrentUser().id,
        status: 'draft',
        raisedAmount: 0,
        createdAt: now,
        updatedAt: now,
      } as Fundraiser,
      values,
    );
    write([created, ...list]);
    return created;
  },

  async submit(id: string): Promise<Fundraiser> {
    await wait();
    const list = read();
    const f = list.find((x) => x.id === id);
    if (!f) throw new Error('Fundraiser not found.');
    if (Object.keys(validate(fundraiserToValues(f), 'submit')).length) {
      throw new Error('Complete all required fields before submitting.');
    }
    const updated: Fundraiser = { ...f, status: 'pending', reviewNote: undefined, updatedAt: new Date().toISOString() };
    write(list.map((x) => (x.id === id ? updated : x)));
    return updated;
  },

  /** Drafts are deleted straight away. Anything else only gets flagged for admin. */
  async requestDelete(id: string): Promise<void> {
    await wait();
    const list = read();
    const f = list.find((x) => x.id === id);
    if (!f) return;
    if (f.status === 'draft') write(list.filter((x) => x.id !== id));
    else write(list.map((x) => (x.id === id ? { ...x, deleteRequested: true } : x)));
  },

  /** DEMO ONLY — stands in for Member 5's admin screen. Remove once admin review is connected. */
  async demoReview(
    id: string,
    status: Extract<FundraiserStatus, 'approved' | 'changes_requested' | 'rejected'>,
  ): Promise<void> {
    await wait(100);
    const note =
      status === 'changes_requested'
        ? 'Please upload a clearer verification letter.'
        : status === 'rejected'
          ? 'We could not verify this fundraiser.'
          : undefined;
    write(read().map((f) => (f.id === id ? { ...f, status, reviewNote: note, updatedAt: new Date().toISOString() } : f)));
  },
};
