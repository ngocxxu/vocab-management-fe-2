'use client';

import type { EQuestionType } from '@/enum/vocab-trainer';
import { PlayCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { Button } from '@/components/ui/button';
import { getExamUrl } from '@/constants/vocab-trainer';
import { useExamData } from '@/hooks/useExamData';

type ExamLauncherProps = {
  trainerId: string;
  questionType: EQuestionType;
};

const ExamLauncher: React.FC<ExamLauncherProps> = ({ trainerId, questionType }) => {
  const router = useRouter();
  const { loadExamData } = useExamData({
    trainerId,
    autoLoad: false,
  });

  const handlePlayClick = () => {
    if (!trainerId) {
      return;
    }

    const examUrl = getExamUrl(trainerId, questionType);
    router.push(examUrl);

    loadExamData().catch((err) => {
      console.error('Failed to load exam data in background:', err);
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 rounded-lg hover:bg-green-100 dark:hover:bg-green-700"
      onClick={handlePlayClick}
      title="Start exam"
    >
      <PlayCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
    </Button>
  );
};

export default ExamLauncher;
