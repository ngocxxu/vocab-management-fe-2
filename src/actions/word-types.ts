'use server';

import { revalidatePath } from 'next/cache';
import { wordTypesApi } from '@/utils/server-api';

export async function createWordType(wordTypeData: { name: string; description: string }) {
  try {
    const result = await wordTypesApi.create(wordTypeData);
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create word type');
  }
}

export async function updateWordType(id: string, wordTypeData: { name: string; description: string }) {
  try {
    const result = await wordTypesApi.update(id, wordTypeData);
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update word type');
  }
}

export async function deleteWordType(id: string) {
  try {
    const result = await wordTypesApi.delete(id);
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete word type');
  }
}
