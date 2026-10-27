'use client';

import type { VocabExamHeaderProps } from '@/types/vocab-trainer';
import { ClockCircle, Target } from '@solar-icons/react/ssr';
import { useTranslations } from 'next-intl';
import React from 'react';

const VocabExamHeader: React.FC<VocabExamHeaderProps> = ({
  trainerName,
  currentQuestion,
  totalQuestions,
  timeRemaining,
  level = 'STANDARD',
}) => {
  const t = useTranslations('trainer.header');

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = totalQuestions > 0 ? (currentQuestion / totalQuestions) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground sm:h-14 sm:w-14">
                <Target size={24} weight="BoldDuotone" className="sm:size-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground sm:text-2xl lg:text-3xl">
                  {trainerName}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('questionOf', { current: currentQuestion, total: totalQuestions })}
                </p>
                <p className="mt-0.5 text-xs font-bold tracking-wide text-primary uppercase">
                  {t('level', { level })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted px-4 py-3 sm:px-5 sm:py-4">
              <ClockCircle size={24} weight="BoldDuotone" className="shrink-0 text-primary sm:size-6" />
              <div>
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {t('timeRemaining')}
                </p>
                <p className="font-mono text-xl font-bold text-foreground sm:text-2xl">
                  {formatTime(timeRemaining)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs font-medium tracking-wide text-muted-foreground uppercase">
          <span>{t('progress')}</span>
          <span>
            {t('percentComplete', { percent: Math.round(progressPercentage) })}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default VocabExamHeader;
