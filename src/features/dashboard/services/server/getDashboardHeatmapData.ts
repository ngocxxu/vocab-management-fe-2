import { getCalendarYearDateRange } from '../../utils/dateRange';
import { statisticsApi } from '@/utils/server-api';

export async function getDashboardHeatmapData() {
  const { startDate, endDate } = getCalendarYearDateRange();

  const dashboard = await statisticsApi.getDashboard({
    include: ['progress'],
    startDate,
    endDate,
  });

  return { progress: dashboard.progress ?? [] };
}
