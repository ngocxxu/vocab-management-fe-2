'use server';

import { revalidatePath } from 'next/cache';
import { languagesApi } from '@/utils/server-api';
import { requireAuth } from './auth';
import { toActionError } from './utils';

export async function createLanguage(languageData: { name: string; code: string }) {
  await requireAuth();
  try {
    const result = await languagesApi.create(languageData);
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw toActionError(error, 'Failed to create language');
  }
}

export async function updateLanguage(id: string, languageData: { name: string; code: string }) {
  await requireAuth();
  try {
    const result = await languagesApi.update(id, languageData);
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw toActionError(error, 'Failed to update language');
  }
}

export async function deleteLanguage(id: string) {
  await requireAuth();
  try {
    const result = await languagesApi.delete(id);
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw toActionError(error, 'Failed to delete language');
  }
}
