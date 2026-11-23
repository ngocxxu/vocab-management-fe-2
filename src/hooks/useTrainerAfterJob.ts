'use client';

import { useCallback, useEffect, useState } from 'react';
import { reloadVocabTrainer } from '@/actions/vocab-trainers';
import { logger } from '@/libs/Logger';
import type { TVocabTrainer } from '@/types/vocab-trainer';

type TTrainerAfterJobPhase = 'waiting' | 'gone' | 'loaded' | 'unavailable';

type TTrainerAfterJob = {
  phase: TTrainerAfterJobPhase;
  /** Set only when `phase` is `loaded`. */
  trainer: TVocabTrainer | null;
  /** True while the reminder question is pending and the user has not closed it. */
  isPromptOpen: boolean;
  /** Closes the question without answering. It stays pending on the backend. */
  dismissPrompt: () => void;
  /** Replaces the trainer with the one the backend returned after an answer. */
  onTrainerChange: (trainer: TVocabTrainer) => void;
};

type TSettled
  = | { phase: 'gone' }
    | { phase: 'loaded'; trainer: TVocabTrainer }
    | { phase: 'unavailable' };

/**
 * Reloads the trainer once its AI job is done.
 * - `gone`: the backend removed the trainer because its cycle is complete. The page goes back to the list.
 * - `loaded`: the trainer is there. Its pending reminder question opens over the results.
 * - `unavailable`: the reload failed for another reason. The results still show, without the question.
 */
export function useTrainerAfterJob(trainerId: string, jobDone: boolean): TTrainerAfterJob {
  const [settled, setSettled] = useState<TSettled | null>(null);
  const [isPromptDismissed, setIsPromptDismissed] = useState(false);

  useEffect(() => {
    if (!jobDone) {
      return;
    }
    let cancelled = false;

    reloadVocabTrainer(trainerId)
      .then((outcome) => {
        if (!cancelled) {
          setSettled(outcome.kind === 'gone' ? { phase: 'gone' } : { phase: 'loaded', trainer: outcome.trainer });
        }
      })
      .catch((error: unknown) => {
        logger.warn('Reloading the trainer after its AI job failed', { error, trainerId });
        if (!cancelled) {
          setSettled({ phase: 'unavailable' });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [jobDone, trainerId]);

  const dismissPrompt = useCallback(() => setIsPromptDismissed(true), []);
  const onTrainerChange = useCallback((trainer: TVocabTrainer) => setSettled({ phase: 'loaded', trainer }), []);

  if (!jobDone || settled === null) {
    return { phase: 'waiting', trainer: null, isPromptOpen: false, dismissPrompt, onTrainerChange };
  }
  if (settled.phase !== 'loaded') {
    return { phase: settled.phase, trainer: null, isPromptOpen: false, dismissPrompt, onTrainerChange };
  }

  return {
    phase: 'loaded',
    trainer: settled.trainer,
    isPromptOpen: settled.trainer.reminderPromptPending && !isPromptDismissed,
    dismissPrompt,
    onTrainerChange,
  };
}
