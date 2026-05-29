import { practiceCountToLevel } from './practiceCountLevels';
import type { TProgressOverTime } from '@/types/statistics';
import type { Activity } from 'react-activity-calendar';

export function mapProgressToCalendarActivities(progress: TProgressOverTime[]): Activity[] {
  return progress.map((point) => {
    const count = point.practiceCount ?? 0;
    return {
      date: point.date,
      count,
      level: practiceCountToLevel(count),
    };
  });
}
