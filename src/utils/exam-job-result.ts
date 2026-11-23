/** How often a waiting page asks the server for the job status, in case the socket event never arrives. */
export const EXAM_JOB_POLL_INTERVAL_MS = 5000;
/** After this long without a result the page stops spinning and offers to check the list later. This is not an error. */
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

/** Moves a waiting page to the "check the list later" phase. Only `loading` changes. */
export const timeoutExamJob = <TData>(state: TExamJobState<TData>): TExamJobState<TData> =>
  state.phase === 'loading' ? { phase: 'timeout' } : state;

/**
 * Folds one piece of news about a job (socket event, status poll or cached result) into the page state.
 * `completed` and `failed` are final for a job: later news, such as a stray `evaluating`, changes nothing.
 * A `completed` whose data fails `isValid` counts as a failure, so the page never ends up blank.
 * `unknown` while waiting means the server cannot find the job, so the page stops waiting at once.
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

  if (progress.status === 'unknown') {
    return timeoutExamJob(state);
  }

  return state;
};

/**
 * Starts waiting again. Only the user calls this: after a timeout (same job), or after a failure once the regrade has
 * started a new job. A failed job is never reopened on its own, so set the new `jobId` before calling it.
 */
export const retryExamJob = <TData>(state: TExamJobState<TData>): TExamJobState<TData> =>
  state.phase === 'timeout' || state.phase === 'failed' ? { phase: 'loading' } : state;
