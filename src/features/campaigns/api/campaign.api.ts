import { CampaignFormData } from '../schemas/campaign.schema';
import { backendCampaignApi } from '../../../services/api/backendCampaignApi.ts';

export const campaignApi = {
  getCampaigns: () => backendCampaignApi.getCampaigns(),
  getCampaignById: (id: string) => backendCampaignApi.getCampaignById(id),
  createCampaign: (data: CampaignFormData) => backendCampaignApi.createCampaign(data),
};
