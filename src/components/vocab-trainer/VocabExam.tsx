'use client';

import type { TFormTestVocabTrainer, TQuestionAPI, TWordTestSelect } from '@/types/vocab-trainer';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { vocabTrainerMutations } from '@/hooks';
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
  const [selectedAnswers, setSelectedAnswers] = useState<Map<number, string>>(new Map());
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

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    setExamState('submitting');
    setError(null);

    try {
      // Prepare exam data in the required format
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

      const result = await vocabTrainerMutations.submitExam(trainerId, examSubmissionData);
      setExamResults(result);
      setExamState('completed');
    } catch (err) {
      console.error('Failed to submit exam:', err);
      setError('Failed to submit exam. Please try again.');
      setExamState('error');
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:20px_20px] opacity-20" />

      <div className="relative space-y-8 py-8">
        <VocabExamHeader
          trainerName={examData.name || 'Vocabulary Exam'}
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={totalQuestions}
          timeRemaining={timeRemaining}
          isSubmitting={examState === 'submitting'}
          canSubmit={canSubmit}
          onSubmit={handleSubmit}
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
              className="group rounded-2xl border-2 border-yellow-400/50 bg-gradient-to-r from-indigo-800/50 to-purple-800/50 px-6 py-3 text-white transition-all duration-300 hover:scale-105 hover:border-yellow-400 hover:from-indigo-700/70 hover:to-purple-700/70"
            >
              <ChevronLeft className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
              <span className="font-semibold">Previous</span>
            </Button>

            <div className="rounded-2xl border border-yellow-400/30 bg-gradient-to-r from-indigo-800/30 to-purple-800/30 px-6 py-3 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-sm text-slate-300">Answered</div>
                <div className="text-2xl font-bold text-white">
                  {selectedAnswers.size}
                  <span className="text-lg text-slate-400">
                    /
                    {totalQuestions}
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleNext}
              disabled={isLastQuestion}
              className="group rounded-2xl border-2 border-yellow-400/50 bg-gradient-to-r from-indigo-800/50 to-purple-800/50 px-6 py-3 text-white transition-all duration-300 hover:scale-105 hover:border-yellow-400 hover:from-indigo-700/70 hover:to-purple-700/70"
            >
              <span className="font-semibold">Next</span>
              <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocabExam;
