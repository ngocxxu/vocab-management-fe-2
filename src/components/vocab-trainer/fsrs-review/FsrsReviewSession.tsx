'use client';

import type { TSrsQuestionType } from '@/types/srs-settings';
import type { TFsrsQueueItem, TFsrsReviewResult } from '@/types/vocab-trainer';
import React, { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { submitReviewAnswer } from '@/actions/vocab-trainers';
import { EFsrsRating } from '@/enum/vocab-trainer';
import { missedItems } from '@/utils/fsrs-review';
import FsrsCardStep from './FsrsCardStep';
import FsrsSessionSummary from './FsrsSessionSummary';

type FsrsReviewSessionProps = Readonly<{
  trainerId: string;
  questionType: TSrsQuestionType;
  /** The list is fixed when the session starts and does not change while it runs. */
  items: TFsrsQueueItem[];
  pendingAfter: number;
  moreCount: number;
  isLoadingMore: boolean;
  onMore: () => void;
  onStop: () => void;
  /** The cycle of the trainer ended while the session was running. */
  onEnded: () => void;
}>;

type RetryRound = { items: TFsrsQueueItem[]; index: number; recalled: number };

function Progress({ label, current, total }: Readonly<{ label: string; current: number; total: number }>) {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-2">
      <p className="text-sm font-medium text-muted-foreground">
        {label}
        {' '}
        {Math.min(current + 1, total)}
        {' '}
        of
        {' '}
        {total}
      </p>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full bg-primary transition-[width]" style={{ width: `${total === 0 ? 0 : (current / total) * 100}%` }} />
      </div>
    </div>
  );
}

const FsrsReviewSession: React.FC<FsrsReviewSessionProps> = ({ trainerId, questionType, items, pendingAfter, moreCount, isLoadingMore, onMore, onStop, onEnded }) => {
  const [results, setResults] = useState<TFsrsReviewResult[]>([]);
  const [retry, setRetry] = useState<RetryRound | null>(null);
  const [retryOutcome, setRetryOutcome] = useState<{ recalled: number; total: number } | null>(null);

  const rateReview = useCallback(async (item: TFsrsQueueItem, rating: EFsrsRating, meta: { answerId: string; durationMs: number }): Promise<boolean> => {
    try {
      const outcome = await submitReviewAnswer(trainerId, {
        cardId: item.cardId,
        answerId: meta.answerId,
        rating,
        questionType,
        durationMs: meta.durationMs,
      });
      if (outcome.ended) {
        onEnded();
        return true;
      }
      setResults(previous => [...previous, { item, rating }]);

      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save the answer', { description: 'Press the button again to retry.' });

      return false;
    }
  }, [trainerId, questionType, onEnded]);

  // The retry round only moves through the missed cards on screen: it never calls the server.
  const rateRetry = (rating: EFsrsRating): Promise<boolean> => {
    if (retry) {
      const recalled = retry.recalled + (rating === EFsrsRating.AGAIN ? 0 : 1);
      if (retry.index + 1 >= retry.items.length) {
        setRetryOutcome({ recalled, total: retry.items.length });
        setRetry(null);
      } else {
        setRetry({ ...retry, index: retry.index + 1, recalled });
      }
    }

    return Promise.resolve(true);
  };

  const retryItem = retry?.items[retry.index];
  if (retry && retryItem) {
    return (
      <div className="space-y-6">
        <Progress label="Retry missed" current={retry.index} total={retry.items.length} />
        <FsrsCardStep key={`${retryItem.cardId}-retry`} trainerId={trainerId} item={retryItem} questionType={questionType} variant="retry" onRate={rating => rateRetry(rating)} />
      </div>
    );
  }

  const current = items[results.length];
  if (current) {
    return (
      <div className="space-y-6">
        <Progress label="Question" current={results.length} total={items.length} />
        <FsrsCardStep
          key={current.cardId}
          trainerId={trainerId}
          item={current}
          questionType={questionType}
          variant="review"
          onRate={(rating, meta) => rateReview(current, rating, meta)}
        />
      </div>
    );
  }

  return (
    <FsrsSessionSummary
      results={results}
      pendingAfter={pendingAfter}
      moreCount={moreCount}
      retryOutcome={retryOutcome}
      isLoadingMore={isLoadingMore}
      onRetry={() => setRetry({ items: missedItems(results), index: 0, recalled: 0 })}
      onMore={onMore}
      onStop={onStop}
    />
  );
};

export default FsrsReviewSession;
