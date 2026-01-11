'use client';

import type { TQuestion } from '@/types/vocab-trainer';
import { HelpCircle } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type QuestionCardProps = {
  question: TQuestion;
  questionNumber: number;
  selectedAnswer: string | null;
  onAnswerSelect: (answer: string) => void;
};

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  selectedAnswer,
  onAnswerSelect,
}) => {
  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-8">
      {/* Question Speech Bubble */}
      <div className="relative mx-auto max-w-4xl">
        {/* Speech bubble with gradient border */}
        <div className="relative rounded-3xl border-4 bg-gradient-to-br from-yellow-400 via-yellow-500 to-pink-500 p-1">
          <div className="rounded-3xl bg-white p-4 sm:p-6 md:p-8 dark:bg-slate-900">
            {/* Question mark icon with sparkle effect */}
            <div className="absolute -top-2 -left-2 sm:-top-4 sm:-left-4">
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-pink-500 shadow-lg sm:h-16 sm:w-16">
                  <HelpCircle className="h-6 w-6 text-white sm:h-8 sm:w-8" />
                </div>
                {/* Sparkle effects */}
                <div className="absolute -top-2 -right-2 h-3 w-3 animate-pulse rounded-full bg-yellow-400" />
                <div className="absolute -bottom-1 -left-1 h-2 w-2 animate-pulse rounded-full bg-pink-400" />
                <div className="absolute top-2 -right-4 h-2 w-2 animate-pulse rounded-full bg-purple-400" />
              </div>
            </div>

            {/* Question content */}
            <div className="ml-6 text-center sm:ml-8">
              <Badge
                variant="outline"
                className="mb-3 border-yellow-500/50 bg-yellow-500/10 px-3 py-1 text-sm font-semibold text-yellow-600 sm:mb-4 sm:px-4 sm:py-2 sm:text-lg dark:border-yellow-400/50 dark:bg-yellow-400/10 dark:text-yellow-400"
              >
                Question
                {' '}
                {questionNumber}
              </Badge>

              <h2 className="text-xl leading-relaxed font-bold text-slate-900 sm:text-2xl lg:text-3xl dark:text-white">
                {question.content}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Answer Options Grid */}
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 text-center">
          <h3 className="text-lg font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300">
            Choose your answer
          </h3>
        </div>

        <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2">
          {question.options && question.options.map((option, index) => {
            const isSelected = selectedAnswer === option.value;
            const optionLabel = optionLabels[index];

            return (
              <Button
                key={option.value}
                variant="outline"
                className={`group relative h-auto min-h-[80px] justify-start rounded-2xl border-2 p-6 text-left transition-all duration-300 hover:scale-[1.02] ${
                  isSelected
                    ? 'border-amber-500 bg-gradient-to-br from-amber-300 to-amber-300 shadow-lg shadow-amber-500/20'
                    : 'border-yellow-500/50 bg-white hover:border-yellow-500 hover:bg-slate-50 dark:border-yellow-400/50 dark:bg-slate-900 dark:hover:border-yellow-400 dark:hover:bg-slate-800'
                }`}
                onClick={() => onAnswerSelect(option.value)}
              >
                <div className="flex w-full items-center space-x-4">
                  {/* Option letter */}
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-lg font-bold transition-all duration-300 ${
                    isSelected
                      ? 'bg-amber-100/80 text-amber-900'
                      : 'bg-yellow-500/20 text-yellow-600 group-hover:bg-yellow-500/30 dark:bg-yellow-400/20 dark:text-yellow-400 dark:group-hover:bg-yellow-400/30'
                  }`}
                  >
                    {optionLabel}
                  </div>

                  {/* Option text */}
                  <span className={`flex-1 text-lg font-semibold whitespace-normal transition-colors duration-300 ${
                    isSelected
                      ? 'text-amber-900'
                      : 'text-slate-700 group-hover:text-slate-900 dark:text-slate-200 dark:group-hover:text-white'
                  }`}
                  >
                    {option.label}
                  </span>

                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="flex-shrink-0">
                      <div className="h-3 w-3 rounded-full bg-amber-600 shadow-lg" />
                    </div>
                  )}
                </div>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
