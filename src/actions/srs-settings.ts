'use server';

import type { TSrsSettings, TUpdateSrsSettings } from '@/types/srs-settings';
import { revalidatePath } from 'next/cache';
import { srsSettingsApi } from '@/utils/server-api';
import { requireAuth } from './auth';
import { toActionError } from './utils';

/** FSRS defaults and timezone of the current user; what the user has not set comes back as the system default. */
export async function getSrsSettings(): Promise<TSrsSettings> {
  await requireAuth();
  try {
    return await srsSettingsApi.get();
  } catch (error) {
    throw await toActionError(error, 'loadSpacedRepetitionSettings');
  }
}

/** Only the fields that are sent change. Trainers that already exist keep the values they were created with. */
export async function updateSrsSettings(data: TUpdateSrsSettings): Promise<TSrsSettings> {
  await requireAuth();
  try {
    const result = await srsSettingsApi.update(data);
    revalidatePath('/profile');
    return result;
  } catch (error) {
    throw await toActionError(error, 'saveSpacedRepetitionSettings');
  }
}
