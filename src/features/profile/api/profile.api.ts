import api from '../../../api/axios';
import { UserProfileData } from '../types/profile.types';
import { ProfileUpdateFormData } from '../schemas/profile.schema';

interface BackendUser {
  _id: string;
  name: string;
  email?: string;
  phone: string;
}

interface BackendProfileResponse {
  data: {
    user: BackendUser;
  };
}

function toProfile(user: BackendUser): UserProfileData {
  return {
    id: user._id,
    name: user.name,
    email: user.email || '',
    phone: user.phone,
    preferredLanguage: 'am',
    totalDonated: 0,
    causesSupportedCount: 0,
    certificatesCount: 0,
    badges: [],
    recentActivities: [],
  };
}

export const profileApi = {
  async getProfile(): Promise<UserProfileData> {
    const response = await api.get<BackendProfileResponse>('/users/me');
    return toProfile(response.data.data.user);
  },

  async updateProfile(data: ProfileUpdateFormData): Promise<UserProfileData> {
    const response = await api.patch<BackendProfileResponse>('/users/me', {
      name: data.name,
      email: data.email,
    });
    return toProfile(response.data.data.user);
  },
};
