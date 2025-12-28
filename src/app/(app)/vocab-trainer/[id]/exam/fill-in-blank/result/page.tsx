'use client';

import type { TExamSubmitResponse, TFillInBlankEvaluationProgress } from '@/types/vocab-trainer';
import { Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { ExamErrorState } from '@/components/shared';
import ExamResults from '@/components/vocab-trainer/ExamResults';
import { useSocket } from '@/hooks/useSocket';
import { SOCKET_EVENTS } from '@/utils/socket-config';

const FillInBlankResultPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const trainerId = params.id as string;
  const { socket, isConnected } = useSocket();
  const [jobId, setJobId] = useState<string | null>(null);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evaluationResults, setEvaluationResults] = useState<TExamSubmitResponse | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Map<number, string>>(() => new Map());

  const loadResultData = useCallback(() => {
    const storageKey = `fill_in_blank_result_${trainerId}`;
    const cachedData = localStorage.getItem(storageKey);

    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
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

  useEffect(() => {
    if (!socket || !jobId || !isConnected) {
      return;
    }

    const handleFillInBlankEvaluationProgress = (data: TFillInBlankEvaluationProgress) => {
      const currentJobId = String(jobId);
      const eventJobId = String(data.jobId);

      if (eventJobId !== currentJobId) {
        return;
      }

      if (data.status === 'evaluating') {
        setIsLoading(true);
        setError(null);
      } else if (data.status === 'completed') {
        if (data.data?.results) {
          const results: TExamSubmitResponse = {
            status: 'completed',
            results: data.data.results,
          };
          setEvaluationResults(results);
        }
        setIsLoading(false);
      } else if (data.status === 'failed') {
        setError(data.data?.error || 'Evaluation failed');
        setIsLoading(false);
      }
    };

    socket.on(SOCKET_EVENTS.FILL_IN_BLANK_EVALUATION_PROGRESS, handleFillInBlankEvaluationProgress);

    return () => {
      socket.off(SOCKET_EVENTS.FILL_IN_BLANK_EVALUATION_PROGRESS, handleFillInBlankEvaluationProgress);
    };
  }, [socket, jobId, isConnected]);

  const handleBackToTrainers = () => {
    const storageKey = `fill_in_blank_result_${trainerId}`;
    localStorage.removeItem(storageKey);
    router.push('/vocab-trainer');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="space-y-6 text-center">
          <Loader2 className="mx-auto h-16 w-16 animate-spin text-yellow-600 dark:text-yellow-400" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Evaluating answers with AI...
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

  if (evaluationResults && questions.length > 0) {
    return (
      <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <ExamResults
          trainerId={trainerId}
          results={evaluationResults}
          questions={questions}
          selectedAnswers={selectedAnswers}
          timeElapsed={timeElapsed}
          onBackToTrainers={handleBackToTrainers}
        />
      </div>
    );
  }

  return null;
};

export default FillInBlankResultPage;
