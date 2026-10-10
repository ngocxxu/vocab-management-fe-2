'use client';

import type { TFsrsReviewSummary } from '@/types/vocab-trainer';
import React, { useState } from 'react';
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
  const [size, setSize] = useState<number>(DEFAULT_SESSION_SIZE);
  const available = summary.overdue + summary.dueToday + summary.newAvailable;
  const sessionCount = Math.min(size, available);

  if (summary.ended) {
    return (
      <div className="mx-auto w-full max-w-xl space-y-4 text-center">
        <h1 className="text-2xl font-bold text-foreground">{trainerName}</h1>
        <Alert>
          <AlertTitle>This cycle has ended</AlertTitle>
          <AlertDescription>
            {summary.endsAt ? `The deadline was ${new Date(summary.endsAt).toLocaleDateString()}. ` : ''}
            Nothing is scheduled anymore and your progress is kept. Extend the deadline in the trainer settings, or start a new trainer to learn these words again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold text-foreground">{trainerName}</h1>
        <p className="text-muted-foreground">Short sessions work better than long ones.</p>
      </div>

      {isBacklog(summary.overdue) && (
        <Alert>
          <AlertTitle>Welcome back!</AlertTitle>
          <AlertDescription>
            {summary.overdue}
            {' '}
            questions are overdue. That is normal after a break, so there is no need to rush.
            {summary.estimatedDaysToClearBacklog > 0 && ` At ${size} questions a day you will be caught up in about ${summary.estimatedDaysToClearBacklog} ${summary.estimatedDaysToClearBacklog === 1 ? 'day' : 'days'}.`}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-3 gap-2">
        <Count label="Overdue" value={summary.overdue} />
        <Count label="Due today" value={summary.dueToday} />
        <Count label="New to learn" value={summary.newAvailable} />
      </div>

      {available === 0
        ? <p className="text-center text-muted-foreground">You are all caught up. Come back later, or look ahead below.</p>
        : (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground" id="session-size-label">Questions in this session</p>
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
                Start
                {' '}
                {sessionCount}
                {' '}
                {sessionCount === 1 ? 'question' : 'questions'}
                {' '}
                (about
                {' '}
                {estimateMinutes(sessionCount)}
                {' '}
                min)
              </Button>
              {available > sessionCount && (
                <p className="text-center text-sm text-muted-foreground">
                  {available - sessionCount}
                  {' '}
                  {available - sessionCount === 1 ? 'question waits' : 'questions wait'}
                  {' '}
                  for later sessions.
                </p>
              )}
            </div>
          )}

      <Button type="button" variant="outline" className="w-full" disabled={isLoading} onClick={() => onStart(size, REVIEW_AHEAD_DAYS)}>
        Review the next
        {' '}
        {REVIEW_AHEAD_DAYS}
        {' '}
        days
      </Button>
    </div>
  );
};

export default FsrsReviewStart;
