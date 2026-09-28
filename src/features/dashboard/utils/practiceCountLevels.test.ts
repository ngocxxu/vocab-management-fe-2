import { describe, expect, it } from 'vitest';
import { practiceCountToLevel } from './practiceCountLevels';

describe('practiceCountToLevel', () => {
  it.each([
    [0, 0],
    [1, 1],
    [2, 1],
    [3, 2],
    [5, 2],
    [6, 3],
    [10, 3],
    [11, 4],
    [500, 4],
  ])('maps %s practices to level %s', (count, level) => {
    expect(practiceCountToLevel(count)).toBe(level);
  });

  it('clamps negatives to level 0 and floors fractions', () => {
    expect(practiceCountToLevel(-5)).toBe(0);
    expect(practiceCountToLevel(2.9)).toBe(1);
  });
});
