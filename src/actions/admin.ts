'use server';

import type { TAdminUser, TAdminUserRole, TCreateAdminPlanInput, TUpdateAdminPlanInput, TUpdateAdminUserInput } from '@/types/admin';
import type { TPlan } from '@/types/plan';
import { revalidatePath } from 'next/cache';
import { adminPlanRoleSchema, adminUserIdSchema, createAdminPlanSchema, updateAdminPlanSchema, updateAdminUserSchema } from '@/libs/validations/admin';
import { adminApi } from '@/utils/server-api';
import { requireAdmin } from './auth';
import { toActionError, translateError } from './utils';

const ADMIN_USER_PATHS = ['/admin', '/admin/users'] as const;
// Plans also show on the landing pricing section and on the profile's plan card.
const ADMIN_PLAN_PATHS = ['/', '/admin', '/admin/plans', '/profile'] as const;

function revalidatePaths(paths: readonly string[]): void {
  for (const path of paths) {
    revalidatePath(path);
  }
}

export async function updateAdminUser(id: string, input: TUpdateAdminUserInput): Promise<TAdminUser> {
  await requireAdmin();
  const parsedId = adminUserIdSchema.safeParse(id);
  const parsedInput = updateAdminUserSchema.safeParse(input);
  if (!parsedId.success || !parsedInput.success) {
    throw new Error(await translateError('adminInvalidInput'));
  }

  try {
    const result = await adminApi.users.update(parsedId.data, parsedInput.data);
    revalidatePaths(ADMIN_USER_PATHS);
    return result;
  } catch (error) {
    throw await toActionError(error, 'adminUpdateUser');
  }
}

export async function deleteAdminUser(id: string): Promise<TAdminUser> {
  await requireAdmin();
  const parsedId = adminUserIdSchema.safeParse(id);
  if (!parsedId.success) {
    throw new Error(await translateError('adminInvalidInput'));
  }

  try {
    const result = await adminApi.users.remove(parsedId.data);
    revalidatePaths(ADMIN_USER_PATHS);
    return result;
  } catch (error) {
    throw await toActionError(error, 'adminDeleteUser');
  }
}

export async function createAdminPlan(input: TCreateAdminPlanInput): Promise<TPlan> {
  await requireAdmin();
  const parsedInput = createAdminPlanSchema.safeParse(input);
  if (!parsedInput.success) {
    throw new Error(await translateError('adminInvalidInput'));
  }

  try {
    const result = await adminApi.plans.create(parsedInput.data);
    revalidatePaths(ADMIN_PLAN_PATHS);
    return result;
  } catch (error) {
    throw await toActionError(error, 'adminSavePlan');
  }
}

export async function updateAdminPlan(role: TAdminUserRole, input: TUpdateAdminPlanInput): Promise<TPlan> {
  await requireAdmin();
  const parsedRole = adminPlanRoleSchema.safeParse(role);
  const parsedInput = updateAdminPlanSchema.safeParse(input);
  if (!parsedRole.success || !parsedInput.success) {
    throw new Error(await translateError('adminInvalidInput'));
  }

  try {
    const result = await adminApi.plans.update(parsedRole.data, parsedInput.data);
    revalidatePaths(ADMIN_PLAN_PATHS);
    return result;
  } catch (error) {
    throw await toActionError(error, 'adminSavePlan');
  }
}
