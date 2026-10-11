'use client';

import type { TQuestionAPI } from '@/types/vocab-trainer';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';
import { LoadingComponent } from '@/shared/ui/shared';
import TranslationAudioExam from '@/components/vocab-trainer/TranslationAudioExam';
import { useExamData } from '@/hooks/useExamData';

const TranslationAudioExamPage: React.FC = () => {
  const t = useTranslations('trainer.exam');
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
      const errorMessage = err instanceof Error ? err.message : t('loadFailed');
      toast.error(t('loadFailed'), {
        description: errorMessage,
        duration: 5000,
      });
      router.push('/vocab-trainer');
    },
  });

  if (isError) {
    return null;
  }

  if (isLoading || !examData?.questionAnswers?.length) {
    const loadingMessage = generationStatus === 'generating'
      ? t('generating')
      : t('loading');

    return (
      <LoadingComponent
        title={loadingMessage}
        description={t('waitMoments')}
      />
    );
  }

  return (
    <div className="min-h-full bg-background">
      <TranslationAudioExam trainerId={trainerId} examData={examData as TQuestionAPI} />
    </div>
  );
};

export default TranslationAudioExamPage;
