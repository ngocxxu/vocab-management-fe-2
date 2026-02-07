'use client';

import { RefreshCircle } from '@solar-icons/react/ssr';
import { useParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { ExamErrorState } from '@/components/shared';
import TranslationAudioResults from '@/components/vocab-trainer/TranslationAudioResults';
import { useSocket } from '@/hooks/useSocket';
import { SOCKET_EVENTS } from '@/utils/socket-config';

const TranslationAudioResultPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const trainerId = params.id as string;
  const { socket } = useSocket();
  const [jobId, setJobId] = useState<string | null>(null);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<{
    transcript?: string;
    markdownReport?: string;
    error?: string;
  } | null>(null);

  const loadResultData = useCallback(() => {
    const storageKey = `translation_audio_result_${trainerId}`;
    const cachedData = localStorage.getItem(storageKey);

    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
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

  useEffect(() => {
    if (!socket || !jobId) {
      return;
    }

    const handleAudioEvaluationProgress = (data: {
      jobId: string;
      status: 'evaluating' | 'completed' | 'failed';
      data?: {
        transcript?: string;
        markdownReport?: string;
        error?: string;
      };
      timestamp: string;
    }) => {
      const currentJobId = String(jobId);
      const eventJobId = String(data.jobId);

      if (eventJobId !== currentJobId) {
        return;
      }

      if (data.status === 'evaluating') {
        setIsLoading(true);
        setError(null);
      } else if (data.status === 'completed') {
        setEvaluationResult({
          transcript: data.data?.transcript,
          markdownReport: data.data?.markdownReport,
        });
        setIsLoading(false);
      } else if (data.status === 'failed') {
        setError(data.data?.error || 'Evaluation failed');
        setIsLoading(false);
      }
    };

    socket.on(SOCKET_EVENTS.AUDIO_EVALUATION_PROGRESS, handleAudioEvaluationProgress);

    return () => {
      socket.off(SOCKET_EVENTS.AUDIO_EVALUATION_PROGRESS, handleAudioEvaluationProgress);
    };
  }, [socket, jobId]);

  const handleBackToTrainers = () => {
    const storageKey = `translation_audio_result_${trainerId}`;
    localStorage.removeItem(storageKey);
    router.push('/vocab-trainer');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="space-y-6 text-center">
          <RefreshCircle size={64} weight="BoldDuotone" className="mx-auto animate-spin text-yellow-600 dark:text-yellow-400" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Evaluating your translation...
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              This may take a few moments. Please wait.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ExamErrorState
        error={error}
        onBackToTrainers={handleBackToTrainers}
        variant="fullscreen"
      />
    );
  }

  if (evaluationResult) {
    return (
      <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <TranslationAudioResults
          trainerId={trainerId}
          transcript={evaluationResult.transcript}
          markdownReport={evaluationResult.markdownReport}
          timeElapsed={timeElapsed}
          onBackToTrainers={handleBackToTrainers}
        />
      </div>
    );
  }

  return null;
};

export default TranslationAudioResultPage;
