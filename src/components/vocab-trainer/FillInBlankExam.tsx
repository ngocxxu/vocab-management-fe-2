'use client';

import type { TFormTestVocabTrainerFillInBlank, TQuestionAPI, TWordTestInput } from '@/types/vocab-trainer';
import {
  AltArrowLeft,
  AltArrowRight,
  CheckCircle,
  RefreshCircle,
} from '@solar-icons/react/ssr';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { submitExam } from '@/actions/vocab-trainers';
import { ExamErrorState } from '@/components/shared';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { logger } from '@/libs/Logger';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
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

      const result = await submitExam(trainerId, examSubmissionData);

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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.ctrlKey && event.key === 'Enter') {
      handlePrevious();
    } else if (event.key === 'Enter') {
      handleNext();
    }
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="space-y-6 text-center">
          <RefreshCircle size={64} weight="BoldDuotone" className="mx-auto animate-spin text-primary" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Submitting your exam...
            </h2>
            <p className="text-muted-foreground">
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

  const answeredCount = Array.from({ length: totalQuestions }, (_, i) => selectedAnswers.get(i)?.trim() || '').filter(a => a.length > 0).length;

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-8">
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
          handleKeyDown={handleKeyDown}
        />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isFirstQuestion}
                className="w-full border-border bg-secondary text-foreground hover:bg-secondary/80 sm:w-auto"
              >
                <AltArrowLeft size={20} weight="BoldDuotone" className="mr-2" />
                Previous
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="center">
              <KbdGroup>
                <Kbd>Ctrl</Kbd>
                <Kbd>↵</Kbd>
              </KbdGroup>
            </TooltipContent>
          </Tooltip>

          <div className="text-center">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Answered
            </p>
            <p className="text-2xl font-bold text-foreground">
              {answeredCount}
              {' '}
              /
              {' '}
              {totalQuestions}
            </p>
          </div>

          {isLastQuestion
            ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 sm:w-auto"
                >
                  <CheckCircle size={20} weight="BoldDuotone" className="mr-2" />
                  Submit Exam
                </Button>
              )
            : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={handleNext}
                      className="w-full border-border bg-secondary text-foreground hover:bg-secondary/80 sm:w-auto"
                    >
                      Next
                      <AltArrowRight size={20} weight="BoldDuotone" className="ml-2" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center">
                    <KbdGroup>
                      <Kbd>↵</Kbd>
                    </KbdGroup>
                  </TooltipContent>
                </Tooltip>
              )}
        </div>
      </div>
    </div>
  );
};

export default FillInBlankExam;
