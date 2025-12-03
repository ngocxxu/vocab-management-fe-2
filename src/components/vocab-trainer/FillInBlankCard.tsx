'use client';

import type { TQuestion } from '@/types/vocab-trainer';
import { HelpCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

type FillInBlankCardProps = {
  question: TQuestion;
  questionNumber: number;
  selectedAnswer: string | null;
  onAnswerSelect: (answer: string) => void;
};

const FillInBlankCard: React.FC<FillInBlankCardProps> = ({
  question,
  questionNumber,
  selectedAnswer,
  onAnswerSelect,
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
          <div className="rounded-3xl bg-white p-8 dark:bg-slate-900">
            <div className="absolute -top-4 -left-4">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-pink-500 shadow-lg">
                  <HelpCircle className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 h-3 w-3 animate-pulse rounded-full bg-yellow-400" />
                <div className="absolute -bottom-1 -left-1 h-2 w-2 animate-pulse rounded-full bg-pink-400" />
                <div className="absolute top-2 -right-4 h-2 w-2 animate-pulse rounded-full bg-purple-400" />
              </div>
            </div>

            <div className="ml-8 text-center">
              <Badge
                variant="outline"
                className="mb-4 border-yellow-500/50 bg-yellow-500/10 px-4 py-2 text-lg font-semibold text-yellow-600 dark:border-yellow-400/50 dark:bg-yellow-400/10 dark:text-yellow-400"
              >
                Question
                {' '}
                {questionNumber}
              </Badge>

              <h2 className="text-2xl leading-relaxed font-bold text-slate-900 lg:text-3xl dark:text-white">
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
          />
        </div>
      </div>
    </div>
  );
};

export default FillInBlankCard;
