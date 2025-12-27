'use client';

import type { TQuestionAPI } from '@/types/vocab-trainer';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { LoadingComponent } from '@/components/shared';
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
      router.push('/vocab-trainer');
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

  if (isError) {
    return null;
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
