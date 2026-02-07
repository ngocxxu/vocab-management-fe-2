'use client';

import { ClockCircle, Target } from '@solar-icons/react/ssr';
import React from 'react';
import { Badge } from '@/components/ui/badge';

type VocabExamHeaderProps = {
  trainerName: string;
  currentQuestion: number;
  totalQuestions: number;
  timeRemaining: number;
};

const VocabExamHeader: React.FC<VocabExamHeaderProps> = ({
  trainerName,
  currentQuestion,
  totalQuestions,
  timeRemaining,
}) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (time: number) => {
    if (time <= 60) {
      return 'text-red-600 dark:text-red-400';
    }
    if (time <= 300) {
      return 'text-yellow-600 dark:text-yellow-400';
    }
    return 'text-emerald-700 dark:text-emerald-400';
  };

  const progressPercentage = (currentQuestion / totalQuestions) * 100;

  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div className="relative mx-auto max-w-4xl">
        <div className="rounded-3xl border-2 border-yellow-500/30 bg-white p-4 backdrop-blur-sm sm:p-6 dark:border-yellow-400/30 dark:bg-slate-900">
          <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
            {/* Title and Progress */}
            <div className="text-center sm:text-left">
              <h1 className="mb-2 text-xl font-bold text-slate-900 sm:text-2xl lg:text-3xl dark:text-white">
                {trainerName}
              </h1>

              <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <Badge
                  variant="outline"
                  className="border-yellow-500/50 bg-yellow-500/10 px-3 py-1 text-yellow-600 dark:border-yellow-400/50 dark:bg-yellow-400/10 dark:text-yellow-400"
                >
                  <Target size={12} weight="BoldDuotone" className="mr-1" />
                  Question
                  {' '}
                  {currentQuestion}
                  {' '}
                  of
                  {' '}
                  {totalQuestions}
                </Badge>
              </div>
            </div>

            {/* Time Remaining Display */}
            <div className={`flex items-center space-x-2 rounded-2xl border-2 border-yellow-500/30 bg-yellow-500/10 px-4 py-2 sm:space-x-3 sm:px-6 sm:py-3 dark:border-yellow-400/30 dark:bg-yellow-400/10 ${getTimeColor(timeRemaining)}`}>
              <ClockCircle size={24} weight="BoldDuotone" className="sm:!size-6" />
              <div className="flex flex-col">
                <span className="text-xs font-medium opacity-80">Time Remaining</span>
                <span className="font-mono text-lg font-bold sm:text-2xl">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mx-auto max-w-4xl">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
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
