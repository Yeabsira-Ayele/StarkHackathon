import api from '../../../api/axios';
import { VoxideExtraction } from '../types/voxide.types';
import { voxideService } from '../../../services/voice/voxideService';

export const voxideApi = {
  async processVoiceInput(
    transcript: string,
    language: 'am' | 'en' | 'om' = 'am'
  ): Promise<VoxideExtraction> {
    try {
      const response = await api.post<VoxideExtraction>('/voice/extract', {
        transcript,
        language,
      });
      return response.data;
    } catch {
      // Seamless client-side intelligent fallback
      const parsed = voxideService.parseSpokenIntent(transcript);
      return {
        intent: parsed.intent === 'search' ? 'search_campaigns' : parsed.intent,
        transcription: transcript,
        detectedLanguage: language,
        confidence: parsed.confidence,
        campaignData: parsed.campaignData
          ? {
              ...parsed.campaignData,
              category: (parsed.campaignData.category === 'business' ? 'community' : parsed.campaignData.category) as any,
              creatorName: parsed.campaignData.creatorName || 'Community Organizer',
            }
          : undefined,
        donationData: parsed.donationData
          ? {
              campaignId: parsed.donationData.matchedCampaignId || 'camp-bethlehem-cardiac',
              amount: parsed.donationData.amount,
              donorName: parsed.donationData.donorName || 'Anonymous Patron',
              paymentRail: 'telebirr',
              message: parsed.donationData.message || 'Civic Solidarity Pledge',
            }
          : undefined,
      };
    }
  },
};
