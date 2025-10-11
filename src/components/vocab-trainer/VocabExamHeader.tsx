'use client';

import { CheckCircle, Clock, Target } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type VocabExamHeaderProps = {
  trainerName: string;
  currentQuestion: number;
  totalQuestions: number;
  timeRemaining: number;
  isSubmitting: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
};

const VocabExamHeader: React.FC<VocabExamHeaderProps> = ({
  trainerName,
  currentQuestion,
  totalQuestions,
  timeRemaining,
  isSubmitting,
  canSubmit,
  onSubmit,
}) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (time: number) => {
    if (time <= 60) {
      return 'text-red-400';
    }
    if (time <= 300) {
      return 'text-yellow-400';
    }
    return 'text-green-400';
  };

  const progressPercentage = (currentQuestion / totalQuestions) * 100;

  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div className="relative mx-auto max-w-4xl">
        <div className="rounded-3xl border-2 border-yellow-400/30 bg-gradient-to-br from-indigo-900/80 via-purple-900/80 to-indigo-900/80 p-6 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
            {/* Title and Progress */}
            <div className="text-center sm:text-left">
              <h1 className="mb-2 text-2xl font-bold text-white lg:text-3xl">
                {trainerName}
              </h1>

              <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <Badge
                  variant="outline"
                  className="border-yellow-400/50 bg-yellow-400/10 px-3 py-1 text-yellow-400"
                >
                  <Target className="mr-1 h-3 w-3" />
                  Question
                  {' '}
                  {currentQuestion}
                  {' '}
                  of
                  {' '}
                  {totalQuestions}
                </Badge>

                <div className={`flex items-center space-x-2 rounded-full bg-black/20 px-3 py-1 ${getTimeColor(timeRemaining)}`}>
                  <Clock className="h-4 w-4" />
                  <span className="font-mono text-lg font-bold">
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={onSubmit}
              disabled={!canSubmit || isSubmitting}
              className={`rounded-2xl px-8 py-3 text-lg font-semibold shadow-lg transition-all duration-300 ${
                canSubmit && !isSubmitting
                  ? 'bg-gradient-to-r from-lime-400 to-green-500 text-white hover:scale-105 hover:from-lime-500 hover:to-green-600 hover:shadow-lime-400/25'
                  : 'bg-slate-600 text-slate-300'
              }`}
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              {isSubmitting ? 'Submitting...' : 'Submit Exam'}
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mx-auto max-w-4xl">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-300">
            <span>Progress</span>
            <span className="font-semibold">
              {Math.round(progressPercentage)}
              %
            </span>
          </div>

          <div className="relative h-3 overflow-hidden rounded-full bg-slate-700/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-pink-500 shadow-lg transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocabExamHeader;
