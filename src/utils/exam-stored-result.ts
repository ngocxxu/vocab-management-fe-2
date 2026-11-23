import { logger } from '@/libs/Logger';
import type { TGradingStatus, TVocabTrainer, TWordResults } from '@/types/vocab-trainer';

/** This browser's pointer to a job it started. It only tells a result page which job to wait for. */
export type TJobPointer = { jobId: string | null; timeElapsed: number | null };

/** Reads the job pointer a page saved under `storageKey`. Unreadable data gives no job, never a throw. */
export const readJobPointer = (storageKey: string): TJobPointer => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return { jobId: null, timeElapsed: null };
    }

    const parsed = JSON.parse(raw) as { jobId?: unknown; timeElapsed?: unknown };
    return {
      jobId: typeof parsed.jobId === 'string' ? parsed.jobId : null,
      timeElapsed: typeof parsed.timeElapsed === 'number' ? parsed.timeElapsed : null,
    };
  } catch (error) {
    logger.warn('Could not read the saved job pointer', { error, storageKey });
    return { jobId: null, timeElapsed: null };
  }
};

export type TStoredAudioResult = { transcript: string; markdownReport?: string };

/** What the translation-audio result page shows, read from the trainer that the backend returns. */
export type TStoredAudioState
  = | { phase: 'graded'; result: TStoredAudioResult }
    | { phase: 'grading'; jobId: string | null }
    | { phase: 'failed' }
    | { phase: 'none' };

/** The audio result row is the one whose `data` has a transcript. Returns null when the trainer has no audio result. */
export const readStoredAudioResult = (results: TWordResults[] | undefined): TStoredAudioResult | null => {
  const row = results?.find(item => typeof item.data?.transcript === 'string');
  const transcript = row?.data?.transcript;
  if (transcript === undefined) {
    return null;
  }

  return { transcript, markdownReport: row?.data?.markdownReport };
};

/**
 * Decides what the audio result page shows. `liveJobId` is only the handle of a job this browser started, used to wait for it.
 * The result itself always comes from the trainer.
 */
export const resolveStoredAudioState = (trainer: TVocabTrainer, liveJobId: string | null): TStoredAudioState => {
  const gradingStatus: TGradingStatus | null | undefined = trainer.gradingStatus;
  if (gradingStatus === 'grading') {
    return { phase: 'grading', jobId: liveJobId };
  }
  if (gradingStatus === 'grading_failed') {
    return { phase: 'failed' };
  }

  const result = readStoredAudioResult(trainer.results);
  return result ? { phase: 'graded', result } : { phase: 'none' };
};

/** One graded question of a fill-in-blank submit, as the backend stored it. */
export type TStoredFillInBlankRow = {
  id?: string;
  status: string;
  userSelected: string;
  systemSelected: string;
  explanation?: string;
  /** The question text. Null when the row has none (graded before the text was stored): the page shows a fallback, never a guess. */
  content: string | null;
};

export type TStoredFillInBlankState
  = | { phase: 'graded'; rows: TStoredFillInBlankRow[]; completedAt?: string }
    | { phase: 'grading'; jobId: string | null }
    | { phase: 'failed' }
    | { phase: 'none' };

/** Maps the stored result rows of a fill-in-blank trainer. A row without `content` gets null. */
export const toStoredFillInBlankRows = (results: TWordResults[] | undefined): TStoredFillInBlankRow[] =>
  (results ?? []).map(row => ({
    id: row.id,
    status: row.status,
    userSelected: row.userSelected,
    systemSelected: row.systemSelected,
    explanation: row.data?.explanation,
    content: typeof row.data?.content === 'string' ? row.data.content : null,
  }));

/**
 * Decides what the fill-in-blank result page shows. `liveJobId` is only the handle of a job this browser started, used to wait for it.
 * The rows, and the question text in them, always come from the trainer.
 */
export const resolveStoredFillInBlankState = (trainer: TVocabTrainer, liveJobId: string | null): TStoredFillInBlankState => {
  const gradingStatus: TGradingStatus | null | undefined = trainer.gradingStatus;
  if (gradingStatus === 'grading') {
    return { phase: 'grading', jobId: liveJobId };
  }
  if (gradingStatus === 'grading_failed') {
    return { phase: 'failed' };
  }

  const results: TWordResults[] | undefined = trainer.results;
  const rows = toStoredFillInBlankRows(results);
  if (rows.length === 0) {
    return { phase: 'none' };
  }

  return { phase: 'graded', rows, completedAt: results?.find(row => row.createdAt)?.createdAt };
};
