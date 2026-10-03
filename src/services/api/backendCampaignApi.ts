import { api } from '../../api/axios.ts';
import {
  Campaign,
  CampaignCategory,
  CampaignStatus,
  CampaignUpdate,
  ContributionCertificate,
  Donation,
  Organization,
  PaymentRail,
} from '../../types/index.ts';

export interface CreateCampaignPayload {
  title: string;
  story: string;
  goalAmount: number;
  category: CampaignCategory;
  creatorName?: string;
  organizationId?: string;
  organizationName?: string;
  imageUrl?: string;
  location?: string;
  impactMetric?: string;
  beneficiariesTarget?: number;
}

export interface DonatePayload {
  amount: number;
  donorName?: string;
  message?: string;
  paymentRail?: PaymentRail;
}

export interface DonateResponse {
  success: boolean;
  donation: Donation;
  campaign: Campaign;
  certificate: ContributionCertificate;
  message: string;
}

interface BackendCampaign extends Omit<Campaign, 'id' | 'createdAt'> {
  _id?: string;
  id?: string;
  createdAt: string | Date;
}

function normalizeCampaign(campaign: BackendCampaign): Campaign {
  return {
    ...campaign,
    id: campaign._id || campaign.id || '',
    createdAt: new Date(campaign.createdAt).toISOString(),
  };
}

export const backendCampaignApi = {
  async getCampaigns(options?: { category?: string; status?: CampaignStatus }): Promise<Campaign[]> {
    if (options?.status && options.status !== 'approved') {
      if (options.status === 'pending') return this.getAdminCampaigns();
      throw new Error(`The connected backend does not support listing campaigns with status "${options.status}".`);
    }
    const response = await api.get<{ campaigns: BackendCampaign[] }>('/campaigns', {
      params: { category: options?.category && options.category !== 'all' ? options.category : undefined },
    });
    return response.data.campaigns.map(normalizeCampaign);
  },

  async getAllCampaigns(): Promise<Campaign[]> {
    const response = await api.get<{ campaigns: BackendCampaign[] }>('/campaigns');
    return response.data.campaigns.map(normalizeCampaign);
  },

  async getCampaignById(id: string): Promise<Campaign> {
    const response = await api.get<BackendCampaign>(`/campaigns/${id}`);
    return normalizeCampaign(response.data);
  },

  async createCampaign(payload: CreateCampaignPayload, _autoApprove = false): Promise<Campaign> {
    const response = await api.post<BackendCampaign>('/campaigns', {
      title: payload.title.trim(),
      story: payload.story.trim(),
      goalAmount: Number(payload.goalAmount),
      creatorName: payload.creatorName?.trim(),
      category: payload.category,
      imageUrl: payload.imageUrl,
    });
    return normalizeCampaign(response.data);
  },

  async submitDonation(_campaignId: string, _payload: DonatePayload): Promise<DonateResponse> {
    throw new Error('Donation amounts are confirmed from a bank receipt. Submit a receipt link to complete payment verification.');
  },

  async submitVerifiedDonation(
    campaignId: string,
    payload: { receiptUrl: string; donorName?: string; message?: string },
  ) {
    const response = await api.post(`/donations/${campaignId}`, payload);
    return response.data;
  },

  async getCertificate(id: string): Promise<ContributionCertificate | null> {
    const response = await api.get<ContributionCertificate>(`/certificates/${id}`);
    return response.data;
  },

  async getOrganizations(): Promise<Organization[]> {
    const response = await api.get<Organization[]>('/organizations');
    return response.data;
  },

  async registerOrganization(data: Partial<Organization>): Promise<Organization> {
    const response = await api.post<Organization>('/organizations', data);
    return response.data;
  },

  async postCampaignUpdate(
    campaignId: string,
    payload: { title: string; content: string; authorName: string },
  ): Promise<CampaignUpdate> {
    const response = await api.post<CampaignUpdate>(`/campaigns/${campaignId}/updates`, payload);
    return response.data;
  },

  async getAdminCampaigns(): Promise<Campaign[]> {
    const response = await api.get<BackendCampaign[]>('/admin/campaigns');
    return response.data.map(normalizeCampaign);
  },

  async updateCampaignStatus(id: string, status: CampaignStatus): Promise<Campaign> {
    const response = await api.patch<BackendCampaign>(`/admin/campaigns/${id}`, { status });
    return normalizeCampaign(response.data);
  },
};