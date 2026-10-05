'use client';

import type { TFsrsReviewSummary, TVocabTrainer } from '@/types/vocab-trainer';
import React, { useEffect, useState } from 'react';
import { getReviewSummary } from '@/actions/vocab-trainers';
import { formatDeadline, isCycleEnded } from '@/utils/fsrs-review';

type FsrsTrainerStatusProps = Readonly<{
  trainer: TVocabTrainer;
}>;

function Counts({ summary }: Readonly<{ summary: TFsrsReviewSummary }>) {
  const waiting = summary.overdue + summary.dueToday + summary.newAvailable;
  if (waiting === 0) {
    return <span>All caught up</span>;
  }

  return (
    <>
      <span className={summary.overdue > 0 ? 'font-medium text-destructive' : undefined}>
        {summary.overdue}
        {' '}
        overdue
      </span>
      <span aria-hidden="true">·</span>
      <span className={summary.dueToday > 0 ? 'font-medium text-warning-foreground' : undefined}>
        {summary.dueToday}
        {' '}
        today
      </span>
      <span aria-hidden="true">·</span>
      <span>
        {summary.newAvailable}
        {' '}
        new
      </span>
    </>
  );
}

/** What is waiting in a spaced repetition trainer, and how long the cycle still runs. */
const FsrsTrainerStatus: React.FC<FsrsTrainerStatusProps> = ({ trainer }) => {
  const [summary, setSummary] = useState<TFsrsReviewSummary | null>(null);
  const [failed, setFailed] = useState(false);
  const ended = isCycleEnded(trainer.fsrsEndsAt, new Date());

  useEffect(() => {
    let cancelled = false;
    getReviewSummary(trainer.id)
      .then((result) => {
        if (!cancelled) {
          setSummary(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [trainer.id]);

  return (
    <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
      <p className="flex flex-wrap items-center gap-x-1.5" aria-live="polite">
        {ended && <span className="font-medium text-foreground">Cycle ended</span>}
        {!ended && summary && <Counts summary={summary} />}
        {!ended && !summary && !failed && <span className="inline-block h-3 w-40 animate-pulse rounded bg-muted" aria-label="Loading" />}
        {!ended && failed && <span>Counts unavailable</span>}
      </p>
      {trainer.fsrsEndsAt && !ended && <p>{formatDeadline(trainer.fsrsEndsAt, new Date())}</p>}
    </div>
  );
};

export default FsrsTrainerStatus;
