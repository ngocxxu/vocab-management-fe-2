'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { wordTypesApi } from '@/utils/server-api';
import { requireAuth } from './auth';
import { toActionError } from './utils';

export async function createWordType(wordTypeData: { name: string; description: string }) {
  await requireAuth();
  try {
    const result = await wordTypesApi.create(wordTypeData);
    updateTag('word-types');
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw await toActionError(error, 'createWordType');
  }
}

export async function updateWordType(id: string, wordTypeData: { name: string; description: string }) {
  await requireAuth();
  try {
    const result = await wordTypesApi.update(id, wordTypeData);
    updateTag('word-types');
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw await toActionError(error, 'updateWordType');
  }
}

export async function deleteWordType(id: string) {
  await requireAuth();
  try {
    const result = await wordTypesApi.delete(id);
    updateTag('word-types');
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw await toActionError(error, 'deleteWordType');
  }
}
