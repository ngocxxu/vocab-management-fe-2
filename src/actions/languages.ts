'use server';

import { revalidatePath } from 'next/cache';
import { languagesApi } from '@/utils/server-api';

export async function createLanguage(languageData: { name: string; code: string }) {
  try {
    const result = await languagesApi.create(languageData);
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create language');
  }
}

export async function updateLanguage(id: string, languageData: { name: string; code: string }) {
  try {
    const result = await languagesApi.update(id, languageData);
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update language');
  }
}

export async function deleteLanguage(id: string) {
  try {
    const result = await languagesApi.delete(id);
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete language');
  }
}
