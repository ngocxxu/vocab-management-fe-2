'use client';

import { PlayCircle } from '@solar-icons/react/ssr';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useEffect, useReducer } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getExamUrl } from '@/constants/vocab-trainer';
import { EQuestionType, ETrainerMode } from '@/enum/vocab-trainer';
import type { ExamLauncherProps } from '@/types/vocab-trainer';
import { getExamCooldownRemainingSeconds, markExamCooldownNow } from '@/utils/exam-cooldown';

const ExamLauncher: React.FC<ExamLauncherProps> = ({ trainerId, questionType, mode }) => {
  const t = useTranslations('trainer.launcher');
  const router = useRouter();
  const [, forceTick] = useReducer((value: number) => value + 1, 0);

  // Reviews are short and meant to be done every day, so neither flip cards nor spaced repetition wait for the exam cooldown.
  const isFsrs = mode === ETrainerMode.FSRS;
  const isFlipCard = isFsrs || questionType === EQuestionType.FLIP_CARD;
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

    router.push(isFsrs ? `/vocab-trainer/${trainerId}/review` : getExamUrl(trainerId, questionType));
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-success/15"
            onClick={handlePlayClick}
            disabled={isDisabled}
          >
            <PlayCircle size={16} weight="BoldDuotone" className="text-success" />
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="center">
        {isDisabled ? t('waitBeforeExam') : isFsrs ? t('startReview') : t('startExam')}
      </TooltipContent>
    </Tooltip>
  );
};

export default ExamLauncher;
