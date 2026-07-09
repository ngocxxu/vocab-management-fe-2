'use client';

import type { QuestionCardProps } from '@/types/vocab-trainer';
import React from 'react';
import { Button } from '@/components/ui/button';

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  selectedAnswer,
  onAnswerSelect,
}) => {
  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="mx-auto max-w-6xl space-y-5 sm:space-y-8">
      <div className="space-y-3 text-center sm:space-y-6">
        <div className="inline-flex rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-primary">
          • QUESTION
          {' '}
          {questionNumber}
        </div>
        <h2 className="text-lg leading-relaxed font-bold text-foreground sm:text-2xl lg:text-3xl">
          {question.content}
        </h2>
      </div>

      <div className="space-y-3">
        <p className="block text-center text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Choose your answer
        </p>
        <div className="grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {question.options && question.options.map((option, index) => {
            const isSelected = selectedAnswer === option.value;
            const optionLabel = optionLabels[index];

            return (
              <Button
                key={option.value}
                variant="outline"
                className={`group relative h-auto min-h-[56px] justify-start rounded-xl border-2 p-3 text-left transition-all duration-200 sm:min-h-[80px] sm:p-6 ${
                  isSelected
                    ? 'border-primary bg-primary/10 hover:bg-primary/15'
                    : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
                }`}
                onClick={() => onAnswerSelect(option.value)}
              >
                <div className="flex w-full items-center gap-3 sm:gap-4">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base font-bold transition-colors sm:h-12 sm:w-12 sm:text-lg ${
                      isSelected ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {optionLabel}
                  </div>
                  <span className="flex-1 text-base font-semibold whitespace-normal text-foreground sm:text-lg">
                    {option.label}
                  </span>
                  {isSelected && (
                    <div className="h-3 w-3 shrink-0 rounded-full bg-primary" />
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
