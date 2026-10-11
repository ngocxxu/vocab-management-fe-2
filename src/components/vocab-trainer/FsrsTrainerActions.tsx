'use client';

import type { TVocabTrainer } from '@/types/vocab-trainer';
import { Chart } from '@solar-icons/react/ssr';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React from 'react';
import { Button } from '@/shared/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { ETrainerMode } from '@/enum/vocab-trainer';
import { isCycleEnded } from '@/utils/fsrs-review';
import ExamLauncher from './ExamLauncher';

type FsrsTrainerActionsProps = Readonly<{
  trainer: TVocabTrainer;
  /** Opens the edit dialog, where the deadline can be moved. */
  onExtend: (trainer: TVocabTrainer) => void;
  /** Opens the dialog that starts a new cycle from this trainer. */
  onStartNewCycle: (trainer: TVocabTrainer) => void;
}>;

/** Review, or Extend and New cycle once the cycle has ended, and the Stats page. */
const FsrsTrainerActions: React.FC<FsrsTrainerActionsProps> = ({ trainer, onExtend, onStartNewCycle }) => {
  const t = useTranslations('trainer.fsrs.actions');
  const ended = isCycleEnded(trainer.fsrsEndsAt, new Date());

  return (
    <>
      {ended
        ? (
            <>
              <Button type="button" variant="outline" size="sm" className="h-8 rounded-lg" onClick={() => onExtend(trainer)}>{t('extend')}</Button>
              <Button type="button" size="sm" className="h-8 rounded-lg" onClick={() => onStartNewCycle(trainer)}>{t('newCycle')}</Button>
            </>
          )
        : <ExamLauncher trainerId={trainer.id} questionType={trainer.questionType} mode={ETrainerMode.FSRS} />}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-accent">
            <Link href={`/vocab-trainer/${trainer.id}/stats`} aria-label={t('statsOf', { name: trainer.name })}>
              <Chart size={16} weight="BoldDuotone" className="text-muted-foreground" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="center">{t('stats')}</TooltipContent>
      </Tooltip>
    </>
  );
};

export default FsrsTrainerActions;
