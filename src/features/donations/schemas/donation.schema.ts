import { z } from 'zod';

export const donationSchema = z.object({
  campaignId: z.string().min(1, { message: 'Campaign is required' }),
  amount: z
    .number()
    .positive({ message: 'Amount must be greater than 0 ETB' })
    .min(50, { message: 'Minimum pledge amount is 50 ETB' })
    .max(1000000, { message: 'Maximum single pledge is 1,000,000 ETB' }),
  donorName: z.string().default('Anonymous Patron'),
  isAnonymous: z.boolean().default(false),
  message: z.string().max(500, { message: 'Message is too long' }).optional(),
  paymentRail: z.enum(['telebirr', 'cbe_birr', 'bank_card', 'chapa']),
});

export type DonationFormData = z.infer<typeof donationSchema>;
