import { z } from 'zod';

export const campaignSchema = z.object({
  title: z
    .string()
    .min(5, { message: 'Title must be at least 5 characters long' })
    .max(120, { message: 'Title must be under 120 characters' }),
  story: z
    .string()
    .min(30, { message: 'Story must be at least 30 characters to explain the need' })
    .max(5000, { message: 'Story is too long' }),
  goalAmount: z
    .number()
    .positive({ message: 'Target goal must be greater than 0 ETB' })
    .max(50000000, { message: 'Goal cannot exceed 50,000,000 ETB' }),
  category: z.enum([
    'medical',
    'education',
    'emergency',
    'water',
    'environment',
    'community',
    'other',
  ]),
  creatorName: z
    .string()
    .min(2, { message: 'Creator / Contact name is required' }),
  location: z
    .string()
    .min(3, { message: 'Location is required (e.g. Addis Ababa, Gondar)' }),
  beneficiariesTarget: z
    .number()
    .int()
    .positive({ message: 'Beneficiary count must be at least 1' })
    .optional(),
  impactMetric: z
    .string()
    .max(200, { message: 'Impact summary must be brief' })
    .optional(),
  imageUrl: z.string().optional(),
});

export type CampaignFormData = z.infer<typeof campaignSchema>;
