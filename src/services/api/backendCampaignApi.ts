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

type BackendRecord = Record<string, unknown>;

function asRecord(value: unknown): BackendRecord | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as BackendRecord
    : undefined;
}

function firstValue<T>(record: BackendRecord, keys: string[], fallback: T): T {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null) return value as T;
  }
  return fallback;
}

function relatedId(value: unknown): string | undefined {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  const record = asRecord(value);
  if (!record) return undefined;
  const id = firstValue(record, ['_id', 'id', 'userId', 'organizationId'], undefined);
  return id === undefined ? undefined : String(id);
}

function validDate(value: unknown): string {
  const parsed = value instanceof Date ? value : new Date(typeof value === 'string' || typeof value === 'number' ? value : '');
  if (Number.isNaN(parsed.getTime())) throw new Error('The backend returned a campaign with an invalid created date.');
  return parsed.toISOString();
}

const CAMPAIGN_CATEGORIES: CampaignCategory[] = [
  'medical', 'education', 'emergency', 'business', 'water', 'environment', 'community', 'other',
];

function normalizeCategory(value: unknown): CampaignCategory {
  return typeof value === 'string' && CAMPAIGN_CATEGORIES.includes(value as CampaignCategory) ? value as CampaignCategory : 'other';
}

function normalizeStatus(value: unknown): CampaignStatus {
  if (value === undefined || value === null || value === '') return 'pending';
  if (value === 'changes_requested' || value === 'needs_changes') return 'needs_changes';
  if (value === 'draft' || value === 'pending' || value === 'approved' || value === 'rejected' || value === 'completed' || value === 'paused') {
    return value;
  }
  throw new Error(`The backend returned an unsupported campaign status: ${String(value)}.`);
}

function normalizeCampaign(value: unknown): Campaign {
  const campaign = asRecord(value);
  if (!campaign) throw new Error('The backend returned an invalid campaign record.');

  const id = String(firstValue(campaign, ['_id', 'id', 'campaignId', 'fundraiserId'], ''));
  if (!id) throw new Error('The backend returned a campaign without an ID.');
  const updateValue = firstValue<unknown>(campaign, ['updates'], []);
  const updates = Array.isArray(updateValue) ? updateValue.map((value) => {
    const update = asRecord(value);
    if (!update) throw new Error(`Campaign ${id} contains an invalid update record.`);
    return {
      id: String(firstValue(update, ['id', '_id'], '')),
      campaignId: id,
      title: String(firstValue(update, ['title'], '')),
      content: String(firstValue(update, ['content'], '')),
      authorName: String(firstValue(update, ['authorName', 'creatorName'], '')),
      createdAt: validDate(update.createdAt),
      images: Array.isArray(update.images) ? update.images.map(String) : undefined,
    } satisfies CampaignUpdate;
  }) : [];

  return {
    id,
    title: String(firstValue(campaign, ['title', 'name'], '')),
    story: String(firstValue(campaign, ['story', 'description'], '')),
    goalAmount: Number(firstValue(campaign, ['goalAmount', 'amount', 'targetAmount'], 0)),
    raisedAmount: Number(firstValue(campaign, ['raisedAmount', 'currentRaisedAmount', 'currentRaised'], 0)),
    creatorName: String(firstValue(campaign, ['creatorName', 'fundraiserName', 'beneficiaryName'], 'Anonymous')),
    organizationId: relatedId(campaign.organizationId),
    organizationName: String(firstValue(campaign, ['organizationName'], '')) || undefined,
    verifiedOrganization: Boolean(campaign.verifiedOrganization ?? campaign.organizationVerified ?? false),
    category: normalizeCategory(campaign.category),
    imageUrl: typeof campaign.imageUrl === 'string' ? campaign.imageUrl : undefined,
    location: typeof campaign.location === 'string' ? campaign.location : undefined,
    impactMetric: typeof campaign.impactMetric === 'string' ? campaign.impactMetric : undefined,
    beneficiariesTarget: Number.isFinite(Number(campaign.beneficiariesTarget)) ? Number(campaign.beneficiariesTarget) : undefined,
    donationsCount: Number(firstValue(campaign, ['donationsCount', 'contributionCount'], 0)),
    status: normalizeStatus(firstValue(campaign, ['status', 'currentApprovalStatus'], 'pending')),
    createdAt: validDate(firstValue(campaign, ['createdAt', 'submittedAt'], undefined)),
    updates,
  };
}

