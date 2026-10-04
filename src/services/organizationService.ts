import { mockOrganizationAdapter as adapter } from './adapters/mock/organizationAdapter.ts';
import type { Organization } from '../types/index.ts';

/**
 * Organization Service
 */
export const organizationService = {
  list: async (): Promise<Organization[]> => adapter.list(),
  register: async (data: Partial<Organization>): Promise<Organization> => adapter.register(data),
};
