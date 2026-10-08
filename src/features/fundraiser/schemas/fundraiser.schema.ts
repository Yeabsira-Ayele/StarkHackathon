import { z } from 'zod';

export const fundraiserSchema = z.object({
  title: z
    .string()
    .min(5, { message: 'Project title must be at least 5 characters' })
    .max(120, { message: 'Title cannot exceed 120 characters' }),
  story: z
    .string()
    .min(30, { message: 'Please describe the project directive in at least 30 characters' }),
  goalAmount: z
    .number()
    .positive({ message: 'Goal must be greater than 0' }),
  category: z.enum([
    'medical',
    'education',
    'emergency',
    'water',
    'environment',
    'community',
    'other',
  ]),
  creatorName: z.string().min(2, { message: 'Contact officer name is required' }),
  location: z.string().min(3, { message: 'Project implementation location is required' }),
  beneficiariesTarget: z.number().int().positive().optional(),
  impactMetric: z.string().optional(),
  imageUrl: z.string().min(1, { message: 'Choose a campaign image from your computer' }),
});

export type FundraiserSchemaData = z.infer<typeof fundraiserSchema>;
