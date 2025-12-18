'use server';

import { revalidatePath } from 'next/cache';
import { languageFoldersApi } from '@/utils/server-api';

export async function createLanguageFolder(languageFolderData: {
  name: string;
  folderColor: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
}) {
  try {
    const result = await languageFoldersApi.create(languageFolderData);
    revalidatePath('/library');
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create language folder');
  }
}

export async function updateLanguageFolder(
  id: string,
  languageFolderData: {
    name: string;
    folderColor: string;
    sourceLanguageCode: string;
    targetLanguageCode: string;
  },
) {
  try {
    const result = await languageFoldersApi.update(id, languageFolderData);
    revalidatePath('/library');
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update language folder');
  }
}

export async function deleteLanguageFolder(id: string) {
  try {
    const result = await languageFoldersApi.delete(id);
    revalidatePath('/library');
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete language folder');
  }
}
