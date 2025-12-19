'use server';

import type { ResponseAPI } from '@/types';
import type { TCreateVocab, TVocab } from '@/types/vocab-list';
import type { VocabQueryParams } from '@/utils/api-config';
import { revalidatePath } from 'next/cache';
import { authApi, vocabApi } from '@/utils/server-api';

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

export async function exportVocabsCsv(params: Omit<VocabQueryParams, 'userId'>): Promise<Blob | { error: string }> {
  try {
    const verifyResponse = await authApi.verify();
    const userId = verifyResponse?.id;

    if (!userId) {
      return {
        error: 'User not authenticated',
      };
    }

    const response = await vocabApi.exportCsv({
      ...params,
      userId,
    });
    const blob = await response.blob();
    return blob;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to export vocabularies',
    };
  }
}

export async function getVocabsForSelection(params: Omit<VocabQueryParams, 'userId'>): Promise<ResponseAPI<TVocab[]> | { error: string }> {
  try {
    const verifyResponse = await authApi.verify();
    const userId = verifyResponse?.id;

    if (!userId) {
      return {
        error: 'User not authenticated',
      };
    }

    const result = await vocabApi.getAll({
      ...params,
      userId,
    });
    return result;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch vocabularies',
    };
  }
}
