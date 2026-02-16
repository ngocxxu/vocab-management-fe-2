'use server';

import type { ResponseAPI } from '@/types';
import type { TCreateVocab, TVocab } from '@/types/vocab-list';
import type { VocabQueryParams } from '@/utils/api-config';
import { revalidatePath } from 'next/cache';
import { vocabApi } from '@/utils/server-api';
import { requireAuth } from './auth';
import { toActionError } from './utils';

export async function createVocab(vocabData: TCreateVocab) {
  await requireAuth();
  if (!vocabData || typeof vocabData !== 'object') {
    throw new Error('Vocab data is required');
  }
  if (!vocabData.textSource || !vocabData.languageFolderId) {
    throw new Error('Text source and language folder ID are required');
  }

  try {
    const result = await vocabApi.create(vocabData);
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw toActionError(error, 'Failed to create vocabulary');
  }
}

export async function updateVocab(id: string, vocabData: Partial<TCreateVocab>) {
  await requireAuth();
  if (!id || typeof id !== 'string') {
    throw new Error('Vocab ID is required');
  }
  if (!vocabData || typeof vocabData !== 'object') {
    throw new Error('Vocab data is required');
  }

  try {
    const result = await vocabApi.update(id, vocabData);
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw toActionError(error, 'Failed to update vocabulary');
  }
}

export async function deleteVocab(id: string): Promise<void> {
  await requireAuth();
  if (!id || typeof id !== 'string') {
    throw new Error('Vocab ID is required');
  }

  try {
    await vocabApi.delete(id);
    revalidatePath('/vocab-list');
  } catch (error) {
    throw toActionError(error, 'Failed to delete vocabulary');
  }
}

export async function createVocabsBulk(vocabData: TCreateVocab[]) {
  await requireAuth();
  if (!Array.isArray(vocabData) || vocabData.length === 0) {
    throw new Error('Vocab data array is required and must not be empty');
  }

  try {
    const result = await vocabApi.createBulk(vocabData);
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw toActionError(error, 'Failed to create vocabularies');
  }
}

export async function deleteVocabsBulk(ids: string[]): Promise<{ success: boolean }> {
  await requireAuth();
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error('IDs array is required and must not be empty');
  }

  try {
    await vocabApi.deleteBulk(ids);
    revalidatePath('/vocab-list');
    return { success: true };
  } catch (error) {
    throw toActionError(error, 'Failed to delete vocabularies');
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
  await requireAuth();
  if (!file || !(file instanceof File)) {
    throw new Error('File is required');
  }
  if (!options?.languageFolderId || !options?.sourceLanguageCode || !options?.targetLanguageCode) {
    throw new Error('Language folder ID, source language code, and target language code are required');
  }

  try {
    const result = await vocabApi.importCsv(file, options);
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw toActionError(error, 'Failed to import vocabularies');
  }
}

export async function exportVocabsCsv(params: Omit<VocabQueryParams, 'userId'>): Promise<Blob | { error: string }> {
  try {
    const user = await requireAuth();
    const response = await vocabApi.exportCsv({
      ...params,
      userId: user.id,
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
    const user = await requireAuth();
    const result = await vocabApi.getAll({
      ...params,
      userId: user.id,
    });
    return result;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch vocabularies',
    };
  }
}

export async function generateTextTargetContent(data: {
  textSource: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
}): Promise<{
  textTarget: string;
  wordTypeId: string;
  explanationSource: string;
  explanationTarget: string;
  subjectIds: string[];
  vocabExamples: Array<{ source: string; target: string }>;
}> {
  await requireAuth();
  if (!data.textSource || !data.sourceLanguageCode || !data.targetLanguageCode) {
    throw new Error('textSource, sourceLanguageCode, and targetLanguageCode are required');
  }

  try {
    const result = await vocabApi.generateTextTarget(data);
    return result;
  } catch (error) {
    throw toActionError(error, 'Failed to generate text target content');
  }
}
