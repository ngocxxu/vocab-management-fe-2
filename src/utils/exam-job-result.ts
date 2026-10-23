/** How often a waiting page asks the server for the job status, in case the socket event never arrives. */
export const EXAM_JOB_POLL_INTERVAL_MS = 5000;
/** After this long without a result the page stops spinning and offers to check again. */
export const EXAM_JOB_TIMEOUT_MS = 60_000;

/** Same vocabulary as the `*-progress` socket events; `unknown` means the server no longer has the job. */
export type TExamJobStatus = 'evaluating' | 'generating' | 'completed' | 'failed' | 'unknown';

export type TExamJobProgress = {
  status: TExamJobStatus;
  data?: unknown;
  error?: string;
  completedAt?: string;
};

export type TExamJobPhase = 'loading' | 'completed' | 'failed' | 'timeout';

export type TExamJobState<TData> = {
  phase: TExamJobPhase;
  data?: TData;
  error?: string;
  completedAt?: string;
};

export const initialExamJobState = <TData>(): TExamJobState<TData> => ({ phase: 'loading' });

/**
 * Folds one piece of news about a job (socket event, status poll or cached result) into the page state.
 * `completed` and `failed` are final for a job: later news, such as a stray `evaluating`, changes nothing.
 * A `completed` whose data fails `isValid` counts as a failure, so the page never ends up blank.
 */
export const applyExamJobProgress = <TData>(
  state: TExamJobState<TData>,
  progress: TExamJobProgress,
  isValid: (data: unknown) => data is TData,
): TExamJobState<TData> => {
  if (state.phase === 'completed' || state.phase === 'failed') {
    return state;
  }

  if (progress.status === 'completed') {
    return isValid(progress.data)
      ? { phase: 'completed', data: progress.data, completedAt: progress.completedAt }
      : { phase: 'failed' };
  }

  if (progress.status === 'failed') {
    return { phase: 'failed', error: progress.error };
  }

  return state;
};

export const timeoutExamJob = <TData>(state: TExamJobState<TData>): TExamJobState<TData> =>
  state.phase === 'loading' ? { phase: 'timeout' } : state;

/** Starts waiting again after a timeout. Never re-submits the exam. */
export const retryExamJob = <TData>(state: TExamJobState<TData>): TExamJobState<TData> =>
  state.phase === 'timeout' ? { phase: 'loading' } : state;
