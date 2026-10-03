import { z } from 'zod';
import i18n from '../../../i18n/config.ts';

/** Reads the current-language message at validation time. */
function msg(key: string, fallback: string): string {
  return i18n.t(key, fallback);
}

export const createLoginSchema = () =>
  z.object({
    emailOrPhone: z
      .string()
      .trim()
      .refine(isEmailOrPhone, {
        message: msg('auth.validation.emailOrPhone', 'Enter a valid email address or phone number'),
      }),
    passcode: z
      .string()
      .min(8, { message: msg('auth.validation.passcodeMin', 'Passcode must be at least 8 characters') })
      .max(72, { message: msg('auth.validation.passcodeMax', 'Passcode must be 72 characters or fewer') }),
  });

export const createRegisterSchema = () =>
  z
    .object({
      name: z.string().min(2, { message: msg('auth.validation.nameMin', 'Please enter your full name') }),
      emailOrPhone: z.string().trim().refine(isEmailOrPhone, {
        message: msg('auth.validation.emailOrPhone', 'Enter a valid email address or phone number'),
      }),
      passcode: z
        .string()
        .min(8, { message: msg('auth.validation.passcodeMin', 'Passcode must be at least 8 characters') })
        .max(72, { message: msg('auth.validation.passcodeMax', 'Passcode must be 72 characters or fewer') }),
      role: z.enum(['donor', 'foundation']),
      organizationName: z.string().optional(),
    })
    .refine(
      (data) => data.role !== 'foundation' || !!data.organizationName?.trim(),
      { path: ['organizationName'], message: msg('auth.validation.orgRequired', 'Enter your organization name') },
    );

export type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;
export type RegisterFormData = z.infer<ReturnType<typeof createRegisterSchema>>;

function isEmailOrPhone(value: string): boolean {
  const normalized = value.trim();
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
  const phoneValid = /^\+?[\d\s()-]{7,20}$/.test(normalized) && normalized.replace(/\D/g, '').length >= 7;
  return emailValid || phoneValid;
}
