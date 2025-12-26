'use client';

import { Loader2, PlayCircle } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getExamUrl } from '@/constants/vocab-trainer';
import { useExamData } from '@/hooks/useExamData';

type ExamLauncherProps = {
  trainerId: string;
};

const ExamLauncher: React.FC<ExamLauncherProps> = ({ trainerId }) => {
  const [isLaunching, setIsLaunching] = useState(false);

  const { loadExamData, isLoading, generationStatus, error } = useExamData({
    trainerId,
    autoLoad: false,
    onSuccessAction: (examData) => {
      setIsLaunching(false);
      const examUrl = getExamUrl(trainerId, examData.questionType);
      globalThis.location.href = examUrl;
    },
    onErrorAction: (err) => {
      console.error('Failed to load exam:', err);
      setIsLaunching(false);
    },
  });

  const handlePlayClick = async () => {
    setIsLaunching(true);
    await loadExamData();
  };

  const isProcessing = isLaunching || isLoading;
  const isGenerating = generationStatus === 'generating';

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 rounded-lg hover:bg-green-100 dark:hover:bg-green-700"
      onClick={handlePlayClick}
      disabled={isProcessing}
      title={isGenerating ? 'Generating questions...' : error ? 'Failed to load exam' : undefined}
    >
      {isProcessing
        ? (
            <Loader2 className="h-4 w-4 animate-spin text-green-600 dark:text-green-400" />
          )
        : (
            <PlayCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          )}
    </Button>
  );
};

export default ExamLauncher;
