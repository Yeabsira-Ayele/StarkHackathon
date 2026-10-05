import axios from 'axios';
import { api } from '../../../api/axios.ts';
import type { Fundraiser, FundraiserFormValues, FundraiserStatus } from '../types/fundraiser.types.ts';
import { fundraiserToValues, validate } from '../schemas/fundraiser.schema.ts';

interface BackendFundraiser {
  _id: string;
  title: string;
  story: string;
  goalAmount: number;
  raisedAmount: number;
  creatorUserId: string;
  creatorName: string;
  category: Fundraiser['category'];
  imageUrl?: string;
  location?: string;
  status: FundraiserStatus;
  createdAt: string;
  updatedAt?: string;
  fundraiserData?: Partial<Fundraiser>;
  deleteRequested?: boolean;
}

function mapFundraiser(campaign: BackendFundraiser): Fundraiser {
  const details = campaign.fundraiserData || {};
  return {
    ...details,
    id: campaign._id,
    creatorId: campaign.creatorUserId,
    status: campaign.status,
    title: campaign.title,
    story: campaign.story,
    goalAmount: campaign.goalAmount,
    raisedAmount: campaign.raisedAmount,
    category: campaign.category,
    location: campaign.location || details.location || '',
    images: details.images || (campaign.imageUrl ? [campaign.imageUrl] : []),
    deadline: details.deadline || '',
    beneficiaryType: details.beneficiaryType || 'myself',
    beneficiary: details.beneficiary || { name: '', phone: '', info: '' },
    bank: details.bank || { bankId: '', accountNumber: '', accountName: '' },
    banks: details.banks || [],
    documents: details.documents || [],
    deleteRequested: campaign.deleteRequested,
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt || campaign.createdAt,
  };
}

function toBackendPayload(values: FundraiserFormValues): Partial<Fundraiser> {
  const isCommunity = values.beneficiaryType === 'community_org';
  const banks = isCommunity
    ? []
    : values.banks?.length
      ? values.banks
      : values.bank?.bankId
        ? [values.bank]
        : [];
  return {
    title: values.title.trim(),
    category: (values.category || 'other') as Fundraiser['category'],
    location: values.location.trim(),
    story: values.story.trim(),
    images: values.images,
    goalAmount: Number(values.goalAmount) || 1,
    deadline: values.deadline || '',
    beneficiaryType: values.beneficiaryType,
    beneficiary: values.beneficiaryType === 'myself' || isCommunity
      ? { name: '', phone: '', info: '' }
      : values.beneficiary,
    organizationId: isCommunity ? values.organizationId : undefined,
    bank: banks[0] || { bankId: '', accountNumber: '', accountName: '' },
    banks,
    documents: values.documents,
  };
}

export const fundraisingApi = {
  async getMine(): Promise<Fundraiser[]> {
    const response = await api.get<BackendFundraiser[]>('/campaigns/mine');
    return response.data.map(mapFundraiser).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  async getById(id: string): Promise<Fundraiser | null> {
    try {
      const response = await api.get<BackendFundraiser>(`/campaigns/${id}`);
      if (!response.data.fundraiserData) return null;
      return mapFundraiser(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) return null;
      throw error;
    }
  },

  async save(values: FundraiserFormValues, id?: string): Promise<Fundraiser> {
    const errors = validate(values, 'draft');
    if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
    const fundraiserData = toBackendPayload(values);
    const response = id
      ? await api.patch<BackendFundraiser>(`/campaigns/${id}`, {
          title: fundraiserData.title,
          story: fundraiserData.story,
          goalAmount: fundraiserData.goalAmount,
          category: fundraiserData.category,
          location: fundraiserData.location,
          imageUrl: fundraiserData.images?.[0],
          fundraiserData,
        })
      : await api.post<BackendFundraiser>('/campaigns/drafts', { fundraiserData });
    return mapFundraiser(response.data);
  },

  async submit(id: string): Promise<Fundraiser> {
    const fundraiser = await this.getById(id);
    if (!fundraiser) throw new Error('Fundraiser not found.');
    if (Object.keys(validate(fundraiserToValues(fundraiser), 'submit')).length) {
      throw new Error('Complete all required fields before submitting.');
    }
    const response = await api.post<BackendFundraiser>(`/campaigns/${id}/submit`);
    return mapFundraiser(response.data);
  },

  async requestDelete(id: string): Promise<void> {
    await api.post(`/campaigns/${id}/delete-request`);
  },

  async demoReview(
    id: string,
    status: Extract<FundraiserStatus, 'approved' | 'changes_requested' | 'rejected'>,
  ): Promise<void> {
    await api.patch(`/admin/campaigns/${id}`, { status });
  },
};
