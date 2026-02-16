'use server';

import { revalidatePath } from 'next/cache';
import { wordTypesApi } from '@/utils/server-api';
import { requireAuth } from './auth';
import { toActionError } from './utils';

export async function createWordType(wordTypeData: { name: string; description: string }) {
  await requireAuth();
  try {
    const result = await wordTypesApi.create(wordTypeData);
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw toActionError(error, 'Failed to create word type');
  }
}

export async function updateWordType(id: string, wordTypeData: { name: string; description: string }) {
  await requireAuth();
  try {
    const result = await wordTypesApi.update(id, wordTypeData);
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw toActionError(error, 'Failed to update word type');
  }
}

export async function deleteWordType(id: string) {
  await requireAuth();
  try {
    const result = await wordTypesApi.delete(id);
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw toActionError(error, 'Failed to delete word type');
  }
}
