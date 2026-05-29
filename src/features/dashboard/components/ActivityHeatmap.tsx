'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ACTIVITY_CALENDAR_THEME } from '@/features/dashboard/utils/activityCalendarTheme';
import { getCalendarYearDateRange } from '@/features/dashboard/utils/dateRange';
import { mapProgressToCalendarActivities } from '@/features/dashboard/utils/mapProgressToCalendarActivities';
import { useTheme } from '@/hooks/useTheme';
import type { TProgressOverTime } from '@/types/statistics';
import { format, parseISO } from 'date-fns';
import { useMemo } from 'react';
import { ActivityCalendar } from 'react-activity-calendar';

type TActivityHeatmapProps = {
  progress: TProgressOverTime[];
};

function withYearBoundaries(activities: ReturnType<typeof mapProgressToCalendarActivities>, year: number) {
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;
  const byDate = new Map(activities.map(activity => [activity.date, activity]));

  if (!byDate.has(startDate)) {
    byDate.set(startDate, { date: startDate, count: 0, level: 0 });
  }
  if (!byDate.has(endDate)) {
    byDate.set(endDate, { date: endDate, count: 0, level: 0 });
  }

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function formatActivityTooltip(date: string, count: number): string {
  const label = format(parseISO(date), 'MMM d, yyyy');
  if (count === 0) {
    return `${label} — no practice`;
  }
  const sessionLabel = count === 1 ? 'session' : 'sessions';
  return `${label} — ${count} practice ${sessionLabel}`;
}

export function ActivityHeatmap({ progress }: TActivityHeatmapProps) {
  const { year } = getCalendarYearDateRange();
  const { theme, mounted } = useTheme();

  const activities = useMemo(
    () => withYearBoundaries(mapProgressToCalendarActivities(progress), year),
    [progress, year],
  );

  const colorScheme = mounted && theme === 'dark' ? 'dark' : 'light';

  return (
    <Card className="flex h-full flex-col overflow-hidden border-0 bg-card shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-foreground">Activity</CardTitle>
        <p className="text-sm text-muted-foreground">
          {`Practice activity in ${year}.`}
        </p>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="overflow-x-auto text-foreground">
          <ActivityCalendar
            data={activities}
            theme={ACTIVITY_CALENDAR_THEME}
            colorScheme={colorScheme}
            blockSize={12}
            blockMargin={3}
            blockRadius={2}
            fontSize={12}
            showMonthLabels
            showWeekdayLabels
            showColorLegend
            showTotalCount
            labels={{
              totalCount: '{{count}} practice sessions in {{year}}',
              legend: { less: 'Less', more: 'More' },
            }}
            tooltips={{
              activity: {
                text: activity => formatActivityTooltip(activity.date, activity.count),
              },
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
