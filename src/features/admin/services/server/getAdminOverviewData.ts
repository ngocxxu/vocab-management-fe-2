import { adminApi } from '@/utils/server-api';

/** Overview counts plus the 30-day signup series. The backend returns exactly 30 zero-filled days. */
export async function getAdminOverviewData() {
  return adminApi.stats.get();
}
