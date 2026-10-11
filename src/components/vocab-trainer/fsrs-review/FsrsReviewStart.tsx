'use client';

import type { TFsrsReviewSummary } from '@/types/vocab-trainer';
import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { cn } from '@/libs/utils';
import { DEFAULT_SESSION_SIZE, estimateMinutes, isBacklog, REVIEW_AHEAD_DAYS, SESSION_SIZES } from '@/utils/fsrs-review';

type FsrsReviewStartProps = Readonly<{
  trainerName: string;
  summary: TFsrsReviewSummary;
  isLoading: boolean;
  /** `ahead` is the number of days after today whose cards are brought forward. */
  onStart: (limit: number, ahead: number) => void;
}>;

function Count({ label, value }: Readonly<{ label: string; value: number }>) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-center">
      <p className="text-3xl font-bold text-foreground">{value}</p>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

const FsrsReviewStart: React.FC<FsrsReviewStartProps> = ({ trainerName, summary, isLoading, onStart }) => {
  const t = useTranslations('trainer.fsrs');
  const locale = useLocale();
  const [size, setSize] = useState<number>(DEFAULT_SESSION_SIZE);
  const available = summary.overdue + summary.dueToday + summary.newAvailable;
  const sessionCount = Math.min(size, available);

  if (summary.ended) {
    return (
      <div className="mx-auto w-full max-w-xl space-y-4 text-center">
        <h1 className="text-2xl font-bold text-foreground">{trainerName}</h1>
        <Alert>
          <AlertTitle>{t('start.endedTitle')}</AlertTitle>
          <AlertDescription>
            {summary.endsAt
              ? t('start.endedBodyWithDate', { date: new Date(summary.endsAt).toLocaleDateString(locale) })
              : t('start.endedBody')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold text-foreground">{trainerName}</h1>
        <p className="text-muted-foreground">{t('start.shortSessions')}</p>
      </div>

      {isBacklog(summary.overdue) && (
        <Alert>
          <AlertTitle>{t('start.welcomeBack')}</AlertTitle>
          <AlertDescription>
            {t('start.backlogBody', { count: summary.overdue })}
            {summary.estimatedDaysToClearBacklog > 0 && ` ${t('start.backlogPace', { size, days: summary.estimatedDaysToClearBacklog })}`}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-3 gap-2">
        <Count label={t('start.overdue')} value={summary.overdue} />
        <Count label={t('start.dueToday')} value={summary.dueToday} />
        <Count label={t('start.newToLearn')} value={summary.newAvailable} />
      </div>

      {available === 0
        ? <p className="text-center text-muted-foreground">{t('start.allCaughtUp')}</p>
        : (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground" id="session-size-label">{t('start.sessionSize')}</p>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="session-size-label">
                {SESSION_SIZES.map(option => (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={size === option}
                    onClick={() => setSize(option)}
                    className={cn(
                      'rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                      size === option ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-foreground hover:bg-muted',
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <Button type="button" size="lg" className="w-full" disabled={isLoading} onClick={() => onStart(size, 0)}>
                {t('start.startSession', { count: sessionCount, minutes: estimateMinutes(sessionCount) })}
              </Button>
              {available > sessionCount && (
                <p className="text-center text-sm text-muted-foreground">
                  {t('start.waiting', { count: available - sessionCount })}
                </p>
              )}
            </div>
          )}

      <Button type="button" variant="outline" className="w-full" disabled={isLoading} onClick={() => onStart(size, REVIEW_AHEAD_DAYS)}>
        {t('start.reviewAhead', { days: REVIEW_AHEAD_DAYS })}
      </Button>
    </div>
  );
};

export default FsrsReviewStart;
