import { mockCampaignAdapter as adapter } from './adapters/mock/campaignAdapter.ts';
import type { Campaign, CampaignStatus, CampaignUpdate } from '../types/index.ts';
import type { CreateCampaignPayload, DonatePayload, DonateResponse } from './api/campaignApi.ts';

/**
 * Campaign Service
 * The only file that changes when swapping from mock to backend API.
 */
export const campaignService = {
  list: async (filters?: { category?: string; status?: CampaignStatus }): Promise<Campaign[]> =>
    adapter.list(filters),

  getAll: async (): Promise<Campaign[]> => adapter.getAll(),

  getById: async (id: string): Promise<Campaign> => adapter.getById(id),

  create: async (payload: CreateCampaignPayload, autoApprove = false): Promise<Campaign> =>
    adapter.create(payload, autoApprove),

  donate: async (campaignId: string, payload: DonatePayload): Promise<DonateResponse> =>
    adapter.donate(campaignId, payload),

  postUpdate: async (
    campaignId: string,
    payload: { title: string; content: string; authorName: string }
  ): Promise<CampaignUpdate> => adapter.postUpdate(campaignId, payload),

  updateStatus: async (id: string, status: CampaignStatus): Promise<Campaign> =>
    adapter.updateStatus(id, status),
};
