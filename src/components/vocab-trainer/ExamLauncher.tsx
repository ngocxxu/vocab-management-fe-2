'use client';

import { PlayCircle } from '@solar-icons/react/ssr';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getExamUrl } from '@/constants/vocab-trainer';
import { EQuestionType } from '@/enum/vocab-trainer';

type ExamLauncherProps = {
  trainerId: string;
  questionType: EQuestionType;
};

const COOLDOWN_DURATION_MS = 60000;
const GLOBAL_STORAGE_KEY = 'play_button_last_click_global';

const ExamLauncher: React.FC<ExamLauncherProps> = ({ trainerId, questionType }) => {
  const router = useRouter();
  const [isDisabled, setIsDisabled] = useState(false);

  const isFlipCard = questionType === EQuestionType.FLIP_CARD;

  const checkCooldown = useCallback(() => {
    if (isFlipCard) {
      setIsDisabled(false);
      return;
    }

    try {
      const lastClickTimeStr = localStorage.getItem(GLOBAL_STORAGE_KEY);
      if (!lastClickTimeStr) {
        setIsDisabled(false);
        return;
      }

      const lastClickTime = Number.parseInt(lastClickTimeStr, 10);
      if (Number.isNaN(lastClickTime)) {
        localStorage.removeItem(GLOBAL_STORAGE_KEY);
        setIsDisabled(false);
        return;
      }

      const now = Date.now();
      const timeSinceLastClick = now - lastClickTime;
      setIsDisabled(timeSinceLastClick < COOLDOWN_DURATION_MS);
    } catch (error) {
      console.error('Error checking cooldown:', error);
      setIsDisabled(false);
    }
  }, [isFlipCard]);

  useEffect(() => {
    checkCooldown();

    if (isFlipCard) {
      return;
    }

    const interval = setInterval(() => {
      checkCooldown();
    }, 1000);

    return () => clearInterval(interval);
  }, [checkCooldown, isFlipCard, questionType]);

  const handlePlayClick = () => {
    if (!trainerId || isDisabled) {
      return;
    }

    if (!isFlipCard) {
      try {
        localStorage.setItem(GLOBAL_STORAGE_KEY, Date.now().toString());
        setIsDisabled(true);
      } catch (error) {
        console.error('Error saving cooldown timestamp:', error);
      }
    }

    const examUrl = getExamUrl(trainerId, questionType);
    router.push(examUrl);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 rounded-lg hover:bg-green-100 dark:hover:bg-green-700"
      onClick={handlePlayClick}
      disabled={isDisabled}
      title={isDisabled ? 'Please wait before starting another exam' : 'Start exam'}
    >
      <PlayCircle size={16} weight="BoldDuotone" className="text-green-600 dark:text-green-400" />
    </Button>
  );
};

export default ExamLauncher;
