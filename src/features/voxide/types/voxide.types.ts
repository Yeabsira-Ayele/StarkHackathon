import { CampaignCategory } from '../../campaigns/types/campaign.types';
import { PaymentRail } from '../../donations/types/donation.types';

export type VoiceIntent =
  | 'create_campaign'
  | 'donate'
  | 'search_campaigns'
  | 'ask_help'
  | 'unknown';

export interface VoxideExtraction {
  intent: VoiceIntent;
  transcription: string;
  detectedLanguage: 'am' | 'en' | 'om';
  confidence: number;
  campaignData?: {
    title: string;
    story: string;
    goalAmount: number;
    category: CampaignCategory;
    creatorName: string;
  };
  donationData?: {
    campaignId: string;
    amount: number;
    donorName: string;
    paymentRail: PaymentRail;
    message: string;
  };
}

export interface VoicePromptPreset {
  id: string;
  text: {
    am: string;
    en: string;
    om: string;
  };
  intent: VoiceIntent;
}
