'use server';

import { wordTypesApi } from '@/utils/server-api';

export async function createWordType(wordTypeData: { name: string; description: string }) {
  try {
    return await wordTypesApi.create(wordTypeData);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create word type');
  }
}

export async function updateWordType(id: string, wordTypeData: { name: string; description: string }) {
  try {
    return await wordTypesApi.update(id, wordTypeData);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update word type');
  }
}

export async function deleteWordType(id: string) {
  try {
    return await wordTypesApi.delete(id);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete word type');
  }
}
