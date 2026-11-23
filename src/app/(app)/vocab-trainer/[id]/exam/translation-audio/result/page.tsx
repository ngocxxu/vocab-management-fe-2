'use client';

import { RefreshCircle } from '@solar-icons/react/ssr';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { reloadVocabTrainer } from '@/actions/vocab-trainers';
import { ExamErrorState } from '@/shared/ui/shared';
import ExamGradingFailed from '@/components/vocab-trainer/ExamGradingFailed';
import ReminderPromptDialog from '@/components/vocab-trainer/ReminderPromptDialog';
import TranslationAudioResults from '@/components/vocab-trainer/TranslationAudioResults';
import { useExamJobResult } from '@/hooks/useExamJobResult';
import { useRegradeExam } from '@/hooks/useRegradeExam';
import { useTrainerAfterJob } from '@/hooks/useTrainerAfterJob';
import { logger } from '@/libs/Logger';
import {
  clearCachedAudioEvaluation,
  readCachedAudioEvaluation,
  writeCachedAudioEvaluation,
} from '@/utils/exam-evaluation-cache';
import { replaceStoredJobId } from '@/utils/exam-regrade';
import { readJobPointer, resolveStoredAudioState } from '@/utils/exam-stored-result';
import type { TStoredAudioState } from '@/utils/exam-stored-result';
import { SOCKET_EVENTS } from '@/utils/socket-config';

type TAudioData = { transcript?: string; markdownReport?: string };

type TPageStored = { phase: 'loading' } | { phase: 'gone' } | TStoredAudioState;

const isAudioData = (data: unknown): data is TAudioData =>
  typeof data === 'object' && data !== null && (typeof (data as TAudioData).transcript === 'string' || typeof (data as TAudioData).markdownReport === 'string');

const readCached = (jobId: string) => {
  const cached = readCachedAudioEvaluation(jobId);
  return cached ? { data: { transcript: cached.transcript, markdownReport: cached.markdownReport }, completedAt: cached.completedAt } : null;
};

const writeCached = (jobId: string, data: TAudioData, completedAt: string) => {
  writeCachedAudioEvaluation({ jobId, status: 'completed', data, timestamp: completedAt });
};

const storageKeyOf = (trainerId: string) => `translation_audio_result_${trainerId}`;

const TranslationAudioResultPage: React.FC = () => {
  const t = useTranslations('trainer.evaluation');
  const params = useParams();
  const router = useRouter();
  const trainerId = params.id as string;
  const [stored, setStored] = useState<TPageStored>({ phase: 'loading' });
  const [timeElapsed, setTimeElapsed] = useState<number>(0);

  // Reads the result from the backend by trainer id. A job id from this browser is used only to wait for a live job.
  useEffect(() => {
    let cancelled = false;
    reloadVocabTrainer(trainerId)
      .then((outcome) => {
        if (cancelled) {
          return;
        }
        // The result itself comes from the trainer. The pointer only gives the job to wait for and the time it took.
        const pointer = readJobPointer(storageKeyOf(trainerId));
        setTimeElapsed(pointer.timeElapsed ?? 0);
        setStored(outcome.kind === 'gone' ? { phase: 'gone' } : resolveStoredAudioState(outcome.trainer, pointer.jobId));
      })
      .catch((error: unknown) => {
        logger.warn('Reading the stored result failed', { error, trainerId });
        if (!cancelled) {
          setStored({ phase: 'none' });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [trainerId]);

  // Only a job the backend says is still grading is waited for.
  const activeJobId = stored.phase === 'grading' ? stored.jobId : null;
  const { state: jobState, retry: retryJob } = useExamJobResult<TAudioData>({
    trainerId,
    jobId: activeJobId,
    socketEvent: SOCKET_EVENTS.AUDIO_EVALUATION_PROGRESS,
    isValid: isAudioData,
    readCached,
    writeCached,
  });
  // Once the job is done, the trainer is reloaded: a completed trainer is gone and the page goes back to the list.
  const afterJob = useTrainerAfterJob(trainerId, jobState.phase === 'completed');
  const isWaitingForTrainer = jobState.phase === 'completed' && (afterJob.phase === 'waiting' || afterJob.phase === 'gone');

  // A regrade is a new job: wait for it. Only the user's tap starts it (the failed screen calls this).
  const handleRegradeStarted = useCallback((newJobId: string) => {
    replaceStoredJobId(storageKeyOf(trainerId), newJobId);
    setStored({ phase: 'grading', jobId: newJobId });
    retryJob();
  }, [trainerId, retryJob]);
  const showsFailure = jobState.phase === 'failed' || stored.phase === 'failed';
  const regrade = useRegradeExam({ trainerId, active: showsFailure, onStarted: handleRegradeStarted });

  const handleBackToTrainers = useCallback(() => {
    localStorage.removeItem(storageKeyOf(trainerId));
    if (activeJobId) {
      clearCachedAudioEvaluation(activeJobId);
    }
    router.push('/vocab-trainer');
  }, [trainerId, activeJobId, router]);

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
              {t('audioTitle')}
            </h2>
            <p className="text-muted-foreground">
              {t('wait')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (jobState.phase === 'completed' && jobState.data) {
    return (
      <div className="min-h-full bg-background">
        <TranslationAudioResults
          trainerId={trainerId}
          transcript={jobState.data.transcript}
          markdownReport={jobState.data.markdownReport}
          timeElapsed={timeElapsed}
          onBackToTrainers={handleBackToTrainers}
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
        <TranslationAudioResults
          trainerId={trainerId}
          transcript={stored.result.transcript}
          markdownReport={stored.result.markdownReport}
          onBackToTrainers={handleBackToTrainers}
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

export default TranslationAudioResultPage;
