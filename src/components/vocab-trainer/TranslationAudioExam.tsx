'use client';

import { PAGE_CONTAINER_CLASS } from '@/components/shared/page-layout';
import type {
  TFormTestVocabTrainerTranslationAudio,
  TranslationAudioExamProps,
  TranslationAudioExamState,
  TTranslationAudioDialogue,
} from '@/types/vocab-trainer';
import { CheckCircle, RefreshCircle } from '@solar-icons/react/ssr';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { submitExam } from '@/actions/vocab-trainers';
import { ExamErrorState } from '@/shared/ui/shared';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { EQuestionType } from '@/enum/vocab-trainer';
import { logger } from '@/libs/Logger';
import { uploadAudioToCloudinary } from '@/utils/cloudinary';
import { markExamCooldownNow } from '@/utils/exam-cooldown';
import AudioRecorder from './AudioRecorder';
import DialogueDisplay from './DialogueDisplay';
import VocabExamHeader from './VocabExamHeader';

const TranslationAudioExam: React.FC<TranslationAudioExamProps> = ({ trainerId, examData }) => {
  const t = useTranslations('trainer.audioExam');
  const tSubmit = useTranslations('trainer.fillInSubmit');
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState(() => examData.setCountTime || 900);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [examState, setExamState] = useState<TranslationAudioExamState>('taking');
  const [error, setError] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);

  const isTranslationAudioDialogue = (item: unknown): item is TTranslationAudioDialogue => {
    return (
      typeof item === 'object'
      && item !== null
      && 'speaker' in item
      && 'text' in item
      && typeof (item as { speaker: unknown }).speaker === 'string'
      && typeof (item as { text: unknown }).text === 'string'
    );
  };

  const dialogue = useMemo((): TTranslationAudioDialogue[] => {
    const questionAnswers = examData.questionAnswers || [];
    if (questionAnswers.length === 0) {
      return [];
    }

    const firstItem = questionAnswers[0];
    if (!firstItem) {
      return [];
    }

    if (isTranslationAudioDialogue(firstItem)) {
      const filtered = questionAnswers.filter(isTranslationAudioDialogue);
      if (filtered.length === questionAnswers.length) {
        return filtered as unknown as TTranslationAudioDialogue[];
      }
    }

    if ('content' in firstItem && firstItem.content) {
      try {
        const parsed = JSON.parse(firstItem.content as string) as TTranslationAudioDialogue[];
        if (Array.isArray(parsed) && parsed.every(isTranslationAudioDialogue)) {
          return parsed;
        }
      } catch {
        return [];
      }
    }

    return [];
  }, [examData.questionAnswers]);

  const canSubmit = audioBlob !== null;

  const handleRecordingComplete = useCallback((blob: Blob) => {
    setAudioBlob(blob);
  }, []);

  const handleResetRecording = useCallback(() => {
    setAudioBlob(null);
    setFileId(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || !audioBlob) {
      return;
    }

    setError(null);

    try {
      let currentFileId = fileId;

      if (!currentFileId) {
        setExamState('uploading');
        try {
          currentFileId = await uploadAudioToCloudinary(audioBlob);
          setFileId(currentFileId);
        } catch (uploadErr) {
          logger.error('Failed to upload audio:', { error: uploadErr, trainerId });
          setError(uploadErr instanceof Error ? uploadErr.message : t('uploadFailed'));
          setExamState('error');
          return;
        }
      }

      setExamState('submitting');

      const examSubmissionData: TFormTestVocabTrainerTranslationAudio = {
        questionType: EQuestionType.TRANSLATION_AUDIO,
        fileId: currentFileId,
        countTime: timeElapsed,
      };

      const result = await submitExam(trainerId, examSubmissionData);

      if (result && typeof result === 'object' && 'error' in result) {
        const errorMessage = result.error as string;
        logger.error('Server error:', { error: errorMessage, trainerId });
        setError(errorMessage || tSubmit('failed'));
        setExamState('error');
        return;
      }

      let jobId: string | null = null;

      if (result && typeof result === 'object') {
        if ('jobId' in result && result.jobId) {
          jobId = result.jobId as string;
        } else if ('data' in result && result.data && typeof result.data === 'object' && 'jobId' in result.data) {
          jobId = result.data.jobId as string;
        } else if ('result' in result && result.result && typeof result.result === 'object' && 'jobId' in result.result) {
          jobId = result.result.jobId as string;
        } else {
          logger.warn('No jobId found in response:', { result, trainerId });
        }
      }

      if (jobId) {
        const resultData = { jobId, timeElapsed };
        const storageKey = `translation_audio_result_${trainerId}`;
        localStorage.setItem(storageKey, JSON.stringify(resultData));
        markExamCooldownNow();
        router.push(`/vocab-trainer/${trainerId}/exam/translation-audio/result`);
      } else {
        logger.error('Response does not contain jobId:', { result, trainerId });
        setError(tSubmit('noJobId'));
        setExamState('error');
      }
    } catch (err: unknown) {
      logger.error('Failed to submit exam:', { error: err, trainerId });

      let errorMessage = tSubmit('failed');

      if (err && typeof err === 'object' && 'response' in err) {
        const apiError = err as { response?: { data?: unknown } };
        const responseData = apiError.response?.data;
        if (responseData && typeof responseData === 'object' && 'error' in responseData) {
          errorMessage = String(responseData.error);
        } else if (typeof responseData === 'string') {
          errorMessage = responseData;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setExamState('error');
    }
  }, [canSubmit, audioBlob, fileId, timeElapsed, trainerId, router, t, tSubmit]);

  const handleBackToTrainers = () => {
    router.push('/vocab-trainer');
  };

  useEffect(() => {
    if (examState !== 'taking') {
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [examState]);

  if (examState === 'uploading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="space-y-6 text-center">
          <RefreshCircle size={64} weight="BoldDuotone" className="mx-auto animate-spin text-primary" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              {t('uploadingTitle')}
            </h2>
            <p className="text-muted-foreground">
              {t('uploadingBody')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (examState === 'submitting') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="space-y-6 text-center">
          <RefreshCircle size={64} weight="BoldDuotone" className="mx-auto animate-spin text-primary" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              {tSubmit('title')}
            </h2>
            <p className="text-muted-foreground">
              {t('submittingBody')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (examState === 'error') {
    return (
      <ExamErrorState
        error={error}
        onBackToTrainers={handleBackToTrainers}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className={`${PAGE_CONTAINER_CLASS} space-y-5 sm:space-y-8`}>
        <VocabExamHeader
          trainerName={examData.name || t('untitled')}
          currentQuestion={1}
          totalQuestions={1}
          timeRemaining={timeRemaining}
        />

        <div className="space-y-6">
          <DialogueDisplay dialogue={dialogue} />

          <AudioRecorder onRecordingComplete={handleRecordingComplete} onReset={handleResetRecording} />

          {audioBlob && (
            <Card className="border border-border bg-card">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <p className="text-center text-foreground">
                    {t('recordingDone')}
                  </p>
                  <div className="flex justify-center">
                    <Button
                      onClick={handleSubmit}
                      disabled={!canSubmit}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                      <CheckCircle size={20} weight="BoldDuotone" className="mr-2" />
                      {t('submitExam')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranslationAudioExam;
