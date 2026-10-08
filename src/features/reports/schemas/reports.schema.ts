import { z } from 'zod';

export const reportFilterSchema = z.object({
  sector: z.string().optional(),
  year: z.number().int().optional(),
  status: z.enum(['all', 'pending', 'approved']).default('all'),
});

export type ReportFilterData = z.infer<typeof reportFilterSchema>;
