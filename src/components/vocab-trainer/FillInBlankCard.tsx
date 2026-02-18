'use client';

import type { FillInBlankCardProps } from '@/types/vocab-trainer';
import React, { useEffect, useMemo, useState } from 'react';
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
  const [answer, setAnswer] = useState(selectedAnswer || '');

  useEffect(() => {
    setAnswer(selectedAnswer || '');
  }, [selectedAnswer]);

  const handleInputChange = (value: string) => {
    setAnswer(value);
    onAnswerSelect(value);
  };

  const questionContent = useMemo(
    () => parseContentWithQuotedHighlight(question.content),
    [question.content],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="space-y-6 text-center">
        <div className="inline-flex rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-primary">
          • QUESTION
          {' '}
          {questionNumber}
        </div>
        <h2 className="text-xl leading-relaxed font-bold text-foreground sm:text-2xl lg:text-3xl">
          {questionContent}
        </h2>
      </div>

      <div className="space-y-3">
        <label htmlFor="fill-in-blank-answer" className="block text-center text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Type your answer
        </label>
        <Input
          id="fill-in-blank-answer"
          type="text"
          value={answer}
          onChange={e => handleInputChange(e.target.value)}
          placeholder="Enter your answer here..."
          className="h-14 rounded-xl border border-input bg-card px-5 text-lg text-foreground placeholder:text-muted-foreground placeholder:italic focus-visible:ring-ring"
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
};

export default FillInBlankCard;
