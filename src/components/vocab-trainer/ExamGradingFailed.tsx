'use client';

import { useTranslations } from 'next-intl';
import React from 'react';
import type { TUseRegradeExamResult } from '@/hooks/useRegradeExam';
import { ExamErrorState } from '@/shared/ui/shared';

type ExamGradingFailedProps = {
  error: string;
  regrade: TUseRegradeExamResult;
  onBackToTrainers: () => void;
};

/** Failed grading: offers a regrade with the count left. Nothing is regraded without a tap. */
const ExamGradingFailed: React.FC<ExamGradingFailedProps> = ({ error, regrade, onBackToTrainers }) => {
  const t = useTranslations('trainer.regrade');

  let hint: string | undefined;
  if (regrade.isLoaded && regrade.canRegrade) {
    hint = t('remaining', { count: regrade.remaining });
  } else if (regrade.isLoaded && regrade.isExhausted) {
    hint = t('exhausted');
  }

  return (
    <ExamErrorState
      error={error}
      hint={hint}
      onRetry={regrade.canRegrade ? () => void regrade.regrade() : undefined}
      retryLabel={regrade.isBusy ? t('busy') : t('button')}
      retryDisabled={regrade.isBusy}
      onBackToTrainers={onBackToTrainers}
      variant="fullscreen"
    />
  );
};

export default ExamGradingFailed;
