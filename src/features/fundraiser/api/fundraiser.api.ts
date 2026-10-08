import { campaignApi } from '../../campaigns/api/campaign.api';
import { FundraiserCreationData } from '../types/fundraiser.types';
import { Campaign } from '../../campaigns/types/campaign.types';

export const fundraiserApi = {
  async publishProject(data: FundraiserCreationData): Promise<Campaign> {
    if (!data.imageUrl) throw new Error('Choose a campaign image from your computer before publishing.');
    return campaignApi.createCampaign(data);
  },
};
