'use server';

import type { TCreateApiKey } from '@/types/api-key';
import { revalidatePath } from 'next/cache';
import { apiKeysApi } from '@/utils/server-api';
import { requireAuth } from './auth';
import { toActionError } from './utils';

export async function createApiKey(apiKeyData: TCreateApiKey) {
  await requireAuth();
  try {
    const result = await apiKeysApi.create(apiKeyData);
    revalidatePath('/api-keys');
    return result;
  } catch (error) {
    throw toActionError(error, 'Failed to create API key');
  }
}

export async function deleteApiKey(id: string) {
  await requireAuth();
  try {
    const result = await apiKeysApi.delete(id);
    revalidatePath('/api-keys');
    return result;
  } catch (error) {
    throw toActionError(error, 'Failed to delete API key');
  }
}
