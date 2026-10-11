'use client';

import { useTranslations } from 'next-intl';
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

import type { ExamErrorStateProps } from '@/types';

const ExamErrorState: React.FC<ExamErrorStateProps> = ({
  error,
  onBackToTrainers,
  variant = 'inline',
  fallbackMessage,
}) => {
  const t = useTranslations('shared');
  const errorMessage = error || fallbackMessage || t('examErrorFallback');
  const content = (
    <>
      <Alert variant="destructive">
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
      <div className="flex justify-center">
        <Button onClick={onBackToTrainers} variant="outline">
          {t('backToTrainers')}
        </Button>
      </div>
    </>
  );

  if (variant === 'fullscreen') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="mx-auto max-w-2xl space-y-6 px-4">
          {content}
        </div>
      </div>
    );
  }

  return <div className="space-y-6">{content}</div>;
};

export default ExamErrorState;