function findCampaignArray(payload: unknown, depth = 0): unknown[] | undefined {
  if (Array.isArray(payload)) return payload;
  if (depth > 4) return undefined;
  const record = asRecord(payload);
  if (!record) return undefined;
  for (const key of ['campaigns', 'fundraisers', 'items', 'data', 'result']) {
    const found = findCampaignArray(record[key], depth + 1);
    if (found) return found;
  }
  return undefined;
}

function normalizeCampaignCollection(payload: unknown): Campaign[] {
  const records = findCampaignArray(payload);
  if (!records) throw new Error('The backend response did not contain a campaign list.');
  return records.map(normalizeCampaign);
}

function findCampaignRecord(payload: unknown, depth = 0): unknown {
  if (depth > 4) return undefined;
  const record = asRecord(payload);
  if (!record) return undefined;
  if (record._id || record.id || record.campaignId || record.fundraiserId) return record;
  for (const key of ['campaign', 'fundraiser', 'item', 'data', 'result']) {
    const found = findCampaignRecord(record[key], depth + 1);
    if (found) return found;
  }
  return undefined;
}

function normalizeCampaignResponse(payload: unknown): Campaign {
  return normalizeCampaign(findCampaignRecord(payload) ?? payload);
}

function findRecords(payload: unknown, keys: string[], depth = 0): unknown[] {
  if (depth > 4) throw new Error('The backend response did not contain a list.');
  const record = asRecord(payload);
  if (!record) {
    if (Array.isArray(payload)) return payload;
    throw new Error('The backend response did not contain a list.');
  }
  for (const key of keys) {
    if (Array.isArray(record[key])) return record[key] as unknown[];
  }
  for (const key of ['data', 'result']) {
    if (record[key] !== undefined) return findRecords(record[key], keys, depth + 1);
  }
  throw new Error('The backend response did not contain a list.');
}

