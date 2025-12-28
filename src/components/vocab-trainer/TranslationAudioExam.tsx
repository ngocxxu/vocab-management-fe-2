'use client';

import type { TFormTestVocabTrainerTranslationAudio, TQuestionAPI, TTranslationAudioDialogue } from '@/types/vocab-trainer';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { submitExam } from '@/actions/vocab-trainers';
import { ExamErrorState } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EQuestionType } from '@/enum/vocab-trainer';
import { uploadAudioToCloudinary } from '@/utils/cloudinary';
import AudioRecorder from './AudioRecorder';
import DialogueDisplay from './DialogueDisplay';
import VocabExamHeader from './VocabExamHeader';

type TranslationAudioExamProps = {
  trainerId: string;
  examData: TQuestionAPI;
};

type ExamState = 'taking' | 'recording' | 'uploading' | 'submitting' | 'evaluating' | 'completed' | 'error';

const TranslationAudioExam: React.FC<TranslationAudioExamProps> = ({ trainerId, examData }) => {
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState(() => examData.setCountTime || 900);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [examState, setExamState] = useState<ExamState>('taking');
  const [error, setError] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);

  const dialogue = useMemo(() => {
    const questionAnswers = examData.questionAnswers || [];
    if (questionAnswers.length === 0) {
      return [];
    }

    const firstItem = questionAnswers[0] as any;
    if (!firstItem) {
      return [];
    }

    if (firstItem.speaker && firstItem.text) {
      if (Array.isArray(questionAnswers) && questionAnswers.every((item: any) => item.speaker && item.text)) {
        return questionAnswers as unknown as TTranslationAudioDialogue[];
      }
    }

    if (firstItem.content) {
      try {
        const parsed = JSON.parse(firstItem.content) as TTranslationAudioDialogue[];
        if (Array.isArray(parsed) && parsed.every(item => item.speaker && item.text)) {
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
          console.error('Failed to upload audio:', uploadErr);
          setError(uploadErr instanceof Error ? uploadErr.message : 'Failed to upload audio. Please try again.');
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

      const result = await submitExam(trainerId, examSubmissionData as any);

      console.warn('Submit exam response:', result);
      console.warn('Response type:', typeof result);
      console.warn('Response keys:', result && typeof result === 'object' ? Object.keys(result) : 'N/A');

      if (result && typeof result === 'object' && 'error' in result) {
        const errorMessage = result.error as string;
        console.error('Server error:', errorMessage);
        setError(errorMessage || 'Failed to submit exam. Please try again.');
        setExamState('error');
        return;
      }

      let jobId: string | null = null;

      if (result && typeof result === 'object') {
        if ('jobId' in result && result.jobId) {
          jobId = result.jobId as string;
          console.warn('Found jobId in result.jobId:', jobId);
        } else if ('data' in result && result.data && typeof result.data === 'object' && 'jobId' in result.data) {
          jobId = result.data.jobId as string;
          console.warn('Found jobId in result.data.jobId:', jobId);
        } else if ('result' in result && result.result && typeof result.result === 'object' && 'jobId' in result.result) {
          jobId = result.result.jobId as string;
          console.warn('Found jobId in result.result.jobId:', jobId);
        } else {
          console.warn('No jobId found in response. Checking all possible fields...');
          console.warn('Available fields:', Object.keys(result));
        }
      }

      if (jobId) {
        const resultData = { jobId, timeElapsed };
        const storageKey = `translation_audio_result_${trainerId}`;
        localStorage.setItem(storageKey, JSON.stringify(resultData));
        router.push(`/vocab-trainer/${trainerId}/exam/translation-audio/result`);
      } else {
        console.error('Response does not contain jobId. Full response:', JSON.stringify(result, null, 2));
        setError('Failed to get evaluation job ID. The server response was invalid. Please check the console for details.');
        setExamState('error');
      }
    } catch (err: any) {
      console.error('Failed to submit exam:', err);

      let errorMessage = 'Failed to submit exam. Please try again.';

      if (err?.response?.data) {
        const responseData = err.response.data;
        if (typeof responseData === 'object' && 'error' in responseData) {
          errorMessage = responseData.error as string;
        } else if (typeof responseData === 'string') {
          errorMessage = responseData;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setExamState('error');
    }
  }, [canSubmit, audioBlob, fileId, timeElapsed, trainerId, router]);

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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="space-y-6 text-center">
          <Loader2 className="mx-auto h-16 w-16 animate-spin text-yellow-600 dark:text-yellow-400" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Uploading your recording...
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Please wait while we upload your audio file
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (examState === 'submitting') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="space-y-6 text-center">
          <Loader2 className="mx-auto h-16 w-16 animate-spin text-yellow-600 dark:text-yellow-400" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Submitting your exam...
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Please wait while we process your submission
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
    <div className="relative space-y-8 py-8">
      <VocabExamHeader
        trainerName={examData.name || 'Translation Audio Exam'}
        currentQuestion={1}
        totalQuestions={1}
        timeRemaining={timeRemaining}
      />

      <div className="mx-auto max-w-4xl space-y-6 px-4">
        <DialogueDisplay dialogue={dialogue} />

        <AudioRecorder onRecordingComplete={handleRecordingComplete} onReset={handleResetRecording} />

        {audioBlob && (
          <Card className="border-2 border-yellow-500/30 bg-white dark:border-yellow-400/30 dark:bg-slate-900">
            <CardContent className="p-6">
              <div className="space-y-4">
                <p className="text-center text-slate-700 dark:text-slate-300">
                  Recording complete! Submit your exam to continue.
                </p>
                <div className="flex justify-center">
                  <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className={`rounded-2xl px-8 py-3 text-lg font-semibold shadow-lg transition-all duration-300 ${
                      canSubmit
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:scale-105 hover:from-emerald-700 hover:to-teal-700 hover:shadow-emerald-500/25 dark:from-emerald-500 dark:to-teal-500 dark:hover:from-emerald-600 dark:hover:to-teal-600 dark:hover:shadow-emerald-400/25'
                        : 'bg-slate-400 text-slate-700 dark:bg-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Submit Exam
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
};

export default TranslationAudioExam;
