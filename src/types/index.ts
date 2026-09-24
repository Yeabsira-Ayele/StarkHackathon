export type CampaignCategory = 'medical' | 'education' | 'emergency' | 'business' | 'other';

export type CampaignStatus = 'pending' | 'approved' | 'rejected';

export type PaymentStatus = 'pending' | 'completed' | 'failed';

export type PaymentRail = 'telebirr' | 'cbe_birr' | 'bank_card' | 'chapa';

export interface Donation {
  id: string;
  campaignId: string;
  amount: number; // In ETB (Ethiopian Birr)
  donorName: string; // Defaults to "Anonymous"
  message?: string;
  paymentStatus: PaymentStatus;
  paymentRail?: PaymentRail;
  transactionReference?: string;
  createdAt: string; // ISO date string or formatted
}

export interface Campaign {
  id: string;
  title: string;
  story: string;
  goalAmount: number; // In ETB
  raisedAmount: number; // In ETB, calculated strictly from completed donations
  creatorName: string;
  category: CampaignCategory;
  imageUrl?: string;
  status: CampaignStatus;
  createdAt: string;
  location?: string;
  donationsCount?: number;
  donations?: Donation[];
  verifiedOrganization?: boolean;
}

export interface VoiceExtractionResult {
  title?: string;
  story?: string;
  goalAmount?: number;
  category?: CampaignCategory;
  creatorName?: string;
  campaignId?: string;
  donationAmount?: number;
  donorName?: string;
  donorMessage?: string;
  rawTranscript: string;
  confidence: number;
}
