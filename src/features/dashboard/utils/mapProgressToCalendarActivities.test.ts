import { describe, expect, it } from 'vitest';
import { mapProgressToCalendarActivities } from './mapProgressToCalendarActivities';

describe('mapProgressToCalendarActivities', () => {
  it('maps each point to date, count and level', () => {
    const result = mapProgressToCalendarActivities([
      { date: '2026-01-01', averageMastery: 5, practiceCount: 0 },
      { date: '2026-01-02', averageMastery: 6, practiceCount: 4 },
    ]);
    expect(result).toEqual([
      { date: '2026-01-01', count: 0, level: 0 },
      { date: '2026-01-02', count: 4, level: 2 },
    ]);
  });

  it('returns an empty list for no progress', () => {
    expect(mapProgressToCalendarActivities([])).toEqual([]);
  });
});
