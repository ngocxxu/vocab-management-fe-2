'use client';

import type { TFormTestVocabTrainer, TQuestionAPI, TWordTestSelect } from '@/types/vocab-trainer';
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { submitExam } from '@/actions/vocab-trainers';
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
      />
    );
  }

  // Show error state
  if (examState === 'error') {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            {error || 'An error occurred while submitting the exam.'}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={handleBackToTrainers} variant="outline">
            Back to Trainers
          </Button>
        </div>
      </div>
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

      <QuestionCard
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        selectedAnswer={selectedAnswers.get(currentQuestionIndex) || null}
        onAnswerSelect={handleAnswerSelect}
      />

      {/* Navigation buttons */}
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
                {selectedAnswers.size}
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
                  disabled={!canSubmit || examState === 'submitting'}
                  className={`rounded-2xl px-8 py-3 text-lg font-semibold shadow-lg transition-all duration-300 ${
                    canSubmit && examState !== 'submitting'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:scale-105 hover:from-emerald-700 hover:to-teal-700 hover:shadow-emerald-500/25 dark:from-emerald-500 dark:to-teal-500 dark:hover:from-emerald-600 dark:hover:to-teal-600 dark:hover:shadow-emerald-400/25'
                      : 'bg-slate-400 text-slate-700 dark:bg-slate-600 dark:text-slate-300'
                  }`}
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  {examState === 'submitting' ? 'Submitting...' : 'Submit Exam'}
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

export default VocabExam;
