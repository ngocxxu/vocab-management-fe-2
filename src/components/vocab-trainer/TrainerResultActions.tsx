'use client';

import { Eye } from '@solar-icons/react/ssr';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { regradeVocabTrainerExam } from '@/actions/vocab-trainers';
import { getStoredResultUrl } from '@/constants/vocab-trainer';
import { ETrainerMode } from '@/enum/vocab-trainer';
import { logger } from '@/libs/Logger';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import type { TVocabTrainer } from '@/types/vocab-trainer';
import { getRegradeOptions } from '@/utils/exam-regrade';

type TrainerResultActionsProps = {
  trainer: TVocabTrainer;
};

/**
 * Row actions for AI-graded trainers. Preview opens a saved result (translation audio, fill-in-blank). A failed grading shows the badge and Chấm lại.
 */
const TrainerResultActions: React.FC<TrainerResultActionsProps> = ({ trainer }) => {
  const t = useTranslations('trainer.regrade');
  const router = useRouter();
  const [isBusy, setIsBusy] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (trainer.mode === ETrainerMode.FSRS) {
    return null;
  }

  const gradingStatus = trainer.gradingStatus ?? null;
  const isFailed = gradingStatus === 'grading_failed';
  const regrade = getRegradeOptions({ gradingStatus, regradeCount: trainer.regradeCount ?? 0 });
  const previewUrl = getStoredResultUrl(trainer.id, trainer.questionType);
  const canPreview = previewUrl !== null && gradingStatus === 'graded';

  if (!isFailed && !canPreview) {
    return null;
  }

  const handleRegrade = async () => {
    setIsBusy(true);
    try {
      await regradeVocabTrainerExam(trainer.id);
      toast.success(t('started'));
      startTransition(() => router.refresh());
    } catch (error) {
      logger.warn('Regrade from the list failed', { error, trainerId: trainer.id });
      toast.error(t('error'));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {canPreview && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg hover:bg-accent"
          aria-label={t('preview')}
          title={t('preview')}
          onClick={() => router.push(previewUrl)}
        >
          <Eye size={16} weight="BoldDuotone" className="text-primary" />
        </Button>
      )}
      {isFailed && (
        <>
          <Badge variant="destructive">{t('badge')}</Badge>
          <Button
            variant="outline"
            size="sm"
            disabled={!regrade.canRegrade || isBusy || isPending}
            title={regrade.isExhausted ? t('exhausted') : undefined}
            onClick={() => void handleRegrade()}
          >
            {t('button')}
          </Button>
        </>
      )}
    </div>
  );
};

export default TrainerResultActions;
