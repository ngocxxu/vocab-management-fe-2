import { vocabTrainerApi } from '@/utils/server-api';

/** What the Stats page needs: the trainer (for its name and mode) and its statistics. */
export async function getStatsPageData(trainerId: string) {
  const [trainer, stats] = await Promise.all([
    vocabTrainerApi.getById(trainerId),
    vocabTrainerApi.getReviewStats(trainerId),
  ]);

  return { trainer, stats };
}
