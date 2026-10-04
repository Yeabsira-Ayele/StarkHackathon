import { Campaign, CampaignCategory, CampaignStatus, CampaignUpdate, ContributionCertificate, Donation, Organization, PaymentRail } from '../../types/index.ts';
import { INITIAL_CAMPAIGNS } from '../../data/mockCampaigns.ts';
import { INITIAL_ORGANIZATIONS } from '../../data/mockOrganizations.ts';
import { generateCertificateId, toGeezNumber } from '../utils/currencyUtils.ts';

const STORAGE_KEY = 'lewegene_campaigns_v2';
const ORGS_STORAGE_KEY = 'lewegene_orgs_v2';
const CERTS_STORAGE_KEY = 'lewegene_certs_v2';

// Seed initial campaigns into local store if not present
function getStoredCampaigns(): Campaign[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CAMPAIGNS));
      return INITIAL_CAMPAIGNS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CAMPAIGNS;
  }
}

function saveCampaigns(campaigns: Campaign[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
  } catch (err) {
    console.error('Failed to save to local storage', err);
  }
}

function getStoredOrganizations(): Organization[] {
  try {
    const raw = localStorage.getItem(ORGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ORGS_STORAGE_KEY, JSON.stringify(INITIAL_ORGANIZATIONS));
      return INITIAL_ORGANIZATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ORGANIZATIONS;
  }
}

function saveOrganizations(orgs: Organization[]): void {
  try {
    localStorage.setItem(ORGS_STORAGE_KEY, JSON.stringify(orgs));
  } catch (err) {
    console.error('Failed to save organizations', err);
  }
}

