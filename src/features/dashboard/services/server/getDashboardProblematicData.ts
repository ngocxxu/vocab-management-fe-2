import { statisticsApi } from '@/utils/server-api';

export async function getDashboardProblematicData() {
  const dashboard = await statisticsApi.getDashboard({
    include: ['problematic'],
  });

  if (dashboard.problematic?.length) {
    return { problematic: dashboard.problematic };
  }

  const problematic = await statisticsApi.getProblematic({
    minIncorrect: 5,
    limit: 10,
  });

  return { problematic };
}
