'use client';

import { PlayCircle } from '@solar-icons/react/ssr';
import { useRouter } from 'next/navigation';
import React, { useEffect, useReducer } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getExamUrl } from '@/constants/vocab-trainer';
import { EQuestionType } from '@/enum/vocab-trainer';
import type { ExamLauncherProps } from '@/types/vocab-trainer';
import { getExamCooldownRemainingSeconds, markExamCooldownNow } from '@/utils/exam-cooldown';

const ExamLauncher: React.FC<ExamLauncherProps> = ({ trainerId, questionType }) => {
  const router = useRouter();
  const [, forceTick] = useReducer((value: number) => value + 1, 0);

  const isFlipCard = questionType === EQuestionType.FLIP_CARD;
  const isDisabled = !isFlipCard && getExamCooldownRemainingSeconds() > 0;

  useEffect(() => {
    if (isFlipCard) {
      return;
    }

    const interval = setInterval(forceTick, 1000);

    return () => clearInterval(interval);
  }, [isFlipCard]);

  const handlePlayClick = () => {
    if (!trainerId || isDisabled) {
      return;
    }

    if (!isFlipCard) {
      markExamCooldownNow();
      forceTick();
    }

    const examUrl = getExamUrl(trainerId, questionType);
    router.push(examUrl);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-green-100 dark:hover:bg-green-700"
            onClick={handlePlayClick}
            disabled={isDisabled}
          >
            <PlayCircle size={16} weight="BoldDuotone" className="text-green-600 dark:text-green-400" />
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="center">
        {isDisabled ? 'Please wait before starting another exam' : 'Start exam'}
      </TooltipContent>
    </Tooltip>
  );
};

export default ExamLauncher;
