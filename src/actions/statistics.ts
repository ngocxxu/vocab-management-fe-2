'use server';

import { MAX_PROBLEMATIC_PRACTICE_LIMIT } from '@/constants/statistics';
import { statisticsApi } from '@/utils/server-api';
import { requireAuth } from './auth';

export async function getProblematicVocabIdsForPractice(sourceLanguageCode?: string): Promise<string[] | { error: string }> {
  try {
    await requireAuth();

    const problematic = await statisticsApi.getProblematic({
      status: 'all',
      limit: MAX_PROBLEMATIC_PRACTICE_LIMIT,
      page: 1,
      sourceLanguageCode,
    });

    return (problematic ?? []).map(item => item.vocabId);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to load problematic vocabulary',
    };
  }
}
