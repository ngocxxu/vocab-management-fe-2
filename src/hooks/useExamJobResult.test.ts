// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EXAM_JOB_TIMEOUT_MS } from '@/utils/exam-job-result';
import { useExamJobResult } from './useExamJobResult';

const { getExamJobStatus, socketHookMock } = vi.hoisted(() => ({
  getExamJobStatus: vi.fn(),
  socketHookMock: vi.fn(() => ({ socket: null, isConnected: false })),
}));

vi.mock('@/actions', () => ({ getExamJobStatus }));
vi.mock('@/hooks/useSocket', () => ({ useSocket: socketHookMock }));
vi.mock('@/libs/Logger', () => ({ logger: { warn: vi.fn() } }));

type TResult = { results: unknown[] };

const isResult = (data: unknown): data is TResult => typeof data === 'object' && data !== null && Array.isArray((data as TResult).results);

const renderWaiter = (jobId: string | null) =>
  renderHook(
    ({ id }: { id: string | null }) =>
      useExamJobResult<TResult>({
        trainerId: 'trainer-1',
        jobId: id,
        socketEvent: 'test-progress',
        isValid: isResult,
        readCached: () => null,
        writeCached: vi.fn(),
      }),
    { initialProps: { id: jobId } },
  );

/** Lets the first status poll (a resolved promise) finish. */
const flushPoll = async () => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
};

describe('useExamJobResult', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    getExamJobStatus.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the check-later phase at once when the server no longer knows the job', async () => {
    getExamJobStatus.mockResolvedValue({ status: 'unknown' });

    const { result } = renderWaiter('job-1');
    await flushPoll();

    expect(result.current.state.phase).toBe('timeout');
    expect(getExamJobStatus).toHaveBeenCalledTimes(1);
  });

  it('shows the check-later phase after the timeout while the job is still evaluating', async () => {
    getExamJobStatus.mockResolvedValue({ status: 'evaluating' });

    const { result } = renderWaiter('job-1');
    await flushPoll();
    expect(result.current.state.phase).toBe('loading');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(EXAM_JOB_TIMEOUT_MS);
    });

    expect(result.current.state.phase).toBe('timeout');
  });

  it('never reopens a failed job on its own', async () => {
    getExamJobStatus.mockResolvedValue({ status: 'failed', error: 'AI down' });

    const { result } = renderWaiter('job-1');
    await flushPoll();
    expect(result.current.state).toEqual({ phase: 'failed', error: 'AI down' });
    const callsAfterFailure = getExamJobStatus.mock.calls.length;

    await act(async () => {
      await vi.advanceTimersByTimeAsync(EXAM_JOB_TIMEOUT_MS * 2);
    });

    expect(result.current.state.phase).toBe('failed');
    expect(getExamJobStatus).toHaveBeenCalledTimes(callsAfterFailure);
  });

  it('waits for the regrade job once the user retries with its new job id', async () => {
    getExamJobStatus.mockResolvedValueOnce({ status: 'failed', error: 'AI down' });
    getExamJobStatus.mockResolvedValue({ status: 'evaluating' });

    const { result, rerender } = renderWaiter('job-1');
    await flushPoll();
    expect(result.current.state.phase).toBe('failed');

    rerender({ id: 'job-2' });
    act(() => {
      result.current.retry();
    });
    await flushPoll();

    expect(result.current.state.phase).toBe('loading');
    expect(getExamJobStatus).toHaveBeenLastCalledWith('trainer-1', 'job-2');
  });
});
