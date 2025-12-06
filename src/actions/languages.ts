'use server';

import { languagesApi } from '@/utils/server-api';

export async function createLanguage(languageData: { name: string; code: string }) {
  try {
    return await languagesApi.create(languageData);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create language');
  }
}

export async function updateLanguage(id: string, languageData: { name: string; code: string }) {
  try {
    return await languagesApi.update(id, languageData);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update language');
  }
}

export async function deleteLanguage(id: string) {
  try {
    return await languagesApi.delete(id);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete language');
  }
}
