import { z } from 'zod';

export const amountSchema = z.object({
  amount: z
    .number()
    .positive({ message: 'Amount must be greater than 0 ETB' })
    .min(50, { message: 'Minimum contribution amount is 50 ETB' })
    .max(1000000, { message: 'Maximum single contribution is 1,000,000 ETB' }),
});

export const donorInfoSchema = z.object({
  donorName: z.string().optional(),
  donorEmail: z
    .string()
    .email({ message: 'Please enter a valid email address' })
    .optional()
    .or(z.literal('')),
  donorPhone: z.string().optional(),
  isAnonymous: z.boolean().default(false),
  message: z.string().max(500, { message: 'Message cannot exceed 500 characters' }).optional(),
});

export const bankSelectSchema = z.object({
  bankId: z.string().min(1, { message: 'Please select a receiving bank' }),
});

export const paymentReferenceSchema = z.object({
  reference: z
    .string()
    .min(3, { message: 'Payment reference must be at least 3 characters' })
    .max(100, { message: 'Reference is too long' }),
  proofUrl: z.string().optional(),
});

export const donationSchema = z.object({
  campaignId: z.string().min(1, { message: 'Campaign is required' }),
  amount: z
    .number()
    .positive({ message: 'Amount must be greater than 0 ETB' })
    .min(50, { message: 'Minimum contribution amount is 50 ETB' })
    .max(1000000, { message: 'Maximum single contribution is 1,000,000 ETB' }),
  donorName: z.string().default('Anonymous Patron'),
  donorEmail: z.string().email().optional().or(z.literal('')),
  isAnonymous: z.boolean().default(false),
  bankId: z.string().min(1, { message: 'Bank is required' }),
  message: z.string().max(500, { message: 'Message is too long' }).optional(),
  paymentRail: z.string().optional(),
});

export type DonationFormData = z.infer<typeof donationSchema>;
