import { statisticsApi } from '@/utils/server-api';

export async function getDashboardChartsData() {
  const dashboard = await statisticsApi.getDashboard({
    include: ['summary', 'subjects', 'distribution', 'progress'],
  });

  if (!dashboard.summary) {
    throw new Error('Dashboard summary is missing from API response');
  }

  return {
    summary: dashboard.summary,
    subjects: dashboard.subjects ?? [],
    distribution: dashboard.distribution ?? [],
    progress: dashboard.progress ?? [],
  };
}
