'use client';

import { RefreshCircle } from '@solar-icons/react/ssr';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { ExamErrorState } from '@/shared/ui/shared';
import TranslationAudioResults from '@/components/vocab-trainer/TranslationAudioResults';
import { useExamJobResult } from '@/hooks/useExamJobResult';
import {
  clearCachedAudioEvaluation,
  readCachedAudioEvaluation,
  writeCachedAudioEvaluation,
} from '@/utils/exam-evaluation-cache';
import { SOCKET_EVENTS } from '@/utils/socket-config';

type TAudioData = { transcript?: string; markdownReport?: string };

const isAudioData = (data: unknown): data is TAudioData =>
  typeof data === 'object' && data !== null && (typeof (data as TAudioData).transcript === 'string' || typeof (data as TAudioData).markdownReport === 'string');

const readCached = (jobId: string) => {
  const cached = readCachedAudioEvaluation(jobId);
  return cached ? { data: { transcript: cached.transcript, markdownReport: cached.markdownReport }, completedAt: cached.completedAt } : null;
};

const writeCached = (jobId: string, data: TAudioData, completedAt: string) => {
  writeCachedAudioEvaluation({ jobId, status: 'completed', data, timestamp: completedAt });
};

const TranslationAudioResultPage: React.FC = () => {
  const t = useTranslations('trainer.evaluation');
  const params = useParams();
  const router = useRouter();
  const trainerId = params.id as string;
  const [jobId, setJobId] = useState<string | null>(null);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);

  const { state, retry } = useExamJobResult<TAudioData>({
    trainerId,
    jobId,
    socketEvent: SOCKET_EVENTS.AUDIO_EVALUATION_PROGRESS,
    isValid: isAudioData,
    readCached,
    writeCached,
  });

  const loadResultData = useCallback(() => {
    const storageKey = `translation_audio_result_${trainerId}`;
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

  const handleBackToTrainers = () => {
    const storageKey = `translation_audio_result_${trainerId}`;
    localStorage.removeItem(storageKey);
    if (jobId) {
      clearCachedAudioEvaluation(jobId);
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

  if (state.phase === 'completed' && state.data) {
    return (
      <div className="min-h-full bg-background">
        <TranslationAudioResults
          trainerId={trainerId}
          transcript={state.data.transcript}
          markdownReport={state.data.markdownReport}
          timeElapsed={timeElapsed}
          onBackToTrainers={handleBackToTrainers}
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

export default TranslationAudioResultPage;
