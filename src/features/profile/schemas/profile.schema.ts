import { z } from 'zod';

export const profileUpdateSchema = z.object({
  name: z.string().min(2, { message: 'ስም ቢያንስ 2 ቁምፊ መሆን አለበት' }),
  email: z.string().email({ message: 'ትክክለኛ ኢሜይል ያስገቡ' }),
  phone: z.string().optional(),
  bio: z.string().max(250, { message: 'የህይወት ታሪክ ከ250 ቁምፊ መብለጥ የለበትም' }).optional(),
  location: z.string().optional(),
  preferredLanguage: z.enum(['am', 'en', 'om']),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
