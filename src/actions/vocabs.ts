'use server';

import type { TCreateVocab } from '@/types/vocab-list';
import { vocabApi } from '@/utils/server-api';

export async function createVocab(vocabData: TCreateVocab) {
  try {
    return await vocabApi.create(vocabData);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create vocabulary');
  }
}

export async function updateVocab(id: string, vocabData: Partial<TCreateVocab>) {
  try {
    return await vocabApi.update(id, vocabData);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update vocabulary');
  }
}

export async function deleteVocab(id: string): Promise<void> {
  try {
    await vocabApi.delete(id);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete vocabulary');
  }
}

export async function createVocabsBulk(vocabData: TCreateVocab[]) {
  try {
    return await vocabApi.createBulk(vocabData);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create vocabularies');
  }
}

export async function deleteVocabsBulk(ids: string[]): Promise<{ success: boolean }> {
  try {
    await vocabApi.deleteBulk(ids);
    return { success: true };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete vocabularies');
  }
}
