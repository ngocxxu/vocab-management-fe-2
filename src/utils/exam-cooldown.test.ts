// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  EXAM_COOLDOWN_STORAGE_KEY,
  getExamCooldownRemainingSeconds,
  markExamCooldownNow,
} from '@/utils/exam-cooldown';

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(1_000_000);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('exam cooldown', () => {
  it('is 0 when never marked', () => {
    expect(getExamCooldownRemainingSeconds()).toBe(0);
  });

  it('is the full 60 seconds right after marking', () => {
    markExamCooldownNow();
    expect(getExamCooldownRemainingSeconds()).toBe(60);
  });

  it('counts down as time passes', () => {
    markExamCooldownNow();
    vi.advanceTimersByTime(30_000);
    expect(getExamCooldownRemainingSeconds()).toBe(30);
  });

  it('rounds partial seconds up', () => {
    markExamCooldownNow();
    vi.advanceTimersByTime(500);
    expect(getExamCooldownRemainingSeconds()).toBe(60);
  });

  it('is 0 once the cooldown has elapsed', () => {
    markExamCooldownNow();
    vi.advanceTimersByTime(60_000);
    expect(getExamCooldownRemainingSeconds()).toBe(0);
    vi.advanceTimersByTime(60_000);
    expect(getExamCooldownRemainingSeconds()).toBe(0);
  });

  it('clears a corrupt stored value and returns 0', () => {
    localStorage.setItem(EXAM_COOLDOWN_STORAGE_KEY, 'not-a-number');
    expect(getExamCooldownRemainingSeconds()).toBe(0);
    expect(localStorage.getItem(EXAM_COOLDOWN_STORAGE_KEY)).toBeNull();
  });
});
