import {
  Campaign,
  CampaignStatus,
  CampaignUpdate,
  ContributionCertificate,
  Organization,
} from '../../types/index.ts';
import axios from 'axios';
import { api } from '../../api/axios.ts';
import { backendCampaignApi, CreateCampaignPayload, DonatePayload, DonateResponse } from './backendCampaignApi.ts';
import { donationApi } from '../../features/donations/api/donation.api.ts';

export type { CreateCampaignPayload, DonatePayload, DonateResponse };

export const campaignApi = {
  async getCampaigns(options?: { category?: string; status?: CampaignStatus }): Promise<Campaign[]> {
    return backendCampaignApi.getCampaigns(options);
  },

  async getAllCampaigns(): Promise<Campaign[]> {
    return backendCampaignApi.getAllCampaigns();
  },

  async getCampaignById(id: string): Promise<Campaign> {
    return backendCampaignApi.getCampaignById(id);
  },

  async createCampaign(payload: CreateCampaignPayload, _autoApprove = false): Promise<Campaign> {
    return backendCampaignApi.createCampaign(payload);
  },

  async submitDonation(campaignId: string, payload: DonatePayload): Promise<DonateResponse> {
    throw new Error(`Create a contribution draft and verify a bank receipt before recording a donation to campaign ${campaignId} (${payload.amount} ETB).`);
  },

  async getCertificate(certificateId: string): Promise<ContributionCertificate | null> {
    return donationApi.getCertificate(certificateId);
  },

  async getOrganizations(): Promise<Organization[]> {
    return backendCampaignApi.getOrganizations();
  },

  async getMyOrganization(): Promise<Organization | null> {
    return backendCampaignApi.getMyOrganization();
  },

  async getOrganizationById(id: string): Promise<Organization | null> {
    try {
      const response = await api.get<{ data: { organization: Record<string, unknown> } }>(`/organizations/${id}`);
      const organization = response.data.data.organization;
      const backend = organization as {
        _id: string; name: string; organizationType: string; officialEmail: string; phone: string;
        location: string; description: string; logo?: string; verificationStatus: string; createdAt: string;
        authorizedRepresentative?: { name: string; phone: string };
      };
      const types: Record<string, Organization['type']> = {
        ngo: 'registered_ngo', charity: 'charity_foundation', community: 'community_coop',
        religious: 'faith_based', school: 'registered_ngo', hospital: 'registered_ngo', other: 'registered_ngo',
      };
      return {
        id: backend._id,
        name: backend.name,
        type: types[backend.organizationType] || 'registered_ngo',
        registrationNo: '',
        verified: backend.verificationStatus === 'approved',
        verificationStatus: backend.verificationStatus as Organization['verificationStatus'],
        foundedYear: new Date(backend.createdAt).getFullYear(),
        location: backend.location,
        description: backend.description,
        contactEmail: backend.officialEmail,
        contactPhone: backend.phone,
        activeProjectsCount: 0,
        totalRaised: 0,
        totalSupporters: 0,
        logoUrl: backend.logo,
        representative: backend.authorizedRepresentative
          ? { ...backend.authorizedRepresentative, role: 'Authorized representative' }
          : undefined,
        submittedAt: backend.createdAt,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) return null;
      throw error;
    }
  },

  async registerOrganization(_data: Partial<Organization>): Promise<Organization> {
    throw new Error('Organization signup requires the full verification application and account password. Submit it through the organization registration form.');
  },

  async updateOrganization(id: string, patch: Partial<Organization>): Promise<Organization> {
    const response = await api.patch<{ data: { organization: Record<string, unknown> } }>('/organizations/me', {
      name: patch.name,
      phone: patch.contactPhone,
      location: patch.location,
      description: patch.description,
      logo: patch.logoUrl,
    });
    const updated = response.data.data.organization as { _id: string; name: string; location: string; description: string; officialEmail: string; phone: string; verificationStatus: string; createdAt: string };
    const existing = await this.getOrganizationById(id);
    if (!existing) throw new Error(`Organization ${id} not found.`);
    return {
      ...existing,
      id: updated._id,
      name: updated.name,
      location: updated.location,
      description: updated.description,
      contactEmail: updated.officialEmail,
      contactPhone: updated.phone,
      verificationStatus: updated.verificationStatus as Organization['verificationStatus'],
      verified: updated.verificationStatus === 'approved',
      submittedAt: updated.createdAt,
    };
  },

  async postCampaignUpdate(
    campaignId: string,
    payload: { title: string; content: string; authorName: string },
  ): Promise<CampaignUpdate> {
    const response = await api.post<Record<string, unknown>>(`/campaigns/${campaignId}/updates`, payload);
    return {
      id: String(response.data._id || ''),
      campaignId,
      title: String(response.data.title || payload.title),
      content: String(response.data.content || payload.content),
      authorName: String(response.data.authorName || payload.authorName),
      createdAt: new Date(String(response.data.createdAt)).toISOString(),
    };
  },

  async getAdminCampaigns(): Promise<Campaign[]> {
    return backendCampaignApi.getAdminCampaigns();
  },

  async updateCampaign(id: string, patch: Partial<Campaign>): Promise<Campaign> {
    const response = await api.patch<Record<string, unknown>>(`/campaigns/${id}`, patch);
    return backendCampaignApi.getCampaignById(String(response.data._id || id));
  },

  async updateCampaignStatus(id: string, status: CampaignStatus): Promise<Campaign> {
    if (status !== 'approved' && status !== 'rejected') {
      throw new Error('Campaign moderation supports only approved or rejected status.');
    }
    return backendCampaignApi.updateCampaignStatus(id, status);
  },

  async resetDemoData(): Promise<void> {
    throw new Error('Demo reset is disabled; campaign and donation data is stored in MongoDB.');
  },
};
