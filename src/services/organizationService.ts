import { mockOrganizationAdapter as adapter } from './adapters/mock/organizationAdapter.ts';
import type { Organization, OrganizationVerificationStatus } from '../types/index.ts';

/**
 * Organization Service
 */
export const organizationService = {
  list: async (): Promise<Organization[]> => adapter.list(),
  getById: async (id: string): Promise<Organization | null> => adapter.getById(id),
  getByUserId: async (userId: string, email?: string): Promise<Organization | null> =>
    adapter.getByUserId(userId, email),
  register: async (data: Partial<Organization>): Promise<Organization> => adapter.register(data),
  update: async (id: string, patch: Partial<Organization>): Promise<Organization> =>
    adapter.update(id, patch),
  decide: async (
    id: string,
    status: OrganizationVerificationStatus,
    note?: string
  ): Promise<Organization> => adapter.decide(id, status, note),
};
