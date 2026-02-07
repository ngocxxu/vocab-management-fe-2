'use client';

import type { TQuestion } from '@/types/vocab-trainer';
import { QuestionCircle } from '@solar-icons/react/ssr';
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

type FillInBlankCardProps = {
  question: TQuestion;
  questionNumber: number;
  selectedAnswer: string | null;
  onAnswerSelect: (answer: string) => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
};

const FillInBlankCard: React.FC<FillInBlankCardProps> = ({
  question,
  questionNumber,
  selectedAnswer,
  onAnswerSelect,
  handleKeyDown,
}) => {
  const [answer, setAnswer] = useState(selectedAnswer || '');

  useEffect(() => {
    setAnswer(selectedAnswer || '');
  }, [selectedAnswer]);

  const handleInputChange = (value: string) => {
    setAnswer(value);
    onAnswerSelect(value);
  };

  return (
    <div className="space-y-8">
      <div className="relative mx-auto max-w-4xl">
        <div className="relative rounded-3xl border-4 bg-gradient-to-br from-yellow-400 via-yellow-500 to-pink-500 p-1">
          <div className="rounded-3xl bg-white p-4 sm:p-6 md:p-8 dark:bg-slate-900">
            <div className="absolute -top-2 -left-2 sm:-top-4 sm:-left-4">
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-pink-500 shadow-lg sm:h-16 sm:w-16">
                  <QuestionCircle size={24} weight="BoldDuotone" className="text-white sm:!size-8" />
                </div>
                <div className="absolute -top-2 -right-2 h-3 w-3 animate-pulse rounded-full bg-yellow-400" />
                <div className="absolute -bottom-1 -left-1 h-2 w-2 animate-pulse rounded-full bg-pink-400" />
                <div className="absolute top-2 -right-4 h-2 w-2 animate-pulse rounded-full bg-purple-400" />
              </div>
            </div>

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

      <div className="mx-auto max-w-4xl">
        <div className="mb-6 text-center">
          <h3 className="text-lg font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300">
            Type your answer
          </h3>
        </div>

        <div className="space-y-4">
          <Input
            type="text"
            value={answer}
            onChange={e => handleInputChange(e.target.value)}
            placeholder="Enter your answer here..."
            className="h-16 rounded-2xl border-2 border-yellow-500/50 bg-white px-6 text-lg font-semibold text-slate-900 transition-all duration-300 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/20 dark:border-yellow-400/50 dark:bg-slate-900 dark:text-white dark:focus:border-yellow-400 dark:focus:ring-yellow-400/20"
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    </div>
  );
};

export default FillInBlankCard;
