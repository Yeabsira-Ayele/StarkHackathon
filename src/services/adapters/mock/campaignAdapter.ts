import { campaignApi, CreateCampaignPayload, DonatePayload, DonateResponse } from '../../api/campaignApi.ts';
import type { Campaign, CampaignStatus, CampaignUpdate } from '../../../types/index.ts';

export const mockCampaignAdapter = {
  list: async (filters?: { category?: string; status?: CampaignStatus }): Promise<Campaign[]> => {
    return campaignApi.getCampaigns(filters);
  },

  getAll: async (): Promise<Campaign[]> => {
    return campaignApi.getAllCampaigns();
  },

  getById: async (id: string): Promise<Campaign> => {
    return campaignApi.getCampaignById(id);
  },

  create: async (payload: CreateCampaignPayload, autoApprove = false): Promise<Campaign> => {
    return campaignApi.createCampaign(payload, autoApprove);
  },

  donate: async (campaignId: string, payload: DonatePayload): Promise<DonateResponse> => {
    return campaignApi.submitDonation(campaignId, payload);
  },

  postUpdate: async (
    campaignId: string,
    payload: { title: string; content: string; authorName: string }
  ): Promise<CampaignUpdate> => {
    return campaignApi.postCampaignUpdate(campaignId, payload);
  },

  updateStatus: async (id: string, status: CampaignStatus): Promise<Campaign> => {
    return campaignApi.updateCampaignStatus(id, status);
  },
};
