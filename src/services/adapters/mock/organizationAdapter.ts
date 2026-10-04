import { campaignApi } from '../../api/campaignApi.ts';
import { adminApi, organizationToOrgApplication } from '../../../features/admin/api/admin.api.ts';
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
    const created = await campaignApi.registerOrganization({
      ...data,
      verificationStatus: 'pending',
      verified: false,
    });

    // Make sure it immediately appears in the admin snapshot
    try {
      const snap = await adminApi.getSnapshot();
      const existing = snap.organizations.find((o) => o.id === created.id);
      if (!existing) {
        snap.organizations.unshift(organizationToOrgApplication(created));
        localStorage.setItem('lewegene_admin_snapshot_v1', JSON.stringify(snap));
      }
      await adminApi.logEvent(
        'organization_registered',
        `New organization registered: ${created.name}`,
        created.id
      );
    } catch (e) {
      console.warn('Failed to notify adminApi of organization registration', e);
    }

    return created;
  },

  update: async (id: string, patch: Partial<Organization>): Promise<Organization> => {
    const updated = await campaignApi.updateOrganization(id, patch);
    try {
      const snap = await adminApi.getSnapshot();
      const idx = snap.organizations.findIndex((o) => o.id === id);
      if (idx >= 0) {
        snap.organizations[idx] = organizationToOrgApplication(updated);
        localStorage.setItem('lewegene_admin_snapshot_v1', JSON.stringify(snap));
      }
    } catch {}
    return updated;
  },

  decide: async (
    id: string,
    status: OrganizationVerificationStatus,
    note?: string
  ): Promise<Organization> => {
    const adminStatus =
      status === 'verified' ? 'approved' : status === 'under_review' ? 'pending' : status;
    await adminApi.decideOrganization(id, adminStatus as any, note);
    const updated = await campaignApi.getOrganizationById(id);
    if (!updated) throw new Error(`Organization ${id} not found`);
    return updated;
  },
};
