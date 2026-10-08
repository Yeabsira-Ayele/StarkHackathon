import { create } from 'zustand';
import { CampaignCategory, CampaignFilterStatus } from '../types/campaign.types';

interface CampaignState {
  searchQuery: string;
  selectedCategory: CampaignCategory | 'all';
  filterStatus: CampaignFilterStatus;
  selectedLocation: string;
  selectedCampaignId: string | null;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: CampaignCategory | 'all') => void;
  setFilterStatus: (status: CampaignFilterStatus) => void;
  setSelectedLocation: (location: string) => void;
  setSelectedCampaignId: (id: string | null) => void;
  resetFilters: () => void;
}

export const useCampaignStore = create<CampaignState>((set) => ({
  searchQuery: '',
  selectedCategory: 'all',
  filterStatus: 'all',
  selectedLocation: 'all',
  selectedCampaignId: null,
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setSelectedLocation: (location) => set({ selectedLocation: location }),
  setSelectedCampaignId: (id) => set({ selectedCampaignId: id }),
  resetFilters: () =>
    set({
      searchQuery: '',
      selectedCategory: 'all',
      filterStatus: 'all',
      selectedLocation: 'all',
    }),
}));
