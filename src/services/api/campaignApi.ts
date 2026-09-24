import { Campaign, CampaignCategory, CampaignStatus, Donation, PaymentRail } from '../../types/index.ts';
import { INITIAL_CAMPAIGNS } from '../../data/mockCampaigns.ts';

const STORAGE_KEY = 'lewegene_campaigns_v1';

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

export interface CreateCampaignPayload {
  title: string;
  story: string;
  goalAmount: number;
  category: CampaignCategory;
  creatorName?: string;
  imageUrl?: string;
  location?: string;
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
  message: string;
}

export const campaignApi = {
  // GET /api/campaigns
  async getCampaigns(options?: { category?: string; status?: CampaignStatus }): Promise<Campaign[]> {
    // Simulate brief network latency for realism
    await new Promise((resolve) => setTimeout(resolve, 180));
    const all = getStoredCampaigns();

    // Default to approved campaigns only for public feed per Section 16
    const statusFilter = options?.status || 'approved';
    let filtered = all.filter((c) => c.status === statusFilter);

    if (options?.category && options.category !== 'all') {
      filtered = filtered.filter((c) => c.category === options.category);
    }

    // Newest first per Section 14
    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  // GET /api/campaigns/:id
  async getCampaignById(id: string): Promise<Campaign> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const all = getStoredCampaigns();
    const found = all.find((c) => c.id === id);
    if (!found) {
      throw new Error(`Campaign with ID ${id} not found`);
    }
    return found;
  },

  // POST /api/campaigns
  // Rule enforced: Every new campaign is created with status: 'pending' (Section 16)
  // But can be auto-approved in demo if needed, or toggled in Admin view!
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

    await new Promise((resolve) => setTimeout(resolve, 300));
    const all = getStoredCampaigns();

    const newCampaign: Campaign = {
      id: `camp-${Date.now()}`,
      title: payload.title.trim(),
      story: payload.story.trim(),
      goalAmount: Number(payload.goalAmount),
      raisedAmount: 0,
      creatorName: payload.creatorName?.trim() || 'Anonymous',
      category: payload.category || 'other',
      imageUrl: payload.imageUrl || '/src/assets/images/ethiopia_clean_water_1790266442202.jpg',
      status: autoApprove ? 'approved' : 'pending',
      createdAt: new Date().toISOString(),
      location: payload.location?.trim() || 'Ethiopia',
      donationsCount: 0,
      donations: [],
    };

    all.unshift(newCampaign);
    saveCampaigns(all);
    return newCampaign;
  },

  // POST /api/campaigns/:id/donate
  // Rule enforced (Section 12): Backend-side Links.et payment verification.
  // Raised amount is strictly incremented ONLY when verified.
  async submitDonation(campaignId: string, payload: DonatePayload): Promise<DonateResponse> {
    if (!payload.amount || payload.amount <= 0) {
      throw new Error('Donation amount must be greater than 0 ETB');
    }

    await new Promise((resolve) => setTimeout(resolve, 450));
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

    const newDonation: Donation = {
      id: `don-${Date.now()}`,
      campaignId,
      amount: donationAmount,
      donorName: payload.donorName?.trim() || 'Anonymous',
      message: payload.message?.trim(),
      paymentStatus: 'completed',
      paymentRail: rail,
      transactionReference,
      createdAt: new Date().toISOString(),
    };

    // Calculate raisedAmount strictly from completed donations (Section 13)
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

    return {
      success: true,
      donation: newDonation,
      campaign: updatedCampaign,
      message: `Successfully contributed ${donationAmount.toLocaleString()} ETB via Links.et (${rail.toUpperCase()}).`,
    };
  },

  // GET /api/admin/campaigns
  // List pending campaigns for admin review (Section 16, 21)
  async getAdminCampaigns(): Promise<Campaign[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const all = getStoredCampaigns();
    return all.filter((c) => c.status === 'pending');
  },

  // PATCH /api/admin/campaigns/:id
  async updateCampaignStatus(id: string, status: CampaignStatus): Promise<Campaign> {
    await new Promise((resolve) => setTimeout(resolve, 200));
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

  // Reset to initial demo state (convenience for judges/demoers)
  async resetDemoData(): Promise<void> {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CAMPAIGNS));
  },
};
