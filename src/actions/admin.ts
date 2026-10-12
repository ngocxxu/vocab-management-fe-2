'use server';

import type { TAdminUser, TUpdateAdminUserInput } from '@/types/admin';
import { revalidatePath } from 'next/cache';
import { adminUserIdSchema, updateAdminUserSchema } from '@/libs/validations/admin';
import { adminApi } from '@/utils/server-api';
import { requireAdmin } from './auth';
import { toActionError, translateError } from './utils';

const ADMIN_USER_PATHS = ['/admin', '/admin/users'] as const;

function revalidateAdminUsers(): void {
  for (const path of ADMIN_USER_PATHS) {
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
    revalidateAdminUsers();
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
    revalidateAdminUsers();
    return result;
  } catch (error) {
    throw await toActionError(error, 'adminDeleteUser');
  }
}
