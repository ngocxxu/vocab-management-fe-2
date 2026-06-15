'use server';

import type { ResponseAPI } from '@/types';
import type { TextTargetQueryParams } from '@/utils/api-config';
import type { TCreateTextTarget, TTextTarget, TUpdateTextTarget } from '@/types/vocab-list';
import { revalidatePath } from 'next/cache';
import { textTargetApi } from '@/utils/server-api';
import { requireAuth } from './auth';
import { toActionError } from './utils';

export async function getTextTargets(vocabId: string, params?: TextTargetQueryParams): Promise<ResponseAPI<TTextTarget[]>> {
  await requireAuth();
  if (!vocabId) {
    throw new Error('Vocab ID is required');
  }
  try {
    return await textTargetApi.getAll(vocabId, params);
  } catch (error) {
    throw toActionError(error, 'Failed to fetch text targets');
  }
}

export async function getTextTargetById(vocabId: string, id: string): Promise<TTextTarget> {
  await requireAuth();
  if (!vocabId || !id) {
    throw new Error('Vocab ID and text target ID are required');
  }
  try {
    return await textTargetApi.getById(vocabId, id);
  } catch (error) {
    throw toActionError(error, 'Failed to fetch text target');
  }
}

export async function createTextTarget(vocabId: string, data: TCreateTextTarget): Promise<TTextTarget> {
  await requireAuth();
  if (!vocabId) {
    throw new Error('Vocab ID is required');
  }
  try {
    const result = await textTargetApi.create(vocabId, data);
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw toActionError(error, 'Failed to create text target');
  }
}

export async function updateTextTarget(vocabId: string, id: string, data: TUpdateTextTarget): Promise<TTextTarget> {
  await requireAuth();
  if (!vocabId || !id) {
    throw new Error('Vocab ID and text target ID are required');
  }
  try {
    const result = await textTargetApi.update(vocabId, id, data);
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw toActionError(error, 'Failed to update text target');
  }
}

export async function deleteTextTarget(vocabId: string, id: string): Promise<void> {
  await requireAuth();
  if (!vocabId || !id) {
    throw new Error('Vocab ID and text target ID are required');
  }
  try {
    await textTargetApi.delete(vocabId, id);
    revalidatePath('/vocab-list');
  } catch (error) {
    throw toActionError(error, 'Failed to delete text target');
  }
}
