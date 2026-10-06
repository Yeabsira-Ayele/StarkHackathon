import { campaignApi } from '../../api/campaignApi.ts';
import { adminApi } from '../../../features/admin/api/admin.api.ts';
import type { Organization, OrganizationVerificationStatus } from '../../../types/index.ts';

export const mockOrganizationAdapter = {
  list: async (): Promise<Organization[]> => {
    return campaignApi.getOrganizations();
  },

  getById: async (id: string): Promise<Organization | null> => {
    return campaignApi.getOrganizationById(id);
  },

  getByUserId: async (userId: string, email?: string): Promise<Organization | null> => {
    const list = await campaignApi.getOrganizations();
    return (
      list.find(
        (o) =>
          (o.userId && o.userId === userId) ||
          (email && o.contactEmail.toLowerCase() === email.toLowerCase()) ||
          (o.representative?.email && email && o.representative.email.toLowerCase() === email.toLowerCase())
      ) || null
    );
  },

  register: async (data: Partial<Organization>): Promise<Organization> => {
    return campaignApi.registerOrganization({
      ...data,
      verificationStatus: 'pending',
      verified: false,
    });
  },

  update: async (id: string, patch: Partial<Organization>): Promise<Organization> => {
    return campaignApi.updateOrganization(id, patch);
  },

  decide: async (
    id: string,
    status: OrganizationVerificationStatus,
    note?: string
  ): Promise<Organization> => {
    const adminStatus =
      status === 'verified' ? 'approved' :
        status === 'under_review' ? 'pending' :
          status === 'needs_changes' ? 'needs_changes' :
            status;
    await adminApi.decideOrganization(id, adminStatus, note);
    const updated = await campaignApi.getOrganizationById(id);
    if (!updated) throw new Error(`Organization ${id} not found`);
    return updated;
  },
};
