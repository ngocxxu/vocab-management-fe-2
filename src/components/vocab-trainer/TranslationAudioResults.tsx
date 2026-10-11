'use client';

import type { TranslationAudioResultsProps } from '@/types/vocab-trainer';
import { AltArrowLeft, CheckCircle, ClockCircle } from '@solar-icons/react/ssr';
import { useTranslations } from 'next-intl';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MarkdownReport from './MarkdownReport';

const TranslationAudioResults: React.FC<TranslationAudioResultsProps> = ({
  trainerId,
  transcript,
  markdownReport,
  timeElapsed,
  onBackToTrainers,
}) => {
  const t = useTranslations('trainer.audioResults');
  const tShared = useTranslations('shared');

  const handleBackToTrainers = () => {
    const storageKey = `exam_data_${trainerId}`;
    localStorage.removeItem(storageKey);
    onBackToTrainers();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background px-4 py-4 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl space-y-5 sm:space-y-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Card className="border border-border bg-card">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle size={32} weight="BoldDuotone" className="text-success" />
                <CardTitle className="text-3xl font-bold text-foreground">
                  {t('evaluationComplete')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-xl border border-border bg-muted p-4 text-center">
                <div className="mb-2 flex items-center justify-center gap-2 text-muted-foreground">
                  <ClockCircle size={20} weight="BoldDuotone" />
                  <span className="text-sm font-medium">{t('timeTaken')}</span>
                </div>
                <p className="font-mono text-2xl font-bold text-foreground">
                  {formatTime(timeElapsed)}
                </p>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleBackToTrainers}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <AltArrowLeft size={20} weight="BoldDuotone" className="mr-2" />
                  {tShared('backToTrainers')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {transcript && (
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground">
                  {t('transcript')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{transcript}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {markdownReport && (
          <MarkdownReport markdown={markdownReport} />
        )}
      </div>
    </div>
  );
};

export default TranslationAudioResults;
