'use client';

import type { TSrsQuestionType } from '@/types/srs-settings';
import type { TFsrsReviewQueue, TFsrsReviewSummary } from '@/types/vocab-trainer';
import { AltArrowLeft } from '@solar-icons/react/ssr';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { getReviewQueue } from '@/actions/vocab-trainers';
import { Button } from '@/shared/ui/button';
import { DEFAULT_SESSION_SIZE } from '@/utils/fsrs-review';
import FsrsReviewSession from './FsrsReviewSession';
import FsrsReviewStart from './FsrsReviewStart';

type FsrsReviewProps = Readonly<{
  trainerId: string;
  trainerName: string;
  questionType: TSrsQuestionType;
  summary: TFsrsReviewSummary;
}>;

const FsrsReview: React.FC<FsrsReviewProps> = ({ trainerId, trainerName, questionType, summary }) => {
  const t = useTranslations('trainer.fsrs');
  const router = useRouter();
  const [queue, setQueue] = useState<TFsrsReviewQueue | null>(null);
  // A new key starts a new session: its answers and its retry round begin empty.
  const [sessionKey, setSessionKey] = useState(0);
  const [lastAhead, setLastAhead] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasEnded, setHasEnded] = useState(summary.ended);

  const loadQueue = useCallback(async (limit: number, ahead: number) => {
    setIsLoading(true);
    try {
      const loaded = await getReviewQueue(trainerId, { limit, ahead });
      if (loaded.ended) {
        setHasEnded(true);
        setQueue(null);

        return;
      }
      if (loaded.items.length === 0) {
        toast.info(t('review.nothingToReview'));
        setQueue(null);

        return;
      }
      setLastAhead(ahead);
      setQueue(loaded);
      setSessionKey(key => key + 1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('review.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [trainerId, t]);

  const handleStop = useCallback(() => router.push('/vocab-trainer'), [router]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10">
      <Button type="button" variant="ghost" size="sm" className="mb-6 -ml-2" onClick={handleStop}>
        <AltArrowLeft size={16} weight="BoldDuotone" className="mr-1" />
        {t('review.back')}
      </Button>

      {queue && !hasEnded
        ? (
            <FsrsReviewSession
              key={sessionKey}
              trainerId={trainerId}
              questionType={questionType}
              items={queue.items}
              pendingAfter={queue.pendingAfterThisSession}
              moreCount={Math.min(DEFAULT_SESSION_SIZE, queue.pendingAfterThisSession)}
              isLoadingMore={isLoading}
              onMore={() => void loadQueue(DEFAULT_SESSION_SIZE, lastAhead)}
              onStop={handleStop}
              onEnded={() => setHasEnded(true)}
            />
          )
        : (
            <FsrsReviewStart
              trainerName={trainerName}
              summary={{ ...summary, ended: hasEnded }}
              isLoading={isLoading}
              onStart={(limit, ahead) => void loadQueue(limit, ahead)}
            />
          )}
    </div>
  );
};

export default FsrsReview;
