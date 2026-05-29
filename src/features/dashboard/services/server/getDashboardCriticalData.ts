import { verifyUser } from '@/actions';
import { getProgressDateRange } from '@/features/dashboard/utils/dateRange';
import { statisticsApi } from '@/utils/server-api';

export async function getDashboardCriticalData() {
  const { startDate, endDate } = getProgressDateRange(14);

  const [user, dashboard] = await Promise.all([
    verifyUser(),
    statisticsApi.getDashboard({
      include: ['summary', 'progress'],
      startDate,
      endDate,
    }),
  ]);

  if (!dashboard.summary) {
    throw new Error('Dashboard summary is missing from API response');
  }

  return {
    user,
    summary: dashboard.summary,
    progress: dashboard.progress ?? [],
  };
}
