import { TOP_PROBLEMATIC_LIMIT } from '@/constants/statistics';
import { statisticsApi } from '@/utils/server-api';

export async function getDashboardProblematicData() {
  const [dashboard, problematic] = await Promise.all([
    statisticsApi.getDashboard({
      include: ['summary'],
    }),
    statisticsApi.getProblematic({
      status: 'all',
      limit: TOP_PROBLEMATIC_LIMIT,
      page: 1,
    }),
  ]);

  const summary = dashboard.summary;
  const totalNeedReview = summary ? summary.criticalCount + summary.warningCount : 0;

  return {
    problematic: problematic ?? [],
    totalNeedReview,
  };
}
