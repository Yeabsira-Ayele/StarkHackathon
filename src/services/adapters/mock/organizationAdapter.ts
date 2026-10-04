import { campaignApi } from '../../api/campaignApi.ts';
import type { Organization } from '../../../types/index.ts';

export const mockOrganizationAdapter = {
  list: async (): Promise<Organization[]> => {
    return campaignApi.getOrganizations();
  },

  register: async (data: Partial<Organization>): Promise<Organization> => {
    return campaignApi.registerOrganization(data);
  },
};
