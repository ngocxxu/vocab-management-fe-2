'use client';

import type { TQuestionAPI } from '@/types/vocab-trainer';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { LoadingComponent } from '@/components/shared';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import VocabExam from '@/components/vocab-trainer/VocabExam';
import { useExamData } from '@/hooks/useExamData';

const MultipleChoiceExamPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const trainerId = params.id as string;

  const {
    examData,
    isLoading,
    generationStatus,
    isError,
    error,
  } = useExamData({
    trainerId,
    autoLoad: true,
    onErrorAction: (err) => {
      console.error('Failed to load exam:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load exam';
      toast.error('Failed to load exam', {
        description: errorMessage,
        duration: 5000,
      });
      // Don't redirect here - let the error UI handle it
    },
  });

  useEffect(() => {
    return () => {
      if (trainerId) {
        const storageKey = `exam_data_${trainerId}`;
        localStorage.removeItem(storageKey);
      }
    };
  }, [trainerId]);

  const handleBackToTrainers = () => {
    router.push('/vocab-trainer');
  };

  if (isError) {
    const errorMessage = error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Failed to load exam. Please try again.';

    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="mx-auto max-w-2xl space-y-6 px-4">
          <Alert variant="destructive">
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <Button onClick={handleBackToTrainers} variant="outline">
              Back to Trainers
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !examData?.questionAnswers?.length) {
    const loadingMessage = generationStatus === 'generating'
      ? 'Generating questions...'
      : 'Loading exam...';

    return (
      <LoadingComponent
        title={loadingMessage}
        description="This may take a few moments. Please wait."
      />
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <VocabExam trainerId={trainerId} examData={examData as TQuestionAPI} />
    </div>
  );
};

export default MultipleChoiceExamPage;
