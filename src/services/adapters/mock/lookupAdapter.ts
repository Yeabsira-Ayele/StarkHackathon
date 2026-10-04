import { DISCOVER_LOCATIONS, DiscoverLocation } from '../../../mock-data/locations/locations.data.ts';
import { mockBanks, Bank } from '../../../mock-data/banks/banks.data.ts';
import { CAMPAIGN_CATEGORIES, FUNDRAISING_CATEGORIES, CategoryItem } from '../../../mock-data/categories/categories.data.ts';

export const mockLookupAdapter = {
  async getLocations(): Promise<readonly DiscoverLocation[]> {
    return DISCOVER_LOCATIONS;
  },

  async getBanks(): Promise<Bank[]> {
    return mockBanks;
  },

  async getCategories(): Promise<CategoryItem[]> {
    return CAMPAIGN_CATEGORIES;
  },

  async getFundraisingCategories(): Promise<typeof FUNDRAISING_CATEGORIES> {
    return FUNDRAISING_CATEGORIES;
  },
};
