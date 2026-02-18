'use client';

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

import type { ExamErrorStateProps } from '@/types';

const ExamErrorState: React.FC<ExamErrorStateProps> = ({
  error,
  onBackToTrainers,
  variant = 'inline',
  fallbackMessage = 'An error occurred. Please try again.',
}) => {
  const errorMessage = error || fallbackMessage;
  const content = (
    <>
      <Alert variant="destructive">
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
      <div className="flex justify-center">
        <Button onClick={onBackToTrainers} variant="outline">
          Back to Trainers
        </Button>
      </div>
    </>
  );

  if (variant === 'fullscreen') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="mx-auto max-w-2xl space-y-6 px-4">
          {content}
        </div>
      </div>
    );
  }

  return <div className="space-y-6">{content}</div>;
};

export default ExamErrorState;
