import { ADMIN_PLAN_MAX_LIMIT, ADMIN_PLAN_UNLIMITED, ADMIN_USER_ROLES } from '@/constants/admin';
import { z } from 'zod';

// Checked in the server actions before the BE is called, so bad input never leaves the app.
export const adminUserIdSchema = z.string().trim().min(1);

// Same bounds as the BE plan limits: an integer from -1 (unlimited) up to an int32.
const adminPlanLimitSchema = z.number().int().min(ADMIN_PLAN_UNLIMITED).max(ADMIN_PLAN_MAX_LIMIT);

export const adminPlanRoleSchema = z.enum(ADMIN_USER_ROLES);

const adminPlanLimitsSchema = z.object({
  vocabPerDay: adminPlanLimitSchema,
  languageFolders: adminPlanLimitSchema,
  subjects: adminPlanLimitSchema,
});

const adminPlanDetailsSchema = z.object({
  name: z.string().trim().min(1),
  priceLabel: z.string().trim().min(1),
  price: z.number().min(0).nullable(),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
});

// The edit form validates the text it holds; features are split into a list only when the payload is built.
export const adminPlanFormSchema = adminPlanDetailsSchema.extend({
  limits: adminPlanLimitsSchema,
  featuresText: z.string(),
  stripePriceId: z.string(),
});

const adminPlanFieldsSchema = adminPlanDetailsSchema.extend({
  limits: adminPlanLimitsSchema.extend({ requestsPerMinute: adminPlanLimitSchema.optional() }),
  features: z.array(z.string().trim().min(1)),
  stripePriceId: z.string().trim().min(1).nullable(),
});

export const createAdminPlanSchema = adminPlanFieldsSchema.extend({ role: adminPlanRoleSchema });

export const updateAdminPlanSchema = adminPlanFieldsSchema
  .partial()
  .refine(input => Object.values(input).some(value => value !== undefined), {
    message: 'Provide at least one plan field',
  });

export const updateAdminUserSchema = z
  .object({
    role: z.enum(ADMIN_USER_ROLES).optional(),
    isActive: z.boolean().optional(),
    mcpAccess: z.boolean().optional(),
  })
  .refine(input => input.role !== undefined || input.isActive !== undefined || input.mcpAccess !== undefined, {
    message: 'Provide role, isActive or mcpAccess',
  });
