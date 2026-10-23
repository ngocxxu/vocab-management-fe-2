'use client';

import { EQuestionType } from '@/enum/vocab-trainer';
import type { TExamResult, TExamSubmitResponse } from '@/types/vocab-trainer';
import { RefreshCircle } from '@solar-icons/react/ssr';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ExamErrorState } from '@/shared/ui/shared';
import ExamResults from '@/components/vocab-trainer/ExamResults';
import { useExamJobResult } from '@/hooks/useExamJobResult';
import {
  clearCachedFillInBlankEvaluation,
  readCachedFillInBlankEvaluation,
  writeCachedFillInBlankEvaluation,
} from '@/utils/exam-evaluation-cache';
import { SOCKET_EVENTS } from '@/utils/socket-config';

type TFillInBlankData = { results: TExamResult[] };

const isFillInBlankData = (data: unknown): data is TFillInBlankData =>
  typeof data === 'object' && data !== null && Array.isArray((data as TFillInBlankData).results) && (data as TFillInBlankData).results.length > 0;

const readCached = (jobId: string) => {
  const cached = readCachedFillInBlankEvaluation(jobId);
  return cached ? { data: { results: cached.results.results }, completedAt: cached.completedAt } : null;
};

const writeCached = (jobId: string, data: TFillInBlankData, completedAt: string) => {
  writeCachedFillInBlankEvaluation({ jobId, status: 'completed', data, timestamp: completedAt });
};

const FillInBlankResultPage: React.FC = () => {
  const t = useTranslations('trainer.evaluation');
  const params = useParams();
  const router = useRouter();
  const trainerId = params.id as string;
  const [jobId, setJobId] = useState<string | null>(null);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Map<number, string>>(() => new Map());

  const { state, retry } = useExamJobResult<TFillInBlankData>({
    trainerId,
    jobId,
    socketEvent: SOCKET_EVENTS.FILL_IN_BLANK_EVALUATION_PROGRESS,
    isValid: isFillInBlankData,
    readCached,
    writeCached,
  });

  const loadResultData = useCallback(() => {
    const storageKey = `fill_in_blank_result_${trainerId}`;
    const cachedData = localStorage.getItem(storageKey);

    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        if (typeof parsedData.jobId !== 'string') {
          // Nothing to wait for: treat it like unreadable data instead of spinning forever.
          localStorage.removeItem(storageKey);
          router.push('/vocab-trainer');
          return;
        }
        setJobId(parsedData.jobId);
        setTimeElapsed(parsedData.timeElapsed || 0);

        if (parsedData.questions) {
          setQuestions(parsedData.questions);
        }

        if (parsedData.answers && Array.isArray(parsedData.answers)) {
          const answersMap = new Map<number, string>();
          parsedData.answers.forEach(([index, answer]: [number, string]) => {
            answersMap.set(index, answer);
          });
          setSelectedAnswers(answersMap);
        }
      } catch (err) {
        console.error('Failed to parse result data:', err);
        localStorage.removeItem(storageKey);
        router.push('/vocab-trainer');
      }
    } else {
      router.push('/vocab-trainer');
    }
  }, [trainerId, router]);

  useEffect(() => {
    loadResultData();
  }, [loadResultData]);

  const evaluationResults = useMemo<TExamSubmitResponse | null>(
    () => (state.data ? { status: 'completed', results: state.data.results } : null),
    [state.data],
  );

  const handleBackToTrainers = () => {
    const storageKey = `fill_in_blank_result_${trainerId}`;
    localStorage.removeItem(storageKey);
    if (jobId) {
      clearCachedFillInBlankEvaluation(jobId);
    }
    router.push('/vocab-trainer');
  };

  if (state.phase === 'loading') {
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

  if (state.phase === 'timeout') {
    return (
      <ExamErrorState
        error={t('timeout')}
        onBackToTrainers={handleBackToTrainers}
        onRetry={retry}
        retryLabel={t('checkAgain')}
        variant="fullscreen"
      />
    );
  }

  if (evaluationResults && questions.length > 0) {
    return (
      <div className="min-h-full bg-background">
        <ExamResults
          trainerId={trainerId}
          results={evaluationResults}
          questions={questions}
          selectedAnswers={selectedAnswers}
          timeElapsed={timeElapsed}
          onBackToTrainers={handleBackToTrainers}
          jobId={jobId ?? undefined}
          completedAt={state.completedAt}
          onRetryExam={() => router.push(`/vocab-trainer/${trainerId}/exam/fill-in-blank`)}
          questionType={EQuestionType.FILL_IN_THE_BLANK}
        />
      </div>
    );
  }

  return (
    <ExamErrorState
      error={state.error || t('failed')}
      onBackToTrainers={handleBackToTrainers}
      variant="fullscreen"
    />
  );
};

export default FillInBlankResultPage;
