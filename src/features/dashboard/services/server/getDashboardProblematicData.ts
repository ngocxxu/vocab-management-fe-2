import { statisticsApi } from '@/utils/server-api';

const PROBLEMATIC_TABLE_LIMIT = 20;

export async function getDashboardProblematicData() {
  const [dashboard, problematic] = await Promise.all([
    statisticsApi.getDashboard({
      include: ['summary'],
    }),
    statisticsApi.getProblematic({
      status: 'all',
      limit: PROBLEMATIC_TABLE_LIMIT,
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
