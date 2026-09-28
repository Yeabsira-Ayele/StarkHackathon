import { z } from 'zod';

export const loginSchema = z.object({
  emailOrPhone: z
    .string()
    .min(3, { message: 'ስልክ ቁጥር ወይም ኢሜይል ያስገቡ' }),
  passcode: z
    .string()
    .min(4, { message: 'የይለፍ ቃል ቢያንስ 4 ቁምፊ መሆን አለበት' }),
});

export const registerSchema = z.object({
  name: z.string().min(2, { message: 'እባክዎ ሙሉ ስምዎን ያስገቡ' }),
  emailOrPhone: z.string().min(3, { message: 'ትክክለኛ ስልክ ቁጥር ወይም ኢሜይል ያስገቡ' }),
  passcode: z.string().min(4, { message: 'የይለፍ ቃል ቢያንስ 4 ቁምፊ መሆን አለበት' }),
  role: z.enum(['donor', 'foundation', 'admin']),
  organizationName: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
