'use server';

import type { ResponseAPI, TLanguageFolder } from '@/types';
import type { LanguageFolderQueryParams } from '@/utils/api-config';
import { revalidatePath } from 'next/cache';
import { languageFoldersApi } from '@/utils/server-api';
import { requireAuth } from './auth';
import { toActionError } from './utils';

export async function createLanguageFolder(languageFolderData: {
  name: string;
  folderColor: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
}) {
  await requireAuth();
  try {
    const result = await languageFoldersApi.create(languageFolderData);
    revalidatePath('/library');
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw toActionError(error, 'Failed to create language folder');
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
  await requireAuth();
  try {
    const result = await languageFoldersApi.update(id, languageFolderData);
    revalidatePath('/library');
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw toActionError(error, 'Failed to update language folder');
  }
}

export async function deleteLanguageFolder(id: string) {
  await requireAuth();
  try {
    const result = await languageFoldersApi.delete(id);
    revalidatePath('/library');
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw toActionError(error, 'Failed to delete language folder');
  }
}

export async function getMyLanguageFoldersForSelection(params?: LanguageFolderQueryParams): Promise<ResponseAPI<TLanguageFolder[]> | { error: string }> {
  try {
    await requireAuth();
  } catch {
    return { error: 'User not authenticated' };
  }
  try {
    const result = await languageFoldersApi.getMy(params || { page: 1, pageSize: 100 });
    return result;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch language folders',
    };
  }
}
