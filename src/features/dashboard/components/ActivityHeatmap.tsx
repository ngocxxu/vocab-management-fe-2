'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ACTIVITY_CALENDAR_THEME } from '../utils/activityCalendarTheme';
import { buildActivityTooltipLabels } from '../utils/activityTooltipLabels';
import { getCalendarYearDateRange } from '../utils/dateRange';
import { mapProgressToCalendarActivities } from '../utils/mapProgressToCalendarActivities';
import { useTheme } from '@/hooks/useTheme';
import type { TProgressOverTime } from '@/types/statistics';
import { useLocale, useTranslations } from 'next-intl';
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

export function ActivityHeatmap({ progress }: TActivityHeatmapProps) {
  const t = useTranslations('dashboard.heatmap');
  const locale = useLocale();
  const { year } = getCalendarYearDateRange();
  const { theme, mounted } = useTheme();

  const activities = useMemo(
    () => withYearBoundaries(mapProgressToCalendarActivities(progress), year),
    [progress, year],
  );

  const totalSessions = activities.reduce((sum, activity) => sum + activity.count, 0);
  const colorScheme = mounted && theme === 'dark' ? 'dark' : 'light';

  const tooltipLabels = useMemo(
    () => buildActivityTooltipLabels(activities, locale, (dateLabel, count) =>
      count === 0
        ? t('none', { date: dateLabel })
        : t('session', { date: dateLabel, count })),
    [activities, locale, t],
  );

  return (
    <Card className="flex h-full flex-col overflow-hidden border-0 bg-card shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-foreground">{t('title')}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('subtitle', { year })}
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
              totalCount: t('total', { count: totalSessions, year }),
              legend: { less: t('less'), more: t('more') },
            }}
            tooltips={{
              activity: {
                text: activity => tooltipLabels.get(activity.date) ?? '',
              },
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
