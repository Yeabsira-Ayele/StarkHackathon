import api from '../../../api/axios';
import { VoxideExtraction } from '../types/voxide.types';

export const voxideApi = {
  async processVoiceInput(
    transcript: string,
    language: 'am' | 'en' | 'om' = 'am'
  ): Promise<VoxideExtraction> {
    const response = await api.post<VoxideExtraction>('/voice/extract', {
      transcript,
      language,
    });
    return response.data;
  },
};
