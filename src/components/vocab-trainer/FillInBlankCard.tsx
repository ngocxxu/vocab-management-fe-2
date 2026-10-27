'use client';

import type { FillInBlankCardProps } from '@/types/vocab-trainer';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';
import { Input } from '@/components/ui/input';

function parseContentWithQuotedHighlight(content: string): React.ReactNode {
  const parts = content.split('"');
  if (parts.length === 1) {
    return content;
  }
  return parts.map((segment, i) => {
    if (i % 2 === 1) {
      return (
        <span key={i} className="text-primary">
          &quot;
          {segment}
          &quot;
        </span>
      );
    }
    return segment;
  });
}

const FillInBlankCard: React.FC<FillInBlankCardProps> = ({
  question,
  questionNumber,
  selectedAnswer,
  onAnswerSelect,
  handleKeyDown,
}) => {
  const t = useTranslations('trainer.fillIn');
  const answer = selectedAnswer || '';

  const handleInputChange = (value: string) => {
    onAnswerSelect(value);
  };

  const questionContent = useMemo(
    () => parseContentWithQuotedHighlight(question.content),
    [question.content],
  );

  return (
    <div className="space-y-5 sm:space-y-8">
      <div className="space-y-3 text-center sm:space-y-6">
        <div className="inline-flex rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-primary">
          {t('question', { number: questionNumber })}
        </div>
        <h2 className="text-lg leading-relaxed font-bold text-foreground sm:text-2xl lg:text-3xl">
          {questionContent}
        </h2>
      </div>

      <div className="space-y-3">
        <label htmlFor="fill-in-blank-answer" className="block text-center text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {t('typeAnswer')}
        </label>
        <Input
          id="fill-in-blank-answer"
          type="text"
          value={answer}
          onChange={e => handleInputChange(e.target.value)}
          placeholder={t('placeholder')}
          className="h-14 rounded-xl border border-input bg-card px-5 text-lg text-foreground placeholder:text-muted-foreground placeholder:italic focus-visible:ring-ring"
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
};

export default FillInBlankCard;
