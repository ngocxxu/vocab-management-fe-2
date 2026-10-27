'use client';

import type { TFsrsReviewResult } from '@/types/vocab-trainer';
import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';
import { EFsrsRating } from '@/enum/vocab-trainer';
import { countRatings, FSRS_RATING_LABEL_KEYS, FSRS_RATINGS, missedItems } from '@/utils/fsrs-review';

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
  const t = useTranslations('trainer.fsrs');
  const counts = countRatings(results);
  const missed = missedItems(results).length;

  return (
    <div className="w-full space-y-6 text-center">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">{t('summary.complete')}</h2>
        <p className="text-muted-foreground">
          {t('summary.answered', { count: results.length })}
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label={t('summary.yourAnswers')}>
        {FSRS_RATINGS.map(rating => (
          <li key={rating} className={`rounded-xl p-3 ${RATING_CHIP_CLASSES[rating]}`}>
            <span className="block text-2xl font-bold">{counts[rating]}</span>
            <span className="text-xs font-medium">{t(FSRS_RATING_LABEL_KEYS[rating])}</span>
          </li>
        ))}
      </ul>

      {retryOutcome && (
        <p className="rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground">
          {t.rich('summary.retryOutcome', {
            recalled: retryOutcome.recalled,
            total: retryOutcome.total,
            strong: chunks => <span className="font-semibold text-foreground">{chunks}</span>,
          })}
        </p>
      )}

      {pendingAfter > 0 && (
        <p className="text-sm text-muted-foreground">
          {t('summary.pendingAfter', { count: pendingAfter })}
        </p>
      )}

      <div className="flex flex-col justify-center gap-2 sm:flex-row">
        {missed > 0 && !retryOutcome && (
          <Button type="button" variant="outline" onClick={onRetry}>
            {t('summary.retry', { count: missed })}
          </Button>
        )}
        {pendingAfter > 0 && (
          <Button type="button" onClick={onMore} disabled={isLoadingMore}>
            {t('summary.reviewMore', { count: moreCount })}
          </Button>
        )}
        <Button type="button" variant={pendingAfter > 0 ? 'outline' : 'default'} onClick={onStop}>
          {t('summary.stopToday')}
        </Button>
      </div>
    </div>
  );
};

export default FsrsSessionSummary;
