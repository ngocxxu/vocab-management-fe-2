import { describe, expect, it } from 'vitest';
import { applyExamJobProgress, initialExamJobState, retryExamJob, timeoutExamJob } from './exam-job-result';
import type { TExamJobState } from './exam-job-result';

type TGrading = { results: { status: string }[] };

const hasResults = (data: unknown): data is TGrading =>
  typeof data === 'object' && data !== null && Array.isArray((data as TGrading).results) && (data as TGrading).results.length > 0;

const loading = (): TExamJobState<TGrading> => initialExamJobState<TGrading>();

describe('applyExamJobProgress', () => {
  it('keeps waiting while the job is evaluating', () => {
    const state = applyExamJobProgress(loading(), { status: 'evaluating' }, hasResults);

    expect(state.phase).toBe('loading');
  });

  it('keeps waiting when the server no longer knows the job', () => {
    expect(applyExamJobProgress(loading(), { status: 'unknown' }, hasResults).phase).toBe('loading');
  });

  it('completes with the data when the job completed', () => {
    const data = { results: [{ status: 'PASSED' }] };

    const state = applyExamJobProgress(loading(), { status: 'completed', data, completedAt: '2026-01-01T00:00:00.000Z' }, hasResults);

    expect(state).toEqual({ phase: 'completed', data, completedAt: '2026-01-01T00:00:00.000Z' });
  });

  it('fails instead of rendering a blank page when the completed data is empty', () => {
    expect(applyExamJobProgress(loading(), { status: 'completed', data: { results: [] } }, hasResults)).toEqual({ phase: 'failed' });
  });

  it('fails instead of rendering a blank page when the completed data is missing', () => {
    expect(applyExamJobProgress(loading(), { status: 'completed' }, hasResults).phase).toBe('failed');
  });

  it('fails with the reason the job gave', () => {
    expect(applyExamJobProgress(loading(), { status: 'failed', error: 'AI timed out' }, hasResults)).toEqual({ phase: 'failed', error: 'AI timed out' });
  });

  it('ignores a late evaluating event once the job completed', () => {
    const completed = applyExamJobProgress(loading(), { status: 'completed', data: { results: [{ status: 'PASSED' }] } }, hasResults);

    const after = applyExamJobProgress(completed, { status: 'evaluating' }, hasResults);

    expect(after).toBe(completed);
  });

  it('ignores a completed event after the job failed', () => {
    const failed = applyExamJobProgress(loading(), { status: 'failed', error: 'x' }, hasResults);

    const after = applyExamJobProgress(failed, { status: 'completed', data: { results: [{ status: 'PASSED' }] } }, hasResults);

    expect(after).toBe(failed);
  });

  it('still accepts the result when it arrives after the timeout', () => {
    const timedOut = timeoutExamJob(loading());

    const after = applyExamJobProgress(timedOut, { status: 'completed', data: { results: [{ status: 'PASSED' }] } }, hasResults);

    expect(after.phase).toBe('completed');
  });
});

describe('timeoutExamJob', () => {
  it('stops the spinner when nothing arrived in time', () => {
    expect(timeoutExamJob(loading()).phase).toBe('timeout');
  });

  it('does not override a result that already arrived', () => {
    const completed = applyExamJobProgress(loading(), { status: 'completed', data: { results: [{ status: 'PASSED' }] } }, hasResults);

    expect(timeoutExamJob(completed)).toBe(completed);
  });
});

describe('retryExamJob', () => {
  it('goes back to waiting after a timeout', () => {
    expect(retryExamJob(timeoutExamJob(loading())).phase).toBe('loading');
  });

  it('does not reopen a failed job', () => {
    const failed = applyExamJobProgress(loading(), { status: 'failed' }, hasResults);

    expect(retryExamJob(failed)).toBe(failed);
  });
});
