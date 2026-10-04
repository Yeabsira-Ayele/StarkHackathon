import type { Fundraiser, FundraiserFormValues, FundraiserStatus } from '../types/fundraiser.types.ts';
import { getCurrentUser } from '../data/currentUser.ts';
import { fundraiserToValues, validate } from '../schemas/fundraiser.schema.ts';
import { campaignApi as localCampaignApi } from '../../../services/api/campaignApi.ts';

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
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('lewegene:personal-data-changed'));
    }
  } catch {
    throw new Error('Could not save. The images may be too large — try smaller ones.');
  }
}

function applyValues(base: Fundraiser, v: FundraiserFormValues): Fundraiser {
  const isCommunity = v.beneficiaryType === 'community_org';
  const resolvedBanks = isCommunity
    ? []
    : v.banks && v.banks.length > 0
      ? v.banks
      : v.bank?.bankId
        ? [v.bank]
        : [];
  const primaryBank = resolvedBanks[0] || { bankId: '', accountNumber: '', accountName: '' };

  return {
    ...base,
    title: v.title.trim(),
    category: (v.category || 'other') as Fundraiser['category'],
    location: v.location.trim(),
    story: v.story.trim(),
    images: v.images,
    goalAmount: Number(v.goalAmount) || 0,
    deadline: v.deadline || '',
    beneficiaryType: v.beneficiaryType,
    beneficiary:
      v.beneficiaryType === 'myself' || isCommunity
        ? { name: '', phone: '', info: '' }
        : v.beneficiary,
    organizationId: isCommunity ? v.organizationId : undefined,
    bank: primaryBank,
    banks: resolvedBanks,
    documents: v.documents,
    updatedAt: new Date().toISOString(),
  };
}

export const fundraisingApi = {
  async getMine(): Promise<Fundraiser[]> {
    await wait();
    const campaigns = await localCampaignApi.getAllCampaigns();
    const synced = read().map((fundraiser) => {
      const campaign = campaigns.find((item) => item.id === fundraiser.id);
      if (!campaign) return fundraiser;
      const status: Fundraiser['status'] = campaign.status === 'needs_changes' ? 'changes_requested' : campaign.status;
      return { ...fundraiser, status, raisedAmount: campaign.raisedAmount, updatedAt: campaign.createdAt };
    });
    write(synced);
    return synced
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

    // Rule 6: A user must not have more than one active/incomplete fundraiser
    const ACTIVE_STATUSES: FundraiserStatus[] = ['pending', 'changes_requested', 'approved', 'paused'];
    const currentUserId = getCurrentUser().id;
    const existingActive = list.find(
      (item) => item.creatorId === currentUserId && item.id !== id && ACTIVE_STATUSES.includes(item.status)
    );
    if (existingActive) {
      throw new Error(
        `You already have an active fundraiser in progress ("${existingActive.title}"). Lewegene policy permits only one active or incomplete fundraiser at a time.`
      );
    }
    const campaigns = await localCampaignApi.getAllCampaigns();
    if (!campaigns.some((campaign) => campaign.id === f.id)) {
      await localCampaignApi.createCampaign({
        id: f.id,
        title: f.title,
        story: f.story,
        goalAmount: f.goalAmount,
        category: f.category as import('../../../types/index.ts').CampaignCategory,
        creatorName: getCurrentUser().name,
        organizationId: f.organizationId || undefined,
        organizationName: f.beneficiaryType === 'community_org' ? 'Community Organization' : undefined,
        imageUrl: f.images[0],
        location: f.location,
      }, false);
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
