'use client';

import type { TFsrsReviewSummary, TVocabTrainer } from '@/types/vocab-trainer';
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getReviewSummary } from '@/actions/vocab-trainers';
import { deadlineStatus, isCycleEnded } from '@/utils/fsrs-review';

type FsrsTrainerStatusProps = Readonly<{
  trainer: TVocabTrainer;
}>;

function Counts({ summary }: Readonly<{ summary: TFsrsReviewSummary }>) {
  const t = useTranslations('trainer.fsrs.status');
  const waiting = summary.overdue + summary.dueToday + summary.newAvailable;
  if (waiting === 0) {
    return <span>{t('allCaughtUp')}</span>;
  }

  return (
    <>
      <span className={summary.overdue > 0 ? 'font-medium text-destructive' : undefined}>
        {t('overdue', { count: summary.overdue })}
      </span>
      <span aria-hidden="true">·</span>
      <span className={summary.dueToday > 0 ? 'font-medium text-warning-foreground' : undefined}>
        {t('today', { count: summary.dueToday })}
      </span>
      <span aria-hidden="true">·</span>
      <span>
        {t('new', { count: summary.newAvailable })}
      </span>
    </>
  );
}

/** What is waiting in a spaced repetition trainer, and how long the cycle still runs. */
const FsrsTrainerStatus: React.FC<FsrsTrainerStatusProps> = ({ trainer }) => {
  const t = useTranslations('trainer.fsrs');
  const [summary, setSummary] = useState<TFsrsReviewSummary | null>(null);
  const [failed, setFailed] = useState(false);
  const ended = isCycleEnded(trainer.fsrsEndsAt, new Date());
  const deadline = trainer.fsrsEndsAt && !ended ? deadlineStatus(trainer.fsrsEndsAt, new Date()) : null;

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
        {ended && <span className="font-medium text-foreground">{t('deadline.cycleEnded')}</span>}
        {!ended && summary && <Counts summary={summary} />}
        {!ended && !summary && !failed && <span className="inline-block h-3 w-40 animate-pulse rounded bg-muted" aria-label={t('status.loading')} />}
        {!ended && failed && <span>{t('status.countsUnavailable')}</span>}
      </p>
      {deadline && (
        <p>
          {deadline.key === 'daysLeft'
            ? t('deadline.daysLeft', { days: deadline.days })
            : t(`deadline.${deadline.key}`)}
        </p>
      )}
    </div>
  );
};

export default FsrsTrainerStatus;
