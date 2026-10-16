import { parseISO } from 'date-fns';
import type { Activity } from 'react-activity-calendar';

// One Intl formatter per call instead of one toLocaleDateString per cell:
// react-activity-calendar calls the tooltip text function during every render, for every cell.
export function buildActivityTooltipLabels(
  activities: Activity[],
  locale: string,
  formatText: (dateLabel: string, count: number) => string,
): Map<string, string> {
  const dateFormatter = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' });

  return new Map<string, string>(
    activities.map(({ date, count }): [string, string] => [date, formatText(dateFormatter.format(parseISO(date)), count)]),
  );
}
