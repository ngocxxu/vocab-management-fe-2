import { verifyUser } from '@/actions';
import { statisticsApi } from '@/utils/server-api';

export async function getDashboardNextActionData() {
  await verifyUser();

  const dashboard = await statisticsApi.getDashboard({
    include: ['summary'],
  });

  if (!dashboard.summary) {
    throw new Error('Dashboard summary is missing from API response');
  }

  return { summary: dashboard.summary };
}
