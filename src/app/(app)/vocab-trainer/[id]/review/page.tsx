import type { TSrsQuestionType } from '@/types/srs-settings';
import { notFound, redirect } from 'next/navigation';
import FsrsReview from '@/components/vocab-trainer/fsrs-review/FsrsReview';
import { ETrainerMode } from '@/enum/vocab-trainer';
import { getReviewPageData } from '@/features/vocab-trainer/services/server/getReviewPageData';
import { logger } from '@/libs/Logger';
import { isFsrsQuestionType } from '@/libs/validations/vocab-trainer';
import { getExpiredSessionRedirect, isUnauthorizedError } from '@/utils/auth-error';
import { BackendRequestError } from '@/utils/backend-request-error';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ id: string }>;
};

const HTTP_NOT_FOUND = 404;

export default async function ReviewPage({ params }: PageProps) {
  const { id } = await params;

  let data: Awaited<ReturnType<typeof getReviewPageData>>;
  try {
    data = await getReviewPageData(id);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      redirect(getExpiredSessionRedirect(`/vocab-trainer/${id}/review`));
    }
    if (error instanceof BackendRequestError && error.statusCode === HTTP_NOT_FOUND) {
      notFound();
    }

    logger.error('Failed to load the review page:', { error });

    return (
      <div className="flex min-h-full items-center justify-center p-8 text-lg text-destructive">
        Unable to load this review right now. Please refresh the page or try again later.
      </div>
    );
  }

  const { trainer, summary } = data;
  // Classic trainers have their own exam; only an FSRS trainer is reviewed here.
  if (trainer.mode !== ETrainerMode.FSRS || !isFsrsQuestionType(trainer.questionType)) {
    redirect('/vocab-trainer');
  }

  return (
    <div className="min-h-full bg-background">
      <FsrsReview
        trainerId={trainer.id}
        trainerName={trainer.name}
        questionType={trainer.questionType as TSrsQuestionType}
        summary={summary}
      />
    </div>
  );
}
