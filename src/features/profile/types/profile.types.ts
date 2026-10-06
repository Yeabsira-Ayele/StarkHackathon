export interface PatronBadge {
  id: string;
  title: {
    am: string;
    en: string;
    om: string;
  };
  description: {
    am: string;
    en: string;
    om: string;
  };
  iconName: string;
  unlockedAt?: string;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
}

export interface PatronActivity {
  id: string;
  type: 'donation' | 'verification' | 'cause_supported' | 'certificate_minted';
  title: string;
  amount?: number;
  timestamp: string;
  certificateId?: string;
  campaignTitle?: string;
}

export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  location?: string;
  preferredLanguage: 'am' | 'en';
  totalDonated?: number;
  causesSupportedCount?: number;
  certificatesCount?: number;
  badges?: PatronBadge[];
  recentActivities?: PatronActivity[];
}
