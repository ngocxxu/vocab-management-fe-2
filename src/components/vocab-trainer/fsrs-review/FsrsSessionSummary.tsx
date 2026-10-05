'use client';

import type { TFsrsReviewResult } from '@/types/vocab-trainer';
import React from 'react';
import { Button } from '@/shared/ui/button';
import { EFsrsRating } from '@/enum/vocab-trainer';
import { countRatings, FSRS_RATING_LABELS, FSRS_RATINGS, missedItems } from '@/utils/fsrs-review';

type FsrsSessionSummaryProps = Readonly<{
  results: readonly TFsrsReviewResult[];
  /** Questions that did not fit in this session and wait for the next one. */
  pendingAfter: number;
  /** How many more a "review more" round would bring in. */
  moreCount: number;
  /** Set once the optional retry round is done. */
  retryOutcome: { recalled: number; total: number } | null;
  isLoadingMore: boolean;
  onRetry: () => void;
  onMore: () => void;
  onStop: () => void;
}>;

const RATING_CHIP_CLASSES: Record<EFsrsRating, string> = {
  [EFsrsRating.AGAIN]: 'bg-destructive/10 text-destructive',
  [EFsrsRating.HARD]: 'bg-warning/20 text-warning-foreground',
  [EFsrsRating.GOOD]: 'bg-success/15 text-success',
  [EFsrsRating.EASY]: 'bg-primary/15 text-primary',
};

const FsrsSessionSummary: React.FC<FsrsSessionSummaryProps> = ({ results, pendingAfter, moreCount, retryOutcome, isLoadingMore, onRetry, onMore, onStop }) => {
  const counts = countRatings(results);
  const missed = missedItems(results).length;

  return (
    <div className="mx-auto w-full max-w-xl space-y-6 text-center">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Session complete</h2>
        <p className="text-muted-foreground">
          You answered
          {' '}
          {results.length}
          {' '}
          {results.length === 1 ? 'question' : 'questions'}
          . Each one is already scheduled for its next review.
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Your answers">
        {FSRS_RATINGS.map(rating => (
          <li key={rating} className={`rounded-xl p-3 ${RATING_CHIP_CLASSES[rating]}`}>
            <span className="block text-2xl font-bold">{counts[rating]}</span>
            <span className="text-xs font-medium">{FSRS_RATING_LABELS[rating]}</span>
          </li>
        ))}
      </ul>

      {retryOutcome && (
        <p className="rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground">
          This time you remembered
          {' '}
          <span className="font-semibold text-foreground">
            {retryOutcome.recalled}
            {' '}
            of
            {' '}
            {retryOutcome.total}
          </span>
          . The retry round is only practice: it was not saved and your schedule did not change.
        </p>
      )}

      {pendingAfter > 0 && (
        <p className="text-sm text-muted-foreground">
          {pendingAfter}
          {' '}
          {pendingAfter === 1 ? 'question waits' : 'questions wait'}
          {' '}
          for later sessions.
        </p>
      )}

      <div className="flex flex-col justify-center gap-2 sm:flex-row">
        {missed > 0 && !retryOutcome && (
          <Button type="button" variant="outline" onClick={onRetry}>
            Retry
            {' '}
            {missed}
            {' '}
            missed (practice only)
          </Button>
        )}
        {pendingAfter > 0 && (
          <Button type="button" onClick={onMore} disabled={isLoadingMore}>
            Review
            {' '}
            {moreCount}
            {' '}
            more
          </Button>
        )}
        <Button type="button" variant={pendingAfter > 0 ? 'outline' : 'default'} onClick={onStop}>
          Stop for today
        </Button>
      </div>
    </div>
  );
};

export default FsrsSessionSummary;
