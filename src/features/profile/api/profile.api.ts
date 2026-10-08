import api from '../../../api/axios';
import { PatronActivity, UserProfileData } from '../types/profile.types';
import { ProfileUpdateFormData } from '../schemas/profile.schema';

interface BackendUser {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  preferredLanguage?: 'am' | 'en' | 'om';
}

interface BackendProfileResponse {
  data: {
    user: BackendUser;
  };
}

interface BackendDonationsResponse {
  donations: Array<{
    _id: string;
    amount: number;
    paymentStatus: string;
    certificateId?: string;
    createdAt: string;
    campaignId?: string | { _id: string; title?: string };
  }>;
  stats: {
    totalAmount: number;
    totalDonationsCount: number;
    causesSupportedCount: number;
    successfulCount: number;
  };
}

function toProfile(user: BackendUser): UserProfileData {
  return {
    id: user._id,
    name: user.name,
    email: user.email || '',
    phone: user.phone,
    preferredLanguage: user.preferredLanguage === 'en' ? 'en' : 'am',
  };
}

export const profileApi = {
  async getProfile(): Promise<UserProfileData> {
    const [profileResponse, donationsResponse] = await Promise.all([
      api.get<BackendProfileResponse>('/users/me'),
      api.get<BackendDonationsResponse>('/users/me/donations'),
    ]);
    const profile = toProfile(profileResponse.data.data.user);
    const donationData = donationsResponse.data;
    const successfulDonations = donationData.donations.filter((donation) => donation.paymentStatus === 'completed');
    const recentActivities: PatronActivity[] = successfulDonations.map((donation) => {
      const campaign = typeof donation.campaignId === 'object' ? donation.campaignId : undefined;
      return {
        id: donation._id,
        type: donation.certificateId ? 'certificate_minted' : 'donation',
        title: donation.certificateId ? 'Verified contribution' : 'Donation completed',
        amount: donation.amount,
        timestamp: donation.createdAt,
        certificateId: donation.certificateId,
        campaignTitle: campaign?.title,
      };
    });
    return {
      ...profile,
      totalDonated: donationData.stats.totalAmount,
      causesSupportedCount: donationData.stats.causesSupportedCount,
      certificatesCount: successfulDonations.filter((donation) => donation.certificateId).length,
      recentActivities,
    };
  },

  async updateProfile(data: ProfileUpdateFormData): Promise<UserProfileData> {
    const response = await api.patch<BackendProfileResponse>('/users/me', {
      name: data.name,
      email: data.email,
      preferredLanguage: data.preferredLanguage,
    });
    return toProfile(response.data.data.user);
  },
};
