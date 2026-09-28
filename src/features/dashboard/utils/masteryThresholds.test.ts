import { describe, expect, it } from 'vitest';
import { getMasteryBarClass, getMasteryTextClass } from './masteryThresholds';

describe('mastery thresholds', () => {
  it.each([
    [0, 'text-destructive', 'bg-destructive'],
    [3.9, 'text-destructive', 'bg-destructive'],
    [4, 'text-warning', 'bg-warning'],
    [6.9, 'text-warning', 'bg-warning'],
    [7, 'text-success', 'bg-success'],
    [10, 'text-success', 'bg-success'],
  ])('score %s uses %s and %s', (score, text, bar) => {
    expect(getMasteryTextClass(score)).toBe(text);
    expect(getMasteryBarClass(score)).toBe(bar);
  });
});
