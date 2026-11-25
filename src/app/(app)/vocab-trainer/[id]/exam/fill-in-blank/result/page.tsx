'use client';

import { EQuestionType } from '@/enum/vocab-trainer';
import type { TExamResult } from '@/types/vocab-trainer';
import { RefreshCircle } from '@solar-icons/react/ssr';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { reloadVocabTrainer } from '@/actions/vocab-trainers';
import { logger } from '@/libs/Logger';
import { ExamErrorState } from '@/shared/ui/shared';
import ExamResults from '@/components/vocab-trainer/ExamResults';
import ExamGradingFailed from '@/components/vocab-trainer/ExamGradingFailed';
import ReminderPromptDialog from '@/components/vocab-trainer/ReminderPromptDialog';
import { useExamJobResult } from '@/hooks/useExamJobResult';
import { useRegradeExam } from '@/hooks/useRegradeExam';
import { useTrainerAfterJob } from '@/hooks/useTrainerAfterJob';
import {
  clearCachedFillInBlankEvaluation,
  readCachedFillInBlankEvaluation,
  writeCachedFillInBlankEvaluation,
} from '@/utils/exam-evaluation-cache';
import { replaceStoredJobId } from '@/utils/exam-regrade';
import {
  readJobPointer,
  resolveStoredFillInBlankState,
  toStoredFillInBlankRows,
} from '@/utils/exam-stored-result';
import type { TStoredFillInBlankRow, TStoredFillInBlankState } from '@/utils/exam-stored-result';
import { SOCKET_EVENTS } from '@/utils/socket-config';

type TFillInBlankData = { results: TExamResult[] };

type TPageStored = { phase: 'loading' } | { phase: 'gone' } | TStoredFillInBlankState;

const isFillInBlankData = (data: unknown): data is TFillInBlankData =>
  typeof data === 'object' && data !== null && Array.isArray((data as TFillInBlankData).results) && (data as TFillInBlankData).results.length > 0;

const readCached = (jobId: string) => {
  const cached = readCachedFillInBlankEvaluation(jobId);
  return cached ? { data: { results: cached.results.results }, completedAt: cached.completedAt } : null;
};

const writeCached = (jobId: string, data: TFillInBlankData, completedAt: string) => {
  writeCachedFillInBlankEvaluation({ jobId, status: 'completed', data, timestamp: completedAt });
};

const storageKeyOf = (trainerId: string) => `fill_in_blank_result_${trainerId}`;

const NO_SELECTED_ANSWERS = new Map<number, string>();

/** Job results carry no question text. The stored rows have it, so the page reads them from the trainer after the job. */
const liveRowsOf = (results: TExamResult[]): TStoredFillInBlankRow[] =>
  results.map(result => ({
    status: result.status,
    userSelected: result.userSelected,
    systemSelected: result.systemSelected,
    explanation: result.data?.explanation,
    content: null,
  }));

type TFillInBlankResultsProps = {
  trainerId: string;
  rows: TStoredFillInBlankRow[];
  timeElapsed: number | null;
  completedAt?: string;
  jobId?: string;
  onBackToTrainers: () => void;
  onRetryExam: () => void;
};

const FillInBlankResults: React.FC<TFillInBlankResultsProps> = ({ trainerId, rows, timeElapsed, completedAt, jobId, onBackToTrainers, onRetryExam }) => (
  <ExamResults
    trainerId={trainerId}
    results={{
      status: 'completed',
      results: rows.map(row => ({
        status: row.status,
        userSelected: row.userSelected,
        systemSelected: row.systemSelected,
        data: { explanation: row.explanation },
      })),
    }}
    questions={rows.map(row => ({ id: row.id, content: row.content, correctAnswer: row.systemSelected }))}
    selectedAnswers={NO_SELECTED_ANSWERS}
    timeElapsed={timeElapsed}
    onBackToTrainers={onBackToTrainers}
    jobId={jobId}
    completedAt={completedAt}
    onRetryExam={onRetryExam}
    questionType={EQuestionType.FILL_IN_THE_BLANK}
  />
);

