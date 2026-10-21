'use server';

import type { TCreateApiKey } from '@/types/api-key';
import { revalidatePath } from 'next/cache';
import { apiKeysApi } from '@/utils/server-api';
import { toActionError } from './utils';

export async function createApiKey(apiKeyData: TCreateApiKey) {
  try {
    const result = await apiKeysApi.create(apiKeyData);
    revalidatePath('/api-keys');
    return result;
  } catch (error) {
    throw await toActionError(error, 'createAPIKey');
  }
}

export async function deleteApiKey(id: string) {
  try {
    const result = await apiKeysApi.delete(id);
    revalidatePath('/api-keys');
    return result;
  } catch (error) {
    throw await toActionError(error, 'deleteAPIKey');
  }
}
