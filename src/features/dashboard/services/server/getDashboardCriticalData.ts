import { verifyUser } from '@/actions';
import { statisticsApi } from '@/utils/server-api';

export async function getDashboardCriticalData() {
  const [user, dashboard] = await Promise.all([
    verifyUser(),
    statisticsApi.getDashboard({
      include: ['summary'],
    }),
  ]);

  if (!dashboard.summary) {
    throw new Error('Dashboard summary is missing from API response');
  }

  return {
    user,
    summary: dashboard.summary,
  };
}
