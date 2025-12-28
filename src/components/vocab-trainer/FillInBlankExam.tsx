'use client';

import type { TFormTestVocabTrainerFillInBlank, TQuestionAPI, TWordTestInput } from '@/types/vocab-trainer';
import { CheckCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { submitExam } from '@/actions/vocab-trainers';
import { ExamErrorState } from '@/components/shared';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { logger } from '@/libs/Logger';
import FillInBlankCard from './FillInBlankCard';
import VocabExamHeader from './VocabExamHeader';

type FillInBlankExamProps = {
  trainerId: string;
  examData: TQuestionAPI;
};

type ExamState = 'taking' | 'submitting' | 'completed' | 'error';

const FillInBlankExam: React.FC<FillInBlankExamProps> = ({ trainerId, examData }) => {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Map<number, string>>(() => new Map());
  const [timeRemaining, setTimeRemaining] = useState(() => examData.setCountTime || 900);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [examState, setExamState] = useState<ExamState>('taking');
  const [error, setError] = useState<string | null>(null);

  const selectedAnswersRef = useRef(selectedAnswers);
  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);

  const questions = useMemo(() => examData.questionAnswers || [], [examData.questionAnswers]);
  const questionType = useMemo(() => examData.questionType || 'FILL_IN_THE_BLANK', [examData.questionType]);
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const canSubmit = Array.from({ length: totalQuestions }, (_, i) => selectedAnswers.get(i)?.trim() || '').every(answer => answer.length > 0);

  const handleAnswerSelect = useCallback((answer: string) => {
    setSelectedAnswers((prev) => {
      const newMap = new Map(prev);
      newMap.set(currentQuestionIndex, answer);
      return newMap;
    });
  }, [currentQuestionIndex]);

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = useCallback(async () => {
    const currentAnswers = selectedAnswersRef.current;
    const allAnswered = Array.from({ length: totalQuestions }, (_, i) => currentAnswers.get(i)?.trim() || '').every(answer => answer.length > 0);
    if (!allAnswered) {
      return;
    }

    setExamState('submitting');
    setError(null);

    try {
      const wordTestInputs: TWordTestInput[] = questions.map((question, index) => {
        const userAnswer = currentAnswers.get(index)?.trim() || '';
        return {
          userAnswer,
          systemAnswer: question.correctAnswer,
        };
      });

      const examSubmissionData: TFormTestVocabTrainerFillInBlank = {
        questionType,
        countTime: timeElapsed,
        wordTestInputs,
      };

      const result = await submitExam(trainerId, examSubmissionData as any);

      if (result && typeof result === 'object' && 'error' in result) {
        const errorMessage = result.error as string;
        setError(errorMessage || 'Failed to submit exam. Please try again.');
        setExamState('error');
        return;
      }

      let jobId: string | null = null;

      if (result && typeof result === 'object') {
        if ('jobId' in result && result.jobId) {
          jobId = result.jobId as string;
        } else if ('data' in result && result.data && typeof result.data === 'object' && 'jobId' in result.data) {
          jobId = result.data.jobId as string;
        } else if ('result' in result && result.result && typeof result.result === 'object' && 'jobId' in result.result) {
          jobId = result.result.jobId as string;
        }
      }

      if (jobId) {
        const resultData = { jobId, timeElapsed, questions, answers: Array.from(currentAnswers.entries()) };
        const storageKey = `fill_in_blank_result_${trainerId}`;
        localStorage.setItem(storageKey, JSON.stringify(resultData));
        router.push(`/vocab-trainer/${trainerId}/exam/fill-in-blank/result`);
      } else {
        logger.error('Response does not contain jobId:', { result, trainerId });
        setError('Failed to get evaluation job ID. The server response was invalid.');
        setExamState('error');
      }
    } catch (err: unknown) {
      logger.error('Failed to submit exam:', { error: err, trainerId });

      let errorMessage = 'Failed to submit exam. Please try again.';

      if (err && typeof err === 'object' && 'response' in err) {
        const apiError = err as { response?: { data?: unknown } };
        const responseData = apiError.response?.data;
        if (responseData && typeof responseData === 'object' && 'error' in responseData) {
          errorMessage = String(responseData.error);
        } else if (typeof responseData === 'string') {
          errorMessage = responseData;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setExamState('error');
    }
  }, [totalQuestions, questions, questionType, timeElapsed, trainerId, router]);

  const handleBackToTrainers = () => {
    router.push('/vocab-trainer');
  };

  useEffect(() => {
    if (examState !== 'taking') {
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [examState, handleSubmit]);

  if (examState === 'submitting') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="space-y-6 text-center">
          <Loader2 className="mx-auto h-16 w-16 animate-spin text-yellow-600 dark:text-yellow-400" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Submitting your exam...
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Please wait while we process your answers
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (examState === 'error') {
    return (
      <ExamErrorState
        error={error}
        onBackToTrainers={handleBackToTrainers}
        fallbackMessage="An error occurred while submitting the exam."
      />
    );
  }

  if (!currentQuestion) {
    return (
      <Alert>
        <AlertDescription>
          No questions available for this exam.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="relative space-y-8 py-8">
      <VocabExamHeader
        trainerName={examData.name || 'Vocabulary Exam'}
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={totalQuestions}
        timeRemaining={timeRemaining}
      />

      <FillInBlankCard
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        selectedAnswer={selectedAnswers.get(currentQuestionIndex) || null}
        onAnswerSelect={handleAnswerSelect}
      />

      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstQuestion}
            className="group rounded-2xl border-2 border-yellow-500/50 bg-white px-6 py-3 text-slate-900 transition-all duration-300 hover:scale-105 hover:border-yellow-500 dark:border-yellow-400/50 dark:bg-slate-900 dark:text-white dark:hover:border-yellow-400"
          >
            <ChevronLeft className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="font-semibold">Previous</span>
          </Button>

          <div className="rounded-2xl border border-yellow-500/30 bg-white px-6 py-3 backdrop-blur-sm dark:border-yellow-400/30 dark:bg-slate-900">
            <div className="text-center">
              <div className="text-sm text-slate-600 dark:text-slate-300">Answered</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {Array.from({ length: totalQuestions }, (_, i) => selectedAnswers.get(i)?.trim() || '').filter(a => a.length > 0).length}
                <span className="text-lg text-slate-600 dark:text-slate-400">
                  /
                  {totalQuestions}
                </span>
              </div>
            </div>
          </div>

          {isLastQuestion
            ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={`rounded-2xl px-8 py-3 text-lg font-semibold shadow-lg transition-all duration-300 ${
                    canSubmit
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:scale-105 hover:from-emerald-700 hover:to-teal-700 hover:shadow-emerald-500/25 dark:from-emerald-500 dark:to-teal-500 dark:hover:from-emerald-600 dark:hover:to-teal-600 dark:hover:shadow-emerald-400/25'
                      : 'bg-slate-400 text-slate-700 dark:bg-slate-600 dark:text-slate-300'
                  }`}
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Submit Exam
                </Button>
              )
            : (
                <Button
                  variant="outline"
                  onClick={handleNext}
                  className="group rounded-2xl border-2 border-yellow-500/50 bg-white px-6 py-3 text-slate-900 transition-all duration-300 hover:scale-105 hover:border-yellow-500 dark:border-yellow-400/50 dark:bg-slate-900 dark:text-white dark:hover:border-yellow-400"
                >
                  <span className="font-semibold">Next</span>
                  <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              )}
        </div>
      </div>
    </div>
  );
};

export default FillInBlankExam;
