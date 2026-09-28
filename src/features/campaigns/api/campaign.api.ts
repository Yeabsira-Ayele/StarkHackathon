import { api } from '../../../api/axios';
import { Campaign } from '../types/campaign.types';
import { INITIAL_CAMPAIGNS } from '../data/campaigns.data';
import { CampaignFormData } from '../schemas/campaign.schema';

// Local storage key for persistent mock-data prototyping
const STORAGE_KEY = 'lewegene_campaigns_cache';

const getStoredCampaigns = (): Campaign[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read campaigns from storage', e);
  }
  return INITIAL_CAMPAIGNS;
};

const saveCampaigns = (campaigns: Campaign[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
  } catch (e) {
    console.error('Failed to save campaigns to storage', e);
  }
};

/**
 * Campaign API Service
 * Follows Rule 4, 5, and 6: Uses shared api Axios instance or robust local fallback.
 */
export const campaignApi = {
  /**
   * Fetch all approved public campaigns
   */
  async getCampaigns(): Promise<Campaign[]> {
    try {
      // First attempt standard backend endpoint
      const response = await api.get<Campaign[]>('/campaigns');
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
    } catch {
      // Graceful fallback to static/mock layer per Rule 4
    }
    const all = getStoredCampaigns();
    return all.filter((c) => c.status === 'approved' || c.status === 'completed');
  },

  /**
   * Fetch a single campaign by ID
   */
  async getCampaignById(id: string): Promise<Campaign> {
    try {
      const response = await api.get<Campaign>(`/campaigns/${id}`);
      if (response.data) return response.data;
    } catch {
      // Fallback
    }
    const all = getStoredCampaigns();
    const found = all.find((c) => c.id === id);
    if (!found) throw new Error(`Campaign with id "${id}" not found.`);
    return found;
  },

  /**
   * Create a new social campaign
   */
  async createCampaign(data: CampaignFormData): Promise<Campaign> {
    const newCampaign: Campaign = {
      id: `camp-${Date.now()}`,
      serialCode: `LW-${Math.floor(1000 + Math.random() * 9000)}`,
      title: data.title,
      story: data.story,
      goalAmount: data.goalAmount,
      raisedAmount: 0,
      creatorName: data.creatorName,
      category: data.category,
      imageUrl: data.imageUrl || '/src/assets/images/ethiopia_medical_care_1790266416218.jpg',
      status: 'approved', // Auto-approved for transparent civic testing
      createdAt: new Date().toISOString(),
      location: data.location,
      donationsCount: 0,
      verifiedOrganization: true,
      impactMetric: data.impactMetric || 'Direct verified community outcome for local families.',
      beneficiariesTarget: data.beneficiariesTarget || 100,
    };

    try {
      const response = await api.post<Campaign>('/campaigns', newCampaign);
      if (response.data) return response.data;
    } catch {
      // Save locally
    }

    const all = getStoredCampaigns();
    const updated = [newCampaign, ...all];
    saveCampaigns(updated);
    return newCampaign;
  },

  /**
   * Increment raised amount upon successful pledge
   */
  async recordContribution(campaignId: string, amount: number): Promise<Campaign> {
    const all = getStoredCampaigns();
    const index = all.findIndex((c) => c.id === campaignId);
    if (index === -1) throw new Error('Campaign not found');

    const updatedCampaign = {
      ...all[index],
      raisedAmount: all[index].raisedAmount + amount,
      donationsCount: (all[index].donationsCount || 0) + 1,
      status: (all[index].raisedAmount + amount >= all[index].goalAmount)
        ? ('completed' as const)
        : all[index].status,
    };

    all[index] = updatedCampaign;
    saveCampaigns(all);
    return updatedCampaign;
  },

  /**
   * Fetch all campaigns including pending for moderation
   */
  async getAdminCampaigns(): Promise<Campaign[]> {
    return getStoredCampaigns();
  },

  /**
   * Update campaign status
   */
  async updateCampaignStatus(campaignId: string, status: 'approved' | 'rejected' | 'pending' | 'completed'): Promise<Campaign> {
    const all = getStoredCampaigns();
    const index = all.findIndex((c) => c.id === campaignId);
    if (index === -1) throw new Error('Campaign not found');

    all[index] = {
      ...all[index],
      status,
    };
    saveCampaigns(all);
    return all[index];
  },
};
