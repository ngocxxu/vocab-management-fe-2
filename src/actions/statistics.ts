'use server';

import { MAX_PROBLEMATIC_PRACTICE_LIMIT } from '@/constants/statistics';
import { statisticsApi } from '@/utils/server-api';
import { requireAuth } from './auth';

export async function getProblematicVocabIdsForPractice(): Promise<string[] | { error: string }> {
  try {
    await requireAuth();

    const summary = await statisticsApi.getSummary();
    const totalNeedReview = summary.criticalCount + summary.warningCount;

    if (totalNeedReview === 0) {
      return [];
    }

    const limit = Math.min(totalNeedReview, MAX_PROBLEMATIC_PRACTICE_LIMIT);
    const problematic = await statisticsApi.getProblematic({
      status: 'all',
      limit,
      page: 1,
    });

    return (problematic ?? []).map(item => item.vocabId);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to load problematic vocabulary',
    };
  }
}
