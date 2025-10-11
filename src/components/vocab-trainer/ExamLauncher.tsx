'use client';

import { Loader2, PlayCircle } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useExamData } from '@/hooks/useExamData';

type ExamLauncherProps = {
  trainerId: string;
};

const ExamLauncher: React.FC<ExamLauncherProps> = ({ trainerId }) => {
  const [isLaunching, setIsLaunching] = useState(false);

  const { loadExamData } = useExamData({
    trainerId,
    autoLoad: false, // Don't auto-load, only load when button is clicked
    onSuccessAction: () => {
      // Exam data loaded successfully, navigate to exam page
      setIsLaunching(false);

      // Use window.location.href to avoid RSC cache issues
      window.location.href = `/vocab-trainer/${trainerId}/exam`;
    },
    onErrorAction: (error) => {
      // Exam data failed to load, stay on list page
      console.error('Failed to load exam:', error);
      setIsLaunching(false);
      // You could show a toast notification here
    },
  });

  const handlePlayClick = async () => {
    setIsLaunching(true);
    await loadExamData();
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 rounded-lg hover:bg-green-100 dark:hover:bg-green-700"
      onClick={handlePlayClick}
      disabled={isLaunching}
    >
      {isLaunching
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
