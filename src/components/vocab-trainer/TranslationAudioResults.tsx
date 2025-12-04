'use client';

import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MarkdownReport from './MarkdownReport';

type TranslationAudioResultsProps = {
  trainerId: string;
  transcript?: string;
  markdownReport?: string;
  timeElapsed: number;
  onBackToTrainers: () => void;
};

const TranslationAudioResults: React.FC<TranslationAudioResultsProps> = ({
  trainerId,
  transcript,
  markdownReport,
  timeElapsed,
  onBackToTrainers,
}) => {
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
    <div className="relative space-y-8 py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Card className="border-2 border-yellow-500/30 bg-white backdrop-blur-sm dark:border-yellow-400/30 dark:bg-slate-900">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">
                  Evaluation Complete!
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-2xl border border-yellow-500/30 bg-white p-4 text-center dark:border-yellow-400/30 dark:bg-slate-900">
                <div className="mb-2 flex items-center justify-center space-x-2 text-slate-600 dark:text-slate-300">
                  <Clock className="h-5 w-5" />
                  <span className="text-sm font-medium">Time Taken</span>
                </div>
                <p className="font-mono text-2xl font-bold text-slate-900 dark:text-white">
                  {formatTime(timeElapsed)}
                </p>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleBackToTrainers}
                  className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-emerald-700 hover:to-teal-700 hover:shadow-emerald-500/25 dark:from-emerald-500 dark:to-teal-500 dark:hover:from-emerald-600 dark:hover:to-teal-600 dark:hover:shadow-emerald-400/25"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back to Trainers
                </Button>
              </div>
            </CardContent>
          </Card>

          {transcript && (
            <Card className="border-2 border-yellow-500/30 bg-white backdrop-blur-sm dark:border-yellow-400/30 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">
                  Your Transcript
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 dark:text-slate-300">{transcript}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {markdownReport && (
        <div className="mx-auto max-w-6xl px-4">
          <MarkdownReport markdown={markdownReport} />
        </div>
      )}
    </div>
  );
};

export default TranslationAudioResults;
