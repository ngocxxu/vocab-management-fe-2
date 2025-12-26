'use client';

import type { TQuestionAPI } from '@/types/vocab-trainer';
import { Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { toast } from 'sonner';
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="space-y-6 text-center">
          <Loader2 className="mx-auto h-16 w-16 animate-spin text-yellow-600 dark:text-yellow-400" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {loadingMessage}
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              This may take a few moments. Please wait.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <VocabExam trainerId={trainerId} examData={examData as TQuestionAPI} />
    </div>
  );
};

export default MultipleChoiceExamPage;
