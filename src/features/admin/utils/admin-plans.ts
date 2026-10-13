import type { TAdminPlan, TAdminPlanFormValues, TAdminPlanPayload, TAdminUserRole } from '@/types/admin';
import { ADMIN_USER_ROLES } from '@/constants/admin';

/**
 * Marks an empty limit input. NaN, not 0: zod rejects it, so a blank field can never save as a real limit.
 */
export const BLANK_LIMIT = Number.NaN;

export function isBlankLimit(value: number): boolean {
  return Number.isNaN(value);
}

/**
 * Roles that can get a plan row. ADMIN is left out: the BE skips quotas for admins and never reads their plan,
 * so a plan for ADMIN would be shown but never enforced.
 */
export function getCreatableRoles(plans: readonly Pick<TAdminPlan, 'role'>[]): TAdminUserRole[] {
  const takenRoles = new Set(plans.map(plan => plan.role));

  return ADMIN_USER_ROLES.filter(role => role !== 'ADMIN' && !takenRoles.has(role));
}

/** One feature per line. Blank lines are dropped, so an extra Enter adds no empty feature. */
export function splitFeatureLines(text: string): string[] {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

export function joinFeatureLines(features: readonly string[]): string {
  return features.join('\n');
}

/** A new plan starts active with no price, and every limit at 0 so the admin sets each one. */
export function toPlanFormValues(plan?: TAdminPlan): TAdminPlanFormValues {
  if (!plan) {
    return {
      name: '',
      priceLabel: '',
      price: null,
      limits: { vocabPerDay: 0, languageFolders: 0, subjects: 0 },
      featuresText: '',
      stripePriceId: '',
      sortOrder: 0,
      isActive: true,
    };
  }

  return {
    name: plan.name,
    priceLabel: plan.priceLabel,
    price: plan.price,
    limits: {
      vocabPerDay: plan.limits.vocabPerDay,
      languageFolders: plan.limits.languageFolders,
      subjects: plan.limits.subjects,
    },
    featuresText: joinFeatureLines(plan.features),
    stripePriceId: plan.stripePriceId ?? '',
    sortOrder: plan.sortOrder,
    isActive: plan.isActive,
  };
}

/**
 * Builds the write payload from the form. requestsPerMinute is not in the form, but the BE replaces the
 * whole limits object, so the stored plan's value is carried over or the write would drop it.
 */
export function toAdminPlanPayload(values: TAdminPlanFormValues, storedPlan?: Pick<TAdminPlan, 'limits'>): TAdminPlanPayload {
  const requestsPerMinute = storedPlan?.limits.requestsPerMinute;

  return {
    name: values.name.trim(),
    priceLabel: values.priceLabel.trim(),
    price: values.price,
    limits: {
      ...values.limits,
      ...(requestsPerMinute !== undefined && { requestsPerMinute }),
    },
    features: splitFeatureLines(values.featuresText),
    stripePriceId: values.stripePriceId.trim() || null,
    sortOrder: values.sortOrder,
    isActive: values.isActive,
  };
}
