import type { TVocabTrainerConflict } from '@/types/vocab-conflict';
import { vocabApi } from '@/utils/server-api';

/** The words of a refused delete and the trainers that still hold them. A failed load is returned, not thrown. */
export async function getTrainerConflictsPageData(vocabIds: string[]): Promise<{ conflicts: TVocabTrainerConflict[]; error?: unknown }> {
  try {
    const conflicts = await vocabApi.getConflictByTrainer(vocabIds);

    return { conflicts };
  } catch (error: unknown) {
    return { conflicts: [], error };
  }
}
