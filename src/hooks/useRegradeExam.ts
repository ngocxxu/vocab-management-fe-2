'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { regradeVocabTrainerExam, reloadVocabTrainer } from '@/actions/vocab-trainers';
import { logger } from '@/libs/Logger';
import type { TGradingStatus } from '@/types/vocab-trainer';
import { getRegradeOptions } from '@/utils/exam-regrade';
import type { TRegradeOptions } from '@/utils/exam-regrade';

type TSubmitStatus = { gradingStatus: TGradingStatus | null; regradeCount: number };

export type TUseRegradeExamOptions = {
  trainerId: string;
  /** Reads the grading status from the backend while true, e.g. on a failed screen. */
  active: boolean;
  /** Called with the regrade job id once the backend accepted the regrade. */
  onStarted: (jobId: string) => void;
};

export type TUseRegradeExamResult = TRegradeOptions & {
  /** False until the grading status has been read. */
  isLoaded: boolean;
  /** True while the regrade request is being sent. */
  isBusy: boolean;
  regrade: () => Promise<void>;
};

/**
 * Regrade of a failed AI grading. Only a user tap starts it. The remaining count comes from the backend, never from a guess.
 */
export const useRegradeExam = ({ trainerId, active, onStarted }: TUseRegradeExamOptions): TUseRegradeExamResult => {
  const t = useTranslations('trainer.regrade');
  const [status, setStatus] = useState<TSubmitStatus>({ gradingStatus: null, regradeCount: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    if (!active) {
      return;
    }

    let cancelled = false;
    reloadVocabTrainer(trainerId)
      .then((outcome) => {
        if (cancelled) {
          return;
        }
        setStatus(outcome.kind === 'found'
          ? { gradingStatus: outcome.trainer.gradingStatus ?? null, regradeCount: outcome.trainer.regradeCount ?? 0 }
          : { gradingStatus: null, regradeCount: 0 });
        setIsLoaded(true);
      })
      .catch((error: unknown) => {
        logger.warn('Reading the grading status failed', { error, trainerId });
        if (!cancelled) {
          setIsLoaded(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [active, trainerId]);

  const regrade = useCallback(async () => {
    setIsBusy(true);
    try {
      const trainer = await regradeVocabTrainerExam(trainerId);
      if (!trainer.jobId) {
        throw new Error('The regrade did not return a job id');
      }
      setStatus({ gradingStatus: 'grading', regradeCount: trainer.regradeCount ?? 0 });
      toast.success(t('started'));
      onStarted(trainer.jobId);
    } catch (error) {
      logger.warn('Regrade failed', { error, trainerId });
      toast.error(t('error'));
    } finally {
      setIsBusy(false);
    }
  }, [trainerId, onStarted, t]);

  return { ...getRegradeOptions(status), isLoaded, isBusy, regrade };
};
