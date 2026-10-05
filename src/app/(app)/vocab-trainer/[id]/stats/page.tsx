import { notFound, redirect } from 'next/navigation';
import FsrsStats from '@/components/vocab-trainer/fsrs-stats/FsrsStats';
import { ETrainerMode } from '@/enum/vocab-trainer';
import { getStatsPageData } from '@/features/vocab-trainer/services/server/getStatsPageData';
import { logger } from '@/libs/Logger';
import { getExpiredSessionRedirect, isUnauthorizedError } from '@/utils/auth-error';
import { BackendRequestError } from '@/utils/backend-request-error';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ id: string }>;
};

const HTTP_NOT_FOUND = 404;

export default async function StatsPage({ params }: PageProps) {
  const { id } = await params;

  let data: Awaited<ReturnType<typeof getStatsPageData>>;
  try {
    data = await getStatsPageData(id);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      redirect(getExpiredSessionRedirect(`/vocab-trainer/${id}/stats`));
    }
    if (error instanceof BackendRequestError && error.statusCode === HTTP_NOT_FOUND) {
      notFound();
    }

    logger.error('Failed to load the stats page:', { error });

    return (
      <div className="flex min-h-full items-center justify-center p-8 text-lg text-destructive">
        Unable to load these statistics right now. Please refresh the page or try again later.
      </div>
    );
  }

  const { trainer, stats } = data;
  // Classic trainers have no schedule to show; their numbers live on the dashboard.
  if (trainer.mode !== ETrainerMode.FSRS) {
    redirect('/vocab-trainer');
  }

  return (
    <div className="min-h-full bg-background">
      <FsrsStats trainerId={trainer.id} trainerName={trainer.name} stats={stats} />
    </div>
  );
}
