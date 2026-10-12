'use server';

import type { TBroadcastFormValues } from '@/libs/validations/broadcast';
import type { TAdminUser, TBroadcastResult } from '@/types/admin';
import { revalidatePath } from 'next/cache';
import { broadcastFormSchema } from '@/libs/validations/broadcast';
import { toBroadcastPayload } from '@/utils/broadcast-payload';
import { adminApi, notificationsApi } from '@/utils/server-api';
import { requireAdmin } from './auth';
import { toActionError, translateError } from './utils';

// Bells read notifications on each request, so revalidating these pages is enough. No tagged cache sits in front of them.
const BROADCAST_PATHS = ['/admin/broadcasts', '/notifications'] as const;
const SEARCH_PAGE_SIZE = 20;

function refreshBroadcasts(): void {
  for (const path of BROADCAST_PATHS) {
    revalidatePath(path);
  }
}

export async function createAdminBroadcast(input: TBroadcastFormValues): Promise<TBroadcastResult> {
  await requireAdmin();
  const parsedInput = broadcastFormSchema.safeParse(input);
  if (!parsedInput.success) {
    throw new Error(await translateError('adminInvalidInput'));
  }

  try {
    const result = await notificationsApi.broadcast(toBroadcastPayload(parsedInput.data));
    refreshBroadcasts();
    return result;
  } catch (error) {
    throw await toActionError(error, 'adminSendBroadcast');
  }
}

export async function setAdminBroadcastActive(id: string, isActive: boolean): Promise<void> {
  await requireAdmin();

  try {
    await notificationsApi.setActive(id, isActive);
    refreshBroadcasts();
  } catch (error) {
    throw await toActionError(error, 'adminUpdateBroadcast');
  }
}

export async function deleteAdminBroadcast(id: string): Promise<void> {
  await requireAdmin();

  try {
    await notificationsApi.remove(id);
    refreshBroadcasts();
  } catch (error) {
    throw await toActionError(error, 'adminDeleteBroadcast');
  }
}

export async function cleanupAdminBroadcasts(): Promise<void> {
  await requireAdmin();

  try {
    await notificationsApi.cleanupExpired();
    refreshBroadcasts();
  } catch (error) {
    throw await toActionError(error, 'adminCleanupBroadcasts');
  }
}

/** Active users whose name or email matches. An empty search returns nobody, so the picker never lists every user. */
export async function searchAdminUsers(query: string): Promise<TAdminUser[]> {
  await requireAdmin();
  const search = query.trim();
  if (search === '') {
    return [];
  }

  try {
    const page = await adminApi.users.list({ page: 1, pageSize: SEARCH_PAGE_SIZE, q: search, isActive: true, sortBy: 'email', sortOrder: 'asc' });
    return page.items;
  } catch (error) {
    throw await toActionError(error, 'adminSearchUsers');
  }
}
