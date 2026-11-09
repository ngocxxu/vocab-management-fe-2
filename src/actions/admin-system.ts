'use server';

import { revalidatePath } from 'next/cache';
import { aiModelCatalogInputSchema, aiSettingInputSchema } from '@/libs/validations/ai-settings';
import type { TAiCatalogKind, TAiCatalogProvider, TAiModelCatalog, TAiSettingKey } from '@/types/admin';
import { isBackendNotFound } from '@/utils/backend-request-error';
import { cacheApi, configApi } from '@/utils/server-api';
import { requireAdmin } from './auth';
import { toActionError, translateError } from './utils';

const SYSTEM_PATH = '/admin/system';

// A key that is already gone is already reset, so a 404 on delete is not a failure.
async function deleteSettingIfSet(key: TAiSettingKey): Promise<void> {
  try {
    await configApi.deleteSystem(key);
  } catch (error) {
    if (!isBackendNotFound(error)) {
      throw error;
    }
  }
}

/** Saves one AI setting. A null or blank value resets it, which deletes the key so the env default applies again. */
export async function saveAdminAiSetting(input: { key: TAiSettingKey; value: string | null }): Promise<void> {
  await requireAdmin();
  const parsedInput = aiSettingInputSchema.safeParse(input);
  if (!parsedInput.success) {
    throw new Error(await translateError('adminInvalidInput'));
  }

  const { key, value } = parsedInput.data;
  try {
    if (value === null) {
      await deleteSettingIfSet(key);
    } else {
      await configApi.setSystem(key, value);
    }
    revalidatePath(SYSTEM_PATH);
  } catch (error) {
    throw await toActionError(error, 'adminSaveAiSetting');
  }
}

/** Models one provider reports, for the model suggestions. Read-only, so the page is not refreshed. */
export async function listAdminAiModels(input: { provider: TAiCatalogProvider; kind: TAiCatalogKind }): Promise<TAiModelCatalog> {
  await requireAdmin();
  const parsedInput = aiModelCatalogInputSchema.safeParse(input);
  if (!parsedInput.success) {
    throw new Error(await translateError('adminInvalidInput'));
  }

  try {
    return await configApi.listModels(parsedInput.data.provider, parsedInput.data.kind);
  } catch (error) {
    throw await toActionError(error, 'adminListAiModels');
  }
}

/** Clears every app cache prefix. The whole Redis database is never flushed from here. */
export async function clearAdminCaches(): Promise<void> {
  await requireAdmin();

  try {
    await cacheApi.clear();
    revalidatePath(SYSTEM_PATH);
  } catch (error) {
    throw await toActionError(error, 'adminClearCache');
  }
}
