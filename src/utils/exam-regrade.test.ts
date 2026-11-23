// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getRegradeOptions, REGRADE_LIMIT, replaceStoredJobId } from './exam-regrade';

const { logWarn } = vi.hoisted(() => ({ logWarn: vi.fn() }));

vi.mock('@/libs/Logger', () => ({ logger: { warn: logWarn } }));

describe('getRegradeOptions', () => {
  it('allows the regrade limit to be two', () => {
    expect(REGRADE_LIMIT).toBe(2);
  });

  it('offers a regrade with the full count left after a failed grading', () => {
    expect(getRegradeOptions({ gradingStatus: 'grading_failed', regradeCount: 0 })).toEqual({ canRegrade: true, isExhausted: false, remaining: 2 });
  });

  it('counts down the regrades that are left', () => {
    expect(getRegradeOptions({ gradingStatus: 'grading_failed', regradeCount: 1 })).toEqual({ canRegrade: true, isExhausted: false, remaining: 1 });
  });

  it('says no regrade is left once the limit is used', () => {
    expect(getRegradeOptions({ gradingStatus: 'grading_failed', regradeCount: 2 })).toEqual({ canRegrade: false, isExhausted: true, remaining: 0 });
  });

  it('offers nothing while the grading runs or after it succeeded', () => {
    expect(getRegradeOptions({ gradingStatus: 'grading', regradeCount: 0 })).toEqual({ canRegrade: false, isExhausted: false, remaining: 0 });
    expect(getRegradeOptions({ gradingStatus: 'graded', regradeCount: 0 })).toEqual({ canRegrade: false, isExhausted: false, remaining: 0 });
  });

  it('offers nothing when the trainer has no AI-graded submit', () => {
    expect(getRegradeOptions({ gradingStatus: null, regradeCount: 0 })).toEqual({ canRegrade: false, isExhausted: false, remaining: 0 });
  });
});

describe('replaceStoredJobId', () => {
  beforeEach(() => {
    localStorage.clear();
    logWarn.mockReset();
  });

  it('points the saved entry at the new job and keeps the other fields', () => {
    localStorage.setItem('fill_in_blank_result_t1', JSON.stringify({ jobId: 'job-old', timeElapsed: 42, answers: [[0, 'a']] }));

    replaceStoredJobId('fill_in_blank_result_t1', 'job-new');

    expect(JSON.parse(localStorage.getItem('fill_in_blank_result_t1') ?? '{}')).toEqual({ jobId: 'job-new', timeElapsed: 42, answers: [[0, 'a']] });
  });

  it('does nothing when there is no saved entry', () => {
    replaceStoredJobId('fill_in_blank_result_t1', 'job-new');

    expect(localStorage.getItem('fill_in_blank_result_t1')).toBeNull();
  });

  it('logs and leaves unreadable data alone', () => {
    localStorage.setItem('fill_in_blank_result_t1', '{not json');

    replaceStoredJobId('fill_in_blank_result_t1', 'job-new');

    expect(localStorage.getItem('fill_in_blank_result_t1')).toBe('{not json');
    expect(logWarn).toHaveBeenCalledTimes(1);
  });
});
