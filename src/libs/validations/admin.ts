import { ADMIN_USER_ROLES } from '@/constants/admin';
import { z } from 'zod';

// Checked in the server actions before the BE is called, so bad input never leaves the app.
export const adminUserIdSchema = z.string().trim().min(1);

export const updateAdminUserSchema = z
  .object({
    role: z.enum(ADMIN_USER_ROLES).optional(),
    isActive: z.boolean().optional(),
  })
  .refine(input => input.role !== undefined || input.isActive !== undefined, {
    message: 'Provide role or isActive',
  });