const FillInBlankResultPage: React.FC = () => {
  const t = useTranslations('trainer.evaluation');
  const params = useParams();
  const router = useRouter();
  const trainerId = params.id as string;
  const storageKey = storageKeyOf(trainerId);
  const [stored, setStored] = useState<TPageStored>({ phase: 'loading' });
  const [timeElapsed, setTimeElapsed] = useState<number | null>(null);

  // Reads the result from the backend by trainer id. The job id saved in this browser only tells the page which job to wait for.
  useEffect(() => {
    let cancelled = false;
    reloadVocabTrainer(trainerId)
      .then((outcome) => {
        if (cancelled) {
          return;
        }
        const pointer = readJobPointer(storageKey);
        setTimeElapsed(pointer.timeElapsed);
        setStored(outcome.kind === 'gone' ? { phase: 'gone' } : resolveStoredFillInBlankState(outcome.trainer, pointer.jobId));
      })
      .catch((error: unknown) => {
        logger.warn('Reading the stored result failed', { error, trainerId });
        if (!cancelled) {
          // The trainer could not be read. If this browser started a job, keep waiting for it.
          const pointer = readJobPointer(storageKey);
          setTimeElapsed(pointer.timeElapsed);
          setStored(pointer.jobId ? { phase: 'grading', jobId: pointer.jobId } : { phase: 'none' });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [trainerId, storageKey]);

  // Only a job the backend says is still grading is waited for.
  const activeJobId = stored.phase === 'grading' ? stored.jobId : null;
  const { state: jobState, retry: retryJob } = useExamJobResult<TFillInBlankData>({
    trainerId,
    jobId: activeJobId,
    socketEvent: SOCKET_EVENTS.FILL_IN_BLANK_EVALUATION_PROGRESS,
    isValid: isFillInBlankData,
    readCached,
    writeCached,
  });
  // Once the job is done, the trainer is reloaded: a completed trainer is gone and the page goes back to the list.
  const afterJob = useTrainerAfterJob(trainerId, jobState.phase === 'completed');
  const isWaitingForTrainer = jobState.phase === 'completed' && afterJob.phase === 'waiting';

  // A regrade is a new job: wait for it. Only the user's tap starts it (the failed screen calls this).
  const showsFailure = jobState.phase === 'failed' || stored.phase === 'failed';
  const handleRegradeStarted = useCallback((newJobId: string) => {
    replaceStoredJobId(storageKey, newJobId);
    setStored({ phase: 'grading', jobId: newJobId });
    retryJob();
  }, [storageKey, retryJob]);
  const regrade = useRegradeExam({ trainerId, active: showsFailure, onStarted: handleRegradeStarted });

  const handleBackToTrainers = useCallback(() => {
    localStorage.removeItem(storageKey);
    if (activeJobId) {
      clearCachedFillInBlankEvaluation(activeJobId);
    }
    router.push('/vocab-trainer');
  }, [storageKey, activeJobId, router]);

  const handleRetryExam = useCallback(() => {
    router.push(`/vocab-trainer/${trainerId}/exam/fill-in-blank`);
  }, [router, trainerId]);

  // A 404 means the trainer is gone (done, or deleted): leave without an error.
  const isGone = stored.phase === 'gone' || afterJob.phase === 'gone';
  useEffect(() => {
    if (isGone) {
      handleBackToTrainers();
    }
  }, [isGone, handleBackToTrainers]);

  const isWaitingForJob = stored.phase === 'grading' && activeJobId !== null && jobState.phase === 'loading';
  if (stored.phase === 'loading' || isWaitingForTrainer || isGone || isWaitingForJob) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="space-y-6 text-center">
          <RefreshCircle size={64} weight="BoldDuotone" className="mx-auto animate-spin text-primary" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              {t('fillInTitle')}
            </h2>
            <p className="text-muted-foreground">
              {t('wait')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // The job just finished. The rows come from the trainer. If that reload failed, the job's own results show, without question text.
  if (jobState.phase === 'completed' && jobState.data) {
    const rows = toStoredFillInBlankRows(afterJob.trainer?.results);
    return (
      <div className="min-h-full bg-background">
        <FillInBlankResults
          trainerId={trainerId}
          rows={rows.length > 0 ? rows : liveRowsOf(jobState.data.results)}
          timeElapsed={timeElapsed}
          completedAt={jobState.completedAt}
          jobId={activeJobId ?? undefined}
          onBackToTrainers={handleBackToTrainers}
          onRetryExam={handleRetryExam}
        />
        {afterJob.isPromptOpen && afterJob.trainer && (
          <ReminderPromptDialog
            trainer={afterJob.trainer}
            open
            onOpenChange={(open) => {
              if (!open) {
                afterJob.dismissPrompt();
              }
            }}
            onAnswered={afterJob.onTrainerChange}
          />
        )}
      </div>
    );
  }

  if (stored.phase === 'graded') {
    return (
      <div className="min-h-full bg-background">
        <FillInBlankResults
          trainerId={trainerId}
          rows={stored.rows}
          timeElapsed={timeElapsed}
          completedAt={stored.completedAt}
          onBackToTrainers={handleBackToTrainers}
          onRetryExam={handleRetryExam}
        />
      </div>
    );
  }

  if (showsFailure) {
    return (
      <ExamGradingFailed
        error={jobState.error || t('failed')}
        regrade={regrade}
        onBackToTrainers={handleBackToTrainers}
      />
    );
  }

  // Still grading, but this browser has no job to wait for, or the wait ran out. Not an error: check the list later.
  if (jobState.phase === 'timeout' || (stored.phase === 'grading' && !activeJobId)) {
    return (
      <ExamErrorState
        error={t('timeout')}
        tone="info"
        onRetry={activeJobId ? retryJob : undefined}
        retryLabel={t('checkAgain')}
        onBackToTrainers={handleBackToTrainers}
        variant="fullscreen"
      />
    );
  }

  return (
    <ExamErrorState
      error={t('noResult')}
      onBackToTrainers={handleBackToTrainers}
      variant="fullscreen"
    />
  );
};

export default FillInBlankResultPage;
