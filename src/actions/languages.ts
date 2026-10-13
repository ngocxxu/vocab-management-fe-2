'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { languagesApi } from '@/utils/server-api';
import { requireAuth } from './auth';
import { toActionError } from './utils';

export async function createLanguage(languageData: { name: string; code: string }) {
  await requireAuth();
  try {
    const result = await languagesApi.create(languageData);
    updateTag('languages');
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw await toActionError(error, 'createLanguage');
  }
}

export async function updateLanguage(id: string, languageData: { name: string; code: string }) {
  await requireAuth();
  try {
    const result = await languagesApi.update(id, languageData);
    updateTag('languages');
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw await toActionError(error, 'updateLanguage');
  }
}

export async function deleteLanguage(id: string) {
  await requireAuth();
  try {
    const result = await languagesApi.delete(id);
    updateTag('languages');
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw await toActionError(error, 'deleteLanguage');
  }
}
