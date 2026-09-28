import { z } from 'zod';

export const voiceTranscriptSchema = z.object({
  audioPrompt: z.string().min(1, { message: 'የድምፅ ጽሑፍ ባዶ መሆን የለበትም' }),
  language: z.enum(['am', 'en', 'om']).default('am'),
});

export type VoiceTranscriptData = z.infer<typeof voiceTranscriptSchema>;
