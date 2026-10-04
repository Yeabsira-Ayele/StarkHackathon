import { z } from 'zod';
import i18n from '../../../i18n/config.ts';

/** Reads the current-language message at validation time. */
function msg(key: string, fallback: string): string {
  return i18n.t(key, fallback);
}

export function isValidPhone(value: string): boolean {
  const norm = value.trim().replace(/[\s()-]/g, '');
  return /^(\+251|0)[79]\d{8}$/.test(norm) || /^251[79]\d{8}$/.test(norm);
}

export const createPhoneSchema = () =>
  z.object({
    phone: z
      .string()
      .trim()
      .min(1, { message: msg('auth.validation.phoneRequired', 'Enter your phone number') })
      .refine(isValidPhone, {
        message: msg('auth.validation.invalidPhone', 'Enter a valid Ethiopian phone number (e.g. 0911223344 or +251911223344)'),
      }),
  });

export const createOtpSchema = () =>
  z.object({
    otp: z
      .string()
      .trim()
      .min(1, { message: msg('auth.validation.otpRequired', 'Enter the 6-digit verification code') })
      .regex(/^\d{6}$/, {
        message: msg('auth.validation.otpInvalid', 'Verification code must be exactly 6 digits'),
      }),
  });

export const createRegisterDetailsSchema = () =>
  z
    .object({
      name: z.string().min(2, { message: msg('auth.validation.nameMin', 'Please enter your full name') }),
      email: z
        .string()
        .trim()
        .min(1, { message: msg('auth.validation.emailRequired', 'Enter your email address') })
        .email({ message: msg('auth.validation.invalidEmail', 'Enter a valid email address') }),
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

export type PhoneFormData = z.infer<ReturnType<typeof createPhoneSchema>>;
export type OtpFormData = z.infer<ReturnType<typeof createOtpSchema>>;
export type RegisterDetailsFormData = z.infer<ReturnType<typeof createRegisterDetailsSchema>>;
export type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;
export type RegisterFormData = z.infer<ReturnType<typeof createRegisterSchema>>;

function isEmailOrPhone(value: string): boolean {
  const normalized = value.trim();
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
  const phoneValid = isValidPhone(normalized);
  return emailValid || phoneValid;
}
