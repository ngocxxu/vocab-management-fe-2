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
          <div className="rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 p-8">
            {/* Question mark icon with sparkle effect */}
            <div className="absolute -top-4 -left-4">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-pink-500 shadow-lg">
                  <HelpCircle className="h-8 w-8 text-white" />
                </div>
                {/* Sparkle effects */}
                <div className="absolute -top-2 -right-2 h-3 w-3 animate-pulse rounded-full bg-yellow-400" />
                <div className="absolute -bottom-1 -left-1 h-2 w-2 animate-pulse rounded-full bg-pink-400" />
                <div className="absolute top-2 -right-4 h-2 w-2 animate-pulse rounded-full bg-purple-400" />
              </div>
            </div>

            {/* Question content */}
            <div className="ml-8 text-center">
              <Badge
                variant="outline"
                className="mb-4 border-yellow-400/50 bg-yellow-400/10 px-4 py-2 text-lg font-semibold text-yellow-400"
              >
                Question
                {' '}
                {questionNumber}
              </Badge>

              <h2 className="text-2xl leading-relaxed font-bold text-white lg:text-3xl">
                {question.content}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Answer Options Grid */}
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 text-center">
          <h3 className="text-lg font-semibold tracking-wider text-slate-300 uppercase">
            Choose your answer
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {question.options && question.options.map((option, index) => {
            const isSelected = selectedAnswer === option.value;
            const optionLabel = optionLabels[index];

            return (
              <Button
                key={option.value}
                variant="outline"
                className={`group relative h-auto min-h-[80px] justify-start rounded-2xl border-2 p-6 text-left transition-all duration-300 hover:scale-[1.02] ${
                  isSelected
                    ? 'border-lime-400 bg-gradient-to-br from-lime-400 to-green-500 shadow-lg shadow-lime-400/25'
                    : 'border-yellow-400/50 bg-gradient-to-br from-indigo-800/50 to-purple-800/50 hover:border-yellow-400 hover:bg-gradient-to-br hover:from-indigo-700/70 hover:to-purple-700/70'
                }`}
                onClick={() => onAnswerSelect(option.value)}
              >
                <div className="flex w-full items-center space-x-4">
                  {/* Option letter */}
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-lg font-bold transition-all duration-300 ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-yellow-400/20 text-yellow-400 group-hover:bg-yellow-400/30'
                  }`}
                  >
                    {optionLabel}
                  </div>

                  {/* Option text */}
                  <span className={`flex-1 text-lg font-semibold transition-colors duration-300 ${
                    isSelected
                      ? 'text-white'
                      : 'text-slate-200 group-hover:text-white'
                  }`}
                  >
                    {option.label}
                  </span>

                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="flex-shrink-0">
                      <div className="h-3 w-3 rounded-full bg-white shadow-lg" />
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
