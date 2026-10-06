import { z } from 'zod';

export const moderationDecisionSchema = z.object({
  campaignId: z.string().min(1),
  action: z.enum(['approve', 'reject', 'request_changes']),
  notes: z.string().max(500).optional(),
});

export type ModerationDecisionData = z.infer<typeof moderationDecisionSchema>;
