'use server';

import type { TAdminLanguageInput, TAdminWordTypeInput } from '@/types/admin';
import { revalidatePath, updateTag } from 'next/cache';
import { catalogIdSchema, languageFormSchema, wordTypeFormSchema } from '@/libs/validations/catalog';
import { languagesApi, wordTypesApi } from '@/utils/server-api';
import { requireAdmin } from './auth';
import { toActionError, translateError } from './utils';

// The /vocab-list pickers read languages and word types through tagged caches. Those tags must be busted on
// every change, or the pickers keep the old list for up to an hour. revalidatePath does not reach those caches.
const LANGUAGE_PATHS = ['/admin/languages', '/vocab-list', '/library'] as const;
const WORD_TYPE_PATHS = ['/admin/word-types', '/vocab-list'] as const;

function refreshLanguages(): void {
  updateTag('languages');
  for (const path of LANGUAGE_PATHS) {
    revalidatePath(path);
  }
}

function refreshWordTypes(): void {
  updateTag('word-types');
  for (const path of WORD_TYPE_PATHS) {
    revalidatePath(path);
  }
}

export async function createAdminLanguage(input: TAdminLanguageInput): Promise<void> {
  await requireAdmin();
  const parsedInput = languageFormSchema.safeParse(input);
  if (!parsedInput.success) {
    throw new Error(await translateError('adminInvalidInput'));
  }

  try {
    await languagesApi.create(parsedInput.data);
    refreshLanguages();
  } catch (error) {
    throw await toActionError(error, 'adminSaveLanguage');
  }
}

/** The form sends the code too. The BE refuses any change to it, so only a name change succeeds. */
export async function updateAdminLanguage(id: string, input: TAdminLanguageInput): Promise<void> {
  await requireAdmin();
  const parsedId = catalogIdSchema.safeParse(id);
  const parsedInput = languageFormSchema.safeParse(input);
  if (!parsedId.success || !parsedInput.success) {
    throw new Error(await translateError('adminInvalidInput'));
  }

  try {
    await languagesApi.update(parsedId.data, parsedInput.data);
    refreshLanguages();
  } catch (error) {
    throw await toActionError(error, 'adminSaveLanguage');
  }
}

export async function deleteAdminLanguage(id: string): Promise<void> {
  await requireAdmin();
  const parsedId = catalogIdSchema.safeParse(id);
  if (!parsedId.success) {
    throw new Error(await translateError('adminInvalidInput'));
  }

  try {
    await languagesApi.delete(parsedId.data);
    refreshLanguages();
  } catch (error) {
    throw await toActionError(error, 'adminDeleteLanguage');
  }
}

export async function createAdminWordType(input: TAdminWordTypeInput): Promise<void> {
  await requireAdmin();
  const parsedInput = wordTypeFormSchema.safeParse(input);
  if (!parsedInput.success) {
    throw new Error(await translateError('adminInvalidInput'));
  }

  try {
    await wordTypesApi.create(parsedInput.data);
    refreshWordTypes();
  } catch (error) {
    throw await toActionError(error, 'adminSaveWordType');
  }
}

export async function updateAdminWordType(id: string, input: TAdminWordTypeInput): Promise<void> {
  await requireAdmin();
  const parsedId = catalogIdSchema.safeParse(id);
  const parsedInput = wordTypeFormSchema.safeParse(input);
  if (!parsedId.success || !parsedInput.success) {
    throw new Error(await translateError('adminInvalidInput'));
  }

  try {
    await wordTypesApi.update(parsedId.data, parsedInput.data);
    refreshWordTypes();
  } catch (error) {
    throw await toActionError(error, 'adminSaveWordType');
  }
}

export async function deleteAdminWordType(id: string): Promise<void> {
  await requireAdmin();
  const parsedId = catalogIdSchema.safeParse(id);
  if (!parsedId.success) {
    throw new Error(await translateError('adminInvalidInput'));
  }

  try {
    await wordTypesApi.delete(parsedId.data);
    refreshWordTypes();
  } catch (error) {
    throw await toActionError(error, 'adminDeleteWordType');
  }
}
