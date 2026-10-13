import type { TAiSettingKey, TAiSettings, TCacheRow } from '@/types/admin';
import { AI_SETTING_KEYS } from '@/constants/admin';
import { isBackendNotFound } from '@/utils/backend-request-error';
import { cacheApi, configApi } from '@/utils/server-api';
import { toCacheRows } from '../../utils/cache-rows';

// A key the BE does not have is unset, so the env default applies. Any other failure is real and reaches the page.
async function readSetting(key: TAiSettingKey): Promise<string | null> {
  try {
    const config = await configApi.getSystem(key);
    return typeof config.value === 'string' ? config.value : null;
  } catch (error) {
    if (isBackendNotFound(error)) {
      return null;
    }
    throw error;
  }
}

/** The four AI settings, each a stored value or null for the env default. */
export async function readAiSettings(): Promise<TAiSettings> {
  // Promise.all keeps the order of AI_SETTING_KEYS, so the four values line up with the destructuring below.
  const [chatProvider, chatModel, audioProvider, audioModel] = await Promise.all(AI_SETTING_KEYS.map(readSetting));

  return {
    'ai.chat.provider': chatProvider ?? null,
    'ai.chat.model': chatModel ?? null,
    'ai.audio.provider': audioProvider ?? null,
    'ai.audio.model': audioModel ?? null,
  };
}

/** Everything the system page shows: the AI settings and the cache rows, read in parallel. */
export async function getAdminSystemPageData(): Promise<{ aiSettings: TAiSettings; cacheRows: TCacheRow[] }> {
  const [aiSettings, cacheStats] = await Promise.all([readAiSettings(), cacheApi.stats()]);

  return { aiSettings, cacheRows: toCacheRows(cacheStats) };
}
