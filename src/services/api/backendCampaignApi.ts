import { api } from '../../api/axios.ts';
import {
  Campaign,
  CampaignCategory,
  CampaignStatus,
  CampaignUpdate,
  ContributionCertificate,
  Donation,
  Organization,
  PaymentRail,
} from '../../types/index.ts';

export interface CreateCampaignPayload {
  title: string;
  story: string;
  goalAmount: number;
  category: CampaignCategory;
  creatorName?: string;
  organizationId?: string;
  organizationName?: string;
  imageUrl?: string;
  location?: string;
  impactMetric?: string;
  beneficiariesTarget?: number;
}

export interface DonatePayload {
  amount: number;
  donorName?: string;
  message?: string;
  paymentRail?: PaymentRail;
}

export interface DonateResponse {
  success: boolean;
  donation: Donation;
  campaign: Campaign;
  certificate: ContributionCertificate;
  message: string;
}

interface BackendCampaign {
  _id?: string;
  id?: string;
  title: string;
  story: string;
  goalAmount: number;
  raisedAmount: number;
  creatorName: string;
  creatorUserId?: string;
  organizationId?: string;
  organizationName?: string;
  verifiedOrganization?: boolean;
  category: CampaignCategory;
  imageUrl?: string;
  location?: string;
  impactMetric?: string;
  beneficiariesTarget?: number;
  donationsCount?: number;
  status: CampaignStatus;
  createdAt: string | Date;
  updates?: CampaignUpdate[];
}

type BackendCampaignCollection = BackendCampaign[] | { campaigns: BackendCampaign[] };

function normalizeCampaign(campaign: BackendCampaign): Campaign {
  return {
    ...campaign,
    id: campaign._id || campaign.id || '',
    organizationId: campaign.organizationId,
    verifiedOrganization: campaign.verifiedOrganization ?? false,
    donationsCount: campaign.donationsCount || 0,
    createdAt: new Date(campaign.createdAt).toISOString(),
    updates: (campaign.updates || []).map((update) => ({
      ...update,
      id: update.id || (update as CampaignUpdate & { _id?: string })._id || '',
      campaignId: campaign._id || campaign.id || '',
      createdAt: new Date(update.createdAt).toISOString(),
    })),
  };
}

function normalizeCampaignCollection(data: BackendCampaignCollection): Campaign[] {
  return (Array.isArray(data) ? data : data.campaigns).map(normalizeCampaign);
}

interface BackendOrganization {
  _id: string;
  name: string;
  organizationType: string;
  officialEmail: string;
  phone: string;
  location: string;
  description: string;
  logo?: string;
  verificationStatus: string;
  verificationDocuments?: Array<{ name?: string; url: string }>;
  payoutAccounts?: Array<{ bankName: string; accountNumber: string; accountHolderName: string }>;
  authorizedRepresentative?: { name: string; phone: string };
  createdAt: string;
}

function normalizeOrganization(organization: BackendOrganization): Organization {
  const typeMap: Record<string, Organization['type']> = {
    ngo: 'registered_ngo',
    charity: 'charity_foundation',
    community: 'community_coop',
    religious: 'faith_based',
    school: 'registered_ngo',
    hospital: 'registered_ngo',
    other: 'registered_ngo',
  };
  const firstAccount = organization.payoutAccounts?.[0];
  return {
    id: organization._id,
    name: organization.name,
    type: typeMap[organization.organizationType] || 'registered_ngo',
    registrationNo: '',
    verified: organization.verificationStatus === 'approved',
    verificationStatus: organization.verificationStatus as Organization['verificationStatus'],
    foundedYear: new Date(organization.createdAt).getFullYear(),
    location: organization.location,
    description: organization.description,
    contactEmail: organization.officialEmail,
    contactPhone: organization.phone,
    activeProjectsCount: 0,
    totalRaised: 0,
    totalSupporters: 0,
    logoUrl: organization.logo,
    representative: organization.authorizedRepresentative
      ? { ...organization.authorizedRepresentative, role: 'Authorized representative' }
      : undefined,
    bank: firstAccount
      ? { bank: firstAccount.bankName, accountNumber: firstAccount.accountNumber, accountName: firstAccount.accountHolderName }
      : undefined,
    documents: organization.verificationDocuments?.map((document) => document.name || document.url) || [],
    submittedAt: organization.createdAt,
  };
}

export const backendCampaignApi = {
  async getCampaigns(options?: { category?: string; status?: CampaignStatus }): Promise<Campaign[]> {
    if (options?.status && options.status !== 'approved') {
      if (options.status === 'pending') return this.getAdminCampaigns();
      throw new Error(`The connected backend does not support listing campaigns with status "${options.status}".`);
    }
    const response = await api.get<{ campaigns: BackendCampaign[] }>('/campaigns', {
      params: {
        category: options?.category && options.category !== 'all' ? options.category : undefined,
        limit: 50,
      },
    });
    return response.data.campaigns.map(normalizeCampaign);
  },

  async getAllCampaigns(): Promise<Campaign[]> {
    const response = await api.get<BackendCampaignCollection>('/admin/campaigns', { params: { status: 'all' } });
    return normalizeCampaignCollection(response.data);
  },

  async getCampaignById(id: string): Promise<Campaign> {
    const response = await api.get<BackendCampaign>(`/campaigns/${id}`);
    return normalizeCampaign(response.data);
  },

  async createCampaign(payload: CreateCampaignPayload, _autoApprove = false): Promise<Campaign> {
    const response = await api.post<BackendCampaign>('/campaigns', {
      title: payload.title.trim(),
      story: payload.story.trim(),
      goalAmount: Number(payload.goalAmount),
      creatorName: payload.creatorName?.trim(),
      category: payload.category,
      imageUrl: payload.imageUrl,
      location: payload.location,
      impactMetric: payload.impactMetric,
      beneficiariesTarget: payload.beneficiariesTarget,
    });
    return normalizeCampaign(response.data);
  },

  async submitDonation(_campaignId: string, _payload: DonatePayload): Promise<DonateResponse> {
    throw new Error('Donation amounts are confirmed from a bank receipt. Submit a receipt link to complete payment verification.');
  },

  async submitVerifiedDonation(
    campaignId: string,
    payload: { receiptUrl: string; donorName?: string; message?: string },
  ) {
    const response = await api.post(`/donations/${campaignId}`, payload);
    return response.data;
  },

  async getCertificate(id: string): Promise<ContributionCertificate | null> {
    const response = await api.get<ContributionCertificate>(`/certificates/${id}`);
    return response.data;
  },

  async getOrganizations(): Promise<Organization[]> {
    const response = await api.get<{ data: { items: BackendOrganization[] } }>('/organizations');
    return response.data.data.items.map(normalizeOrganization);
  },

  async registerOrganization(data: Partial<Organization>): Promise<Organization> {
    const response = await api.post<Organization>('/organizations', data);
    return response.data;
  },

  async postCampaignUpdate(
    campaignId: string,
    payload: { title: string; content: string; authorName: string },
  ): Promise<CampaignUpdate> {
    const response = await api.post<CampaignUpdate>(`/campaigns/${campaignId}/updates`, payload);
    return response.data;
  },

  async getAdminCampaigns(): Promise<Campaign[]> {
    const response = await api.get<BackendCampaignCollection>('/admin/campaigns', { params: { status: 'pending' } });
    return normalizeCampaignCollection(response.data);
  },

  async updateCampaignStatus(id: string, status: CampaignStatus): Promise<Campaign> {
    const response = await api.patch<BackendCampaign>(`/admin/campaigns/${id}`, { status });
    return normalizeCampaign(response.data);
  },
};