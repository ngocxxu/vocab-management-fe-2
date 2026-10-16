import type { Activity } from 'react-activity-calendar';
import { describe, expect, it } from 'vitest';
import { buildActivityTooltipLabels } from './activityTooltipLabels';

describe('activity tooltip labels', () => {
  it('formats each activity date once, keyed by ISO date', () => {
    // Arrange
    const activities: Activity[] = [
      { date: '2026-10-16', count: 2, level: 2 },
      { date: '2026-10-17', count: 0, level: 0 },
    ];
    const formatText = (label: string, count: number) => `${label} | ${count}`;

    // Act
    const labels = buildActivityTooltipLabels(activities, 'en-US', formatText);

    // Assert
    expect(labels.get('2026-10-16')).toBe('Oct 16, 2026 | 2');
    expect(labels.get('2026-10-17')).toBe('Oct 17, 2026 | 0');
  });

  it('returns no label for a date that is not in the activities', () => {
    // Arrange
    const activities: Activity[] = [{ date: '2026-10-16', count: 1, level: 1 }];
    const formatText = (label: string) => label;

    // Act
    const labels = buildActivityTooltipLabels(activities, 'en-US', formatText);

    // Assert
    expect(labels.has('2026-01-01')).toBe(false);
  });
});
