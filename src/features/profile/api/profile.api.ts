import api from '../../../api/axios';
import { UserProfileData } from '../types/profile.types';
import { ProfileUpdateFormData } from '../schemas/profile.schema';
import { MOCK_USER_PROFILE } from '../data/profile.data';

export const profileApi = {
  async getProfile(): Promise<UserProfileData> {
    try {
      const response = await api.get<UserProfileData>('/profile/me');
      return response.data;
    } catch {
      return MOCK_USER_PROFILE;
    }
  },

  async updateProfile(data: ProfileUpdateFormData): Promise<UserProfileData> {
    try {
      const response = await api.put<UserProfileData>('/profile/me', data);
      return response.data;
    } catch {
      return {
        ...MOCK_USER_PROFILE,
        ...data,
      };
    }
  },
};
