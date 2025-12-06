'use server';

import { languageFoldersApi } from '@/utils/server-api';

export async function createLanguageFolder(languageFolderData: {
  name: string;
  folderColor: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
}) {
  try {
    return await languageFoldersApi.create(languageFolderData);
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
    return await languageFoldersApi.update(id, languageFolderData);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update language folder');
  }
}

export async function deleteLanguageFolder(id: string) {
  try {
    return await languageFoldersApi.delete(id);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete language folder');
  }
}
