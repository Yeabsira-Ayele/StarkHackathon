import { campaignApi } from '../../campaigns/api/campaign.api';
import { FundraiserCreationData } from '../types/fundraiser.types';
import { Campaign } from '../../campaigns/types/campaign.types';

export const fundraiserApi = {
  async publishProject(data: FundraiserCreationData): Promise<Campaign> {
    return campaignApi.createCampaign({
      ...data,
      imageUrl: data.imageUrl || '/src/assets/images/ethiopia_school_stem_1790266427111.jpg',
    });
  },
};
