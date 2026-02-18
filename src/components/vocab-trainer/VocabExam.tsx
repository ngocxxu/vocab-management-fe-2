'use client';

import { EQuestionType } from '@/enum/vocab-trainer';
import type { TFormTestVocabTrainer, TQuestionAPI, TWordTestSelect } from '@/types/vocab-trainer';
import {
  AltArrowLeft,
  AltArrowRight,
  CheckCircle,
} from '@solar-icons/react/ssr';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { submitExam } from '@/actions/vocab-trainers';
import { ExamErrorState } from '@/components/shared';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import ExamResults from './ExamResults';
import QuestionCard from './QuestionCard';
import VocabExamHeader from './VocabExamHeader';

type VocabExamProps = {
  trainerId: string;
  examData: TQuestionAPI;
};

type ExamState = 'taking' | 'submitting' | 'completed' | 'error';

const VocabExam: React.FC<VocabExamProps> = ({ trainerId, examData }) => {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Map<number, string>>(() => new Map());
  const [timeRemaining, setTimeRemaining] = useState(() => examData.setCountTime || 900);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [examState, setExamState] = useState<ExamState>('taking');
  const [examResults, setExamResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const questions = examData.questionAnswers || [];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const canSubmit = selectedAnswers.size === totalQuestions;

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
    if (selectedAnswers.size !== totalQuestions) {
      return;
    }

    setExamState('submitting');
    setError(null);

    try {
      const wordTestSelects: TWordTestSelect[] = questions.map((question, index) => {
        const userAnswer = selectedAnswers.get(index) || '';
        return {
          systemSelected: question.correctAnswer,
          userSelected: userAnswer,
        };
      });

      const examSubmissionData: TFormTestVocabTrainer = {
        id: trainerId,
        questionType: examData.questionType || 'MULTIPLE_CHOICE',
        countTime: timeElapsed,
        wordTestSelects,
      };

      const result = await submitExam(trainerId, examSubmissionData);
      setExamResults(result);
      setExamState('completed');
    } catch (err) {
      console.error('Failed to submit exam:', err);
      setError('Failed to submit exam. Please try again.');
      setExamState('error');
    }
  }, [selectedAnswers, totalQuestions, questions, trainerId, examData.questionType, timeElapsed]);

  const handleBackToTrainers = () => {
    router.push('/vocab-trainer');
  };

  // Timer effect
  useEffect(() => {
    if (examState !== 'taking') {
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up - auto submit
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [examState, handleSubmit]);

  // Show results if exam is completed
  if (examState === 'completed' && examResults) {
    return (
      <ExamResults
        trainerId={trainerId}
        results={examResults}
        questions={questions}
        selectedAnswers={selectedAnswers}
        timeElapsed={timeElapsed}
        onBackToTrainers={handleBackToTrainers}
        questionType={examData.questionType ?? EQuestionType.MULTIPLE_CHOICE}
      />
    );
  }

  // Show error state
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
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-8">
        <VocabExamHeader
          trainerName={examData.name || 'Vocabulary Exam'}
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={totalQuestions}
          timeRemaining={timeRemaining}
        />

        <QuestionCard
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          selectedAnswer={selectedAnswers.get(currentQuestionIndex) || null}
          onAnswerSelect={handleAnswerSelect}
        />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstQuestion}
            className="w-full border-border bg-secondary text-foreground hover:bg-secondary/80 sm:w-auto"
          >
            <AltArrowLeft size={20} weight="BoldDuotone" className="mr-2" />
            Previous
          </Button>

          <div className="text-center">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Answered
            </p>
            <p className="text-2xl font-bold text-foreground">
              {selectedAnswers.size}
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
                  disabled={!canSubmit || examState === 'submitting'}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 sm:w-auto"
                >
                  <CheckCircle size={20} weight="BoldDuotone" className="mr-2" />
                  {examState === 'submitting' ? 'Submitting...' : 'Submit Exam'}
                </Button>
              )
            : (
                <Button
                  variant="outline"
                  onClick={handleNext}
                  className="w-full border-border bg-secondary text-foreground hover:bg-secondary/80 sm:w-auto"
                >
                  Next
                  <AltArrowRight size={20} weight="BoldDuotone" className="ml-2" />
                </Button>
              )}
        </div>
      </div>
    </div>
  );
};

export default VocabExam;