function normalizeOrganization(value: unknown): Organization {
  const organization = asRecord(value);
  if (!organization) throw new Error('The backend returned an invalid organization record.');
  const typeMap: Record<string, Organization['type']> = {
    ngo: 'registered_ngo',
    charity: 'charity_foundation',
    community: 'community_coop',
    religious: 'faith_based',
    school: 'registered_ngo',
    hospital: 'registered_ngo',
    other: 'registered_ngo',
  };
  const payoutAccounts = Array.isArray(organization.payoutAccounts) ? organization.payoutAccounts : [];
  const firstAccount = asRecord(payoutAccounts[0]);
  const verificationDocuments = Array.isArray(organization.verificationDocuments) ? organization.verificationDocuments : [];
  const organizationId = relatedId(organization);
  if (!organizationId) throw new Error('The backend returned an organization without an ID.');
  const organizationType = String(firstValue(organization, ['organizationType', 'type'], 'other'));
  const submittedAt = validDate(firstValue(organization, ['createdAt', 'submittedAt'], undefined));
  const verificationStatus = String(firstValue(organization, ['verificationStatus', 'status'], 'pending'));
  return {
    id: organizationId,
    name: String(firstValue(organization, ['name', 'organizationName'], '')),
    type: typeMap[organizationType] || 'registered_ngo',
    registrationNo: '',
    verified: verificationStatus === 'approved' || verificationStatus === 'verified',
    verificationStatus: verificationStatus as Organization['verificationStatus'],
    foundedYear: new Date(submittedAt).getFullYear(),
    location: String(firstValue(organization, ['location', 'address'], '')),
    description: String(firstValue(organization, ['description'], '')),
    contactEmail: String(firstValue(organization, ['officialEmail', 'email', 'contactEmail'], '')),
    contactPhone: String(firstValue(organization, ['phone', 'contactPhone'], '')),
    activeProjectsCount: 0,
    totalRaised: 0,
    totalSupporters: 0,
    logoUrl: typeof organization.logo === 'string' ? organization.logo : typeof organization.logoUrl === 'string' ? organization.logoUrl : undefined,
    representative: organization.authorizedRepresentative
      ? {
          name: String(firstValue(asRecord(organization.authorizedRepresentative) || {}, ['name'], '')),
          phone: String(firstValue(asRecord(organization.authorizedRepresentative) || {}, ['phone'], '')),
          role: 'Authorized representative',
        }
      : undefined,
    bank: firstAccount
      ? {
          bank: String(firstValue(firstAccount, ['bankName', 'bank'], '')),
          accountNumber: String(firstValue(firstAccount, ['accountNumber'], '')),
          accountName: String(firstValue(firstAccount, ['accountHolderName', 'accountName'], '')),
        }
      : undefined,
    documents: verificationDocuments.map((document) => {
      const entry = asRecord(document);
      return entry ? String(firstValue(entry, ['name', 'url'], '')) : String(document);
    }).filter(Boolean),
    submittedAt,
  };
}

export const backendCampaignApi = {
  async getCampaigns(options?: { category?: string; status?: CampaignStatus }): Promise<Campaign[]> {
    if (options?.status && options.status !== 'approved' && options.status !== 'pending') {
      throw new Error(`The connected backend does not support listing campaigns with status "${options.status}".`);
    }
    if (options?.status === 'pending') return this.getAdminCampaigns();
    const response = await api.get<unknown>('/campaigns', {
      params: {
        category: options?.category && options.category !== 'all' ? options.category : undefined,
        limit: 50,
      },
    });
    return normalizeCampaignCollection(response.data);
  },

  async getAllCampaigns(): Promise<Campaign[]> {
    const statuses: CampaignStatus[] = ['draft', 'pending', 'approved', 'needs_changes', 'rejected', 'paused', 'completed'];
    const responses = await Promise.all(statuses.map((status) =>
      api.get<unknown>('/admin/campaigns', {
        params: { status: status === 'needs_changes' ? 'changes_requested' : status },
      })
    ));
    const byId = new Map<string, Campaign>();
    for (const response of responses) {
      for (const campaign of normalizeCampaignCollection(response.data)) {
        byId.set(campaign.id, campaign);
      }
    }
    return [...byId.values()].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  },

  async getCampaignById(id: string): Promise<Campaign> {
    const response = await api.get<unknown>(`/campaigns/${id}`);
    return normalizeCampaignResponse(response.data);
  },

  async createCampaign(payload: CreateCampaignPayload, _autoApprove = false): Promise<Campaign> {
    if (!payload.imageUrl?.startsWith('data:image/')) {
      throw new Error('Choose a campaign image from your computer before publishing.');
    }
    const response = await api.post<unknown>('/campaigns', {
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
    return normalizeCampaignResponse(response.data);
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
    const response = await api.get<unknown>('/organizations');
    const organizations = findRecords(response.data, ['items', 'organizations']);
    return organizations.map(normalizeOrganization);
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
    const response = await api.get<unknown>('/admin/campaigns');
    return normalizeCampaignCollection(response.data);
  },

  async updateCampaignStatus(id: string, status: CampaignStatus): Promise<Campaign> {
    const response = await api.patch<unknown>(`/admin/campaigns/${id}`, {
      status: status === 'needs_changes' ? 'changes_requested' : status,
    });
    return normalizeCampaignResponse(response.data);
  },
};