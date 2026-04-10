import { verifyUser } from '@/actions';
import { statisticsApi } from '@/utils/server-api';

export async function getDashboardData() {
  const [user, summary, bySubject, progress, problematic, distribution] = await Promise.all([
    verifyUser(),
    statisticsApi.getSummary(),
    statisticsApi.getBySubject(),
    statisticsApi.getProgress(),
    statisticsApi.getProblematic(),
    statisticsApi.getDistribution(),
  ]);

  return { user, summary, bySubject, progress, problematic, distribution };
}
