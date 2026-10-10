import { z } from 'zod';

export const SUPPORT_CATEGORIES = [
  'Bug Report',
  'Feature Request',
  'Account Issue',
  'Other',
] as const;

export type TSupportCategory = (typeof SUPPORT_CATEGORIES)[number];

export const supportSchema = z.object({
  category: z.enum(SUPPORT_CATEGORIES, { error: 'validation.categoryRequired' }),
  email: z.string().min(1, 'validation.emailRequired').email('validation.invalidEmail'),
  subject: z.string().min(1, 'validation.subjectRequired').max(150, 'validation.subjectTooLong'),
  message: z.string().min(20, 'validation.messageTooShort').max(2000, 'validation.messageTooLong'),
});

export type TSupportFormData = z.infer<typeof supportSchema>;
