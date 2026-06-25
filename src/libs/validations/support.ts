import { z } from 'zod';

export const SUPPORT_CATEGORIES = [
  'Bug Report',
  'Feature Request',
  'Account Issue',
  'Other',
] as const;

export type TSupportCategory = (typeof SUPPORT_CATEGORIES)[number];

export const supportSchema = z.object({
  category: z.enum(SUPPORT_CATEGORIES, { error: 'Please select a category' }),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  subject: z.string().min(1, 'Subject is required').max(150, 'Subject must be 150 characters or fewer'),
  message: z.string().min(20, 'Message must be at least 20 characters').max(2000, 'Message must be 2000 characters or fewer'),
});

export type TSupportFormData = z.infer<typeof supportSchema>;
