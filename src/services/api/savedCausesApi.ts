import { api } from '../../api/axios.ts';

export interface SavedCause {
  id: string;
  title: string;
  location: string;
  raisedAmount: number;
  goalAmount: number;
}

interface SavedCausesResponse {
  campaignIds: string[];
  campaigns: SavedCause[];
}

export const savedCausesApi = {
  async getSavedCauses(): Promise<SavedCausesResponse> {
    const response = await api.get<{ data: SavedCausesResponse }>('/users/me/saved-causes');
    return response.data.data;
  },

  async replaceSavedCauses(campaignIds: string[]): Promise<string[]> {
    const response = await api.put<{ data: { campaignIds: string[] } }>('/users/me/saved-causes', {
      campaignIds,
    });
    return response.data.data.campaignIds;
  },
};