function getStoredCertificates(): Record<string, ContributionCertificate> {
  try {
    const raw = localStorage.getItem(CERTS_STORAGE_KEY);
    if (!raw) {
      const initialMap: Record<string, ContributionCertificate> = {};
      // Seed initial certificates for initial donations
      INITIAL_CAMPAIGNS.forEach((c) => {
        (c.donations || []).forEach((d) => {
          if (d.certificateId) {
            initialMap[d.certificateId] = {
              certificateId: d.certificateId,
              donationId: d.id,
              campaignId: c.id,
              campaignTitle: c.title,
              organizationName: c.organizationName || c.creatorName,
              donorName: d.donorName,
              amount: d.amount,
              amountGeEz: `${toGeezNumber(d.amount)} : ብር`,
              currency: 'ETB',
              impactSummary: c.impactMetric || 'Direct community contribution',
              location: c.location || 'Ethiopia',
              issuedAt: d.createdAt,
              transactionRef: d.transactionReference || 'LN-ETB',
              paymentRail: d.paymentRail || 'telebirr',
            };
          }
        });
      });
      localStorage.setItem(CERTS_STORAGE_KEY, JSON.stringify(initialMap));
      return initialMap;
    }
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveCertificate(cert: ContributionCertificate): void {
  try {
    const certs = getStoredCertificates();
    certs[cert.certificateId] = cert;
    localStorage.setItem(CERTS_STORAGE_KEY, JSON.stringify(certs));
  } catch (err) {
    console.error('Failed to save certificate', err);
  }
}

export interface CreateCampaignPayload {
  id?: string;
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
  verifiedOrganization?: boolean;
}

export interface DonatePayload {
  amount: number;
  donorId?: string;
  donorName?: string;
  message?: string;
  paymentRail?: PaymentRail;
  receiptUrl?: string;
  transactionReference?: string;
}

export interface DonateResponse {
  success: boolean;
  donation: Donation;
  campaign: Campaign;
  certificate: ContributionCertificate;
  message: string;
}

export const campaignApi = {
  // GET /api/campaigns
  async getCampaigns(options?: { category?: string; status?: CampaignStatus }): Promise<Campaign[]> {
    await new Promise((resolve) => setTimeout(resolve, 120));
    const all = getStoredCampaigns();

    const statusFilter = options?.status || 'approved';
    let filtered = all.filter((c) => c.status === statusFilter);

    if (options?.category && options.category !== 'all') {
      filtered = filtered.filter((c) => c.category === options.category);
    }

    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  // GET /api/campaigns/all
  async getAllCampaigns(): Promise<Campaign[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return getStoredCampaigns();
  },

  // GET /api/campaigns/:id
  async getCampaignById(id: string): Promise<Campaign> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const all = getStoredCampaigns();
    const found = all.find((c) => c.id === id);
    if (!found) {
      throw new Error(`Campaign with ID ${id} not found`);
    }
    return found;
  },

  // POST /api/campaigns
  async createCampaign(payload: CreateCampaignPayload, autoApprove = false): Promise<Campaign> {
    if (!payload.title || !payload.title.trim()) {
      throw new Error('Campaign title is required');
    }
    if (!payload.story || !payload.story.trim()) {
      throw new Error('Campaign story is required');
    }
    if (!payload.goalAmount || payload.goalAmount <= 0) {
      throw new Error('Goal amount must be greater than 0 ETB');
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
    const all = getStoredCampaigns();

    const serialNum = Math.floor(100 + Math.random() * 900);
    const newCampaign: Campaign = {
      id: payload.id || `camp-${Date.now()}`,
      serialCode: `LW-0${serialNum}`,
      title: payload.title.trim(),
      story: payload.story.trim(),
      goalAmount: Number(payload.goalAmount),
      raisedAmount: 0,
      creatorName: payload.creatorName?.trim() || 'Community Organizer',
      organizationId: payload.organizationId,
      organizationName: payload.organizationName,
      category: payload.category || 'other',
      imageUrl: payload.imageUrl || '/src/assets/images/ethiopia_clean_water_1790266442202.jpg',
      status: autoApprove ? 'approved' : 'pending',
      createdAt: new Date().toISOString(),
      location: payload.location?.trim() || 'Addis Ababa, Ethiopia',
      donationsCount: 0,
      donations: [],
      verifiedOrganization: payload.verifiedOrganization || false,
      impactMetric: payload.impactMetric || `Support ${payload.beneficiariesTarget || 100} individuals in need`,
      beneficiariesTarget: payload.beneficiariesTarget || 100,
      updates: [],
    };

    all.unshift(newCampaign);
    saveCampaigns(all);
    return newCampaign;
  },

  // POST /api/campaigns/:id/donate
  async submitDonation(campaignId: string, payload: DonatePayload): Promise<DonateResponse> {
    if (!payload.amount || payload.amount <= 0) {
      throw new Error('Donation amount must be greater than 0 ETB');
    }

    await new Promise((resolve) => setTimeout(resolve, 350));
    const all = getStoredCampaigns();
    const index = all.findIndex((c) => c.id === campaignId);
    if (index === -1) {
      throw new Error('Target campaign does not exist');
    }

    const campaign = all[index];
    const donationAmount = Number(payload.amount);
    const rail = payload.paymentRail || 'telebirr';
    const txPrefix =
      rail === 'telebirr' ? 'TB-ET' : rail === 'cbe_birr' ? 'CBE' : 'LN-ET';
    const transactionReference = `${txPrefix}-${Math.floor(100000 + Math.random() * 900000)}`;
    const certificateId = generateCertificateId();

    const newDonation: Donation = {
      id: `don-${Date.now()}`,
      campaignId,
      donorId: payload.donorId,
      amount: donationAmount,
      donorName: payload.donorName?.trim() || 'Anonymous Supporter',
      message: payload.message?.trim(),
      paymentStatus: 'completed',
      paymentRail: rail,
      transactionReference,
      createdAt: new Date().toISOString(),
      certificateId,
    };

    // Calculate raisedAmount strictly from completed donations
    const existingDonations = campaign.donations || [];
    const updatedDonations = [newDonation, ...existingDonations];
    const newRaisedAmount = updatedDonations
      .filter((d) => d.paymentStatus === 'completed')
      .reduce((sum, d) => sum + d.amount, 0);

    const updatedCampaign: Campaign = {
      ...campaign,
      raisedAmount: newRaisedAmount,
      donationsCount: updatedDonations.length,
      donations: updatedDonations,
    };

    all[index] = updatedCampaign;
    saveCampaigns(all);

    // Generate Signature Contribution Certificate
    const certificate: ContributionCertificate = {
      certificateId,
      donationId: newDonation.id,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      organizationName: campaign.organizationName || campaign.creatorName,
      donorName: newDonation.donorName,
      amount: donationAmount,
      amountGeEz: `${toGeezNumber(donationAmount)} : ብር`,
      currency: 'ETB',
      impactSummary: campaign.impactMetric || 'Direct community assistance',
      location: campaign.location || 'Ethiopia',
      issuedAt: newDonation.createdAt,
      transactionRef: transactionReference,
      paymentRail: rail,
    };

    saveCertificate(certificate);

    return {
      success: true,
      donation: newDonation,
      campaign: updatedCampaign,
      certificate,
      message: `Successfully contributed ${donationAmount.toLocaleString()} ETB via ${rail.toUpperCase()}.`,
    };
  },

  // GET /api/certificates/:id
  async getCertificate(id: string): Promise<ContributionCertificate | null> {
    const certs = getStoredCertificates();
    return certs[id] || null;
  },

  // GET /api/organizations
  async getOrganizations(): Promise<Organization[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return getStoredOrganizations();
  },

  // GET /api/organizations/:id
  async getOrganizationById(id: string): Promise<Organization | null> {
    const all = getStoredOrganizations();
    return all.find((o) => o.id === id) || null;
  },

  // POST /api/organizations
  async registerOrganization(data: Partial<Organization>): Promise<Organization> {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const all = getStoredOrganizations();
    const newOrg: Organization = {
      id: data.id || `org-${Date.now()}`,
      name: data.name || 'New Organization',
      type: data.type || 'registered_ngo',
      registrationNo:
        data.registrationNo ||
        `ACSO/ET/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
      verified: false,
      verificationStatus: 'pending',
      foundedYear: data.foundedYear || new Date().getFullYear(),
      location: data.location || 'Addis Ababa, Ethiopia',
      description:
        data.description ||
        'Community organization dedicated to transparent philanthropy in Ethiopia.',
      website: data.website || '',
      contactEmail: data.contactEmail || 'contact@org.et',
      contactPhone: data.contactPhone || '+251 11 000 0000',
      activeProjectsCount: 0,
      totalRaised: 0,
      totalSupporters: 0,
      logoUrl: data.logoUrl,
      representative: data.representative,
      bank: data.bank,
      documents: data.documents || [],
      submittedAt: new Date().toISOString(),
      userId: data.userId,
    };

    all.unshift(newOrg);
    saveOrganizations(all);
    return newOrg;
  },

  // PATCH /api/organizations/:id
  async updateOrganization(id: string, patch: Partial<Organization>): Promise<Organization> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const all = getStoredOrganizations();
    const index = all.findIndex((o) => o.id === id);
    if (index === -1) throw new Error(`Organization ${id} not found`);

    const updated: Organization = {
      ...all[index],
      ...patch,
      id,
    };
    all[index] = updated;
    saveOrganizations(all);
    return updated;
  },

  // POST /api/campaigns/:id/updates
  async postCampaignUpdate(campaignId: string, payload: { title: string; content: string; authorName: string }): Promise<CampaignUpdate> {
    await new Promise((resolve) => setTimeout(resolve, 180));
    const all = getStoredCampaigns();
    const index = all.findIndex((c) => c.id === campaignId);
    if (index === -1) throw new Error('Campaign not found');

    const update: CampaignUpdate = {
      id: `upd-${Date.now()}`,
      campaignId,
      title: payload.title.trim(),
      content: payload.content.trim(),
      createdAt: new Date().toISOString(),
      authorName: payload.authorName || 'Campaign Lead',
    };

    const campaign = all[index];
    campaign.updates = [update, ...(campaign.updates || [])];
    all[index] = campaign;
    saveCampaigns(all);
    return update;
  },

  // GET /api/admin/campaigns
  async getAdminCampaigns(): Promise<Campaign[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const all = getStoredCampaigns();
    return all.filter((c) => c.status === 'pending');
  },

  async updateCampaign(id: string, patch: Partial<Campaign>): Promise<Campaign> {
    const all = getStoredCampaigns();
    const index = all.findIndex((campaign) => campaign.id === id);
    if (index < 0) throw new Error(`Campaign ${id} not found`);
    const updated: Campaign = { ...all[index], ...patch, id, createdAt: all[index].createdAt };
    all[index] = updated;
    saveCampaigns(all);
    return updated;
  },

  // PATCH /api/admin/campaigns/:id
  async updateCampaignStatus(id: string, status: CampaignStatus): Promise<Campaign> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const all = getStoredCampaigns();
    const index = all.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error(`Campaign ${id} not found`);
    }

    all[index] = {
      ...all[index],
      status,
    };

    saveCampaigns(all);
    return all[index];
  },

  // Reset demo
  async resetDemoData(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ORGS_STORAGE_KEY);
    localStorage.removeItem(CERTS_STORAGE_KEY);
  },
};
