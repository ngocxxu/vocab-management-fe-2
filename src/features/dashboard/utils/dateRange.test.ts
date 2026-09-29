import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getCalendarYearDateRange, getProgressDateRange } from './dateRange';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 2, 10, 12, 0, 0));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('getProgressDateRange', () => {
  it('spans dayCount days ending today', () => {
    expect(getProgressDateRange(7)).toEqual({ startDate: '2026-03-04', endDate: '2026-03-10' });
  });

  it('is a single day for dayCount 1', () => {
    expect(getProgressDateRange(1)).toEqual({ startDate: '2026-03-10', endDate: '2026-03-10' });
  });

  it('crosses a month boundary', () => {
    expect(getProgressDateRange(15).startDate).toBe('2026-02-24');
  });
});

describe('getCalendarYearDateRange', () => {
  it('covers Jan 1 to Dec 31 of the given year', () => {
    expect(getCalendarYearDateRange(2025)).toEqual({ startDate: '2025-01-01', endDate: '2025-12-31', year: 2025 });
  });

  it('defaults to the current year', () => {
    expect(getCalendarYearDateRange().year).toBe(2026);
  });
});
