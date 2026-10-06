import { mockLookupAdapter as adapter } from './adapters/mock/lookupAdapter.ts';
import type { DiscoverLocation } from '../mock-data/locations/locations.data.ts';
import type { Bank } from '../mock-data/banks/banks.data.ts';
import type { CategoryItem } from '../mock-data/categories/categories.data.ts';

/**
 * Shared Lookup Service
 * Centralizes access to locations, banks, and categories across all features.
 * In production/future, adapter swaps from mock to api adapter.
 */
export { DISCOVER_LOCATIONS, type DiscoverLocation } from '../mock-data/locations/locations.data.ts';

export const lookupService = {
  getLocations: async (): Promise<readonly DiscoverLocation[]> => adapter.getLocations(),
  getBanks: async (): Promise<Bank[]> => adapter.getBanks(),
  getCategories: async (): Promise<CategoryItem[]> => adapter.getCategories(),
  getFundraisingCategories: async () => adapter.getFundraisingCategories(),
};
