import { redirect } from 'next/navigation';
import { getTrainerConflictsPageData } from '@/features/vocab-trainer-conflicts/services/server/getTrainerConflictsPageData';
import TrainerConflictsContent from '@/features/vocab-trainer-conflicts/ui/TrainerConflictsContent';
import { parseVocabIds } from '@/features/vocab-trainer-conflicts/utils/parse-vocab-ids';
import { logger } from '@/libs/Logger';
import { getExpiredSessionRedirect, hasUnauthorizedError } from '@/utils/auth-error';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{ vocabIds?: string | string[] }>;
};

export default async function TrainerConflictsPage({ searchParams }: PageProps) {
  const { vocabIds: rawVocabIds } = await searchParams;
  const vocabIds = parseVocabIds(rawVocabIds);
  if (vocabIds.length === 0) {
    redirect('/vocab-list');
  }

  const { conflicts, error } = await getTrainerConflictsPageData(vocabIds);
  if (error !== undefined && hasUnauthorizedError([error])) {
    redirect(getExpiredSessionRedirect(`/vocab-list/trainer-conflicts?vocabIds=${encodeURIComponent(vocabIds.join(','))}`));
  }
  if (error !== undefined) {
    logger.error('Failed to load trainer conflicts:', { error });
  }

  return <TrainerConflictsContent conflicts={conflicts} loadFailed={error !== undefined} />;
}
