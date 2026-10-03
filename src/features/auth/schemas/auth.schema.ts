import { z } from 'zod';

export const loginSchema = z.object({
  emailOrPhone: z
    .string()
    .trim()
    .refine(isEmailOrPhone, { message: 'Enter a valid email address or phone number' }),
  passcode: z
    .string()
    .min(8, { message: 'Passcode must be at least 8 characters' })
    .max(72, { message: 'Passcode must be 72 characters or fewer' }),
});

export const registerSchema = z.object({
  name: z.string().min(2, { message: 'እባክዎ ሙሉ ስምዎን ያስገቡ' }),
  emailOrPhone: z.string().trim().refine(isEmailOrPhone, { message: 'Enter a valid email address or phone number' }),
  passcode: z
    .string()
    .min(8, { message: 'Passcode must be at least 8 characters' })
    .max(72, { message: 'Passcode must be 72 characters or fewer' }),
  role: z.enum(['donor', 'foundation']),
  organizationName: z.string().optional(),
}).refine(
  (data) => data.role !== 'foundation' || !!data.organizationName?.trim(),
  { path: ['organizationName'], message: 'Enter your organization name' },
);

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

function isEmailOrPhone(value: string): boolean {
  const normalized = value.trim();
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
  const phoneValid = /^\+?[\d\s()-]{7,20}$/.test(normalized) && normalized.replace(/\D/g, '').length >= 7;
  return emailValid || phoneValid;
}
