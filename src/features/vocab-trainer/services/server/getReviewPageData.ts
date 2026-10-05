import { vocabTrainerApi } from '@/utils/server-api';

/** What the review page needs to start: the trainer (for its mode and question type) and its current counts. */
export async function getReviewPageData(trainerId: string) {
  const [trainer, summary] = await Promise.all([
    vocabTrainerApi.getById(trainerId),
    vocabTrainerApi.getReviewSummary(trainerId),
  ]);

  return { trainer, summary };
}
