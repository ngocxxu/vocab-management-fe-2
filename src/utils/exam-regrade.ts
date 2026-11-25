import { logger } from '@/libs/Logger';
import type { TGradingStatus } from '@/types/vocab-trainer';

/** Regrades allowed for one submit. Keep in sync with REGRADE_LIMIT in the backend (vocab-trainer/utils/attempt-snapshot.util.ts). */
export const REGRADE_LIMIT = 2;

export type TRegradeOptions = {
  /** The latest submit failed and at least one regrade is left. */
  canRegrade: boolean;
  /** The latest submit failed and no regrade is left. */
  isExhausted: boolean;
  /** Regrades left for a failed submit. 0 for any other grading state. */
  remaining: number;
};

export const getRegradeOptions = ({ gradingStatus, regradeCount }: { gradingStatus: TGradingStatus | null; regradeCount: number }): TRegradeOptions => {
  if (gradingStatus !== 'grading_failed') {
    return { canRegrade: false, isExhausted: false, remaining: 0 };
  }

  const remaining = Math.max(0, REGRADE_LIMIT - regradeCount);
  return { canRegrade: remaining > 0, isExhausted: remaining === 0, remaining };
};

/**
 * Points the saved job pointer of a result page at the regrade job, so a reload waits for the regrade and not the failed job.
 * Keeps the other saved fields as they are.
 */
export const replaceStoredJobId = (storageKey: string, jobId: string): void => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return;
    }

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) {
      return;
    }

    localStorage.setItem(storageKey, JSON.stringify({ ...parsed, jobId }));
  } catch (error) {
    logger.warn('Could not save the regrade job id', { error, storageKey });
  }
};
