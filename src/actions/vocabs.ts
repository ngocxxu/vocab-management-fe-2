'use server';

import type { TCreateVocab } from '@/types/vocab-list';
import { revalidatePath } from 'next/cache';
import { vocabApi } from '@/utils/server-api';

export async function createVocab(vocabData: TCreateVocab) {
  try {
    const result = await vocabApi.create(vocabData);
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create vocabulary');
  }
}

export async function updateVocab(id: string, vocabData: Partial<TCreateVocab>) {
  try {
    const result = await vocabApi.update(id, vocabData);
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update vocabulary');
  }
}

export async function deleteVocab(id: string): Promise<void> {
  try {
    await vocabApi.delete(id);
    revalidatePath('/vocab-list');
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete vocabulary');
  }
}

export async function createVocabsBulk(vocabData: TCreateVocab[]) {
  try {
    const result = await vocabApi.createBulk(vocabData);
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create vocabularies');
  }
}

export async function deleteVocabsBulk(ids: string[]): Promise<{ success: boolean }> {
  try {
    await vocabApi.deleteBulk(ids);
    revalidatePath('/vocab-list');
    return { success: true };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete vocabularies');
  }
}

export async function importVocabsCsv(
  file: File,
  options: {
    languageFolderId: string;
    sourceLanguageCode: string;
    targetLanguageCode: string;
  },
) {
  try {
    const result = await vocabApi.importCsv(file, options);
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to import vocabularies');
  }
}
