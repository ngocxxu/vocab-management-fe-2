import type { TAdminPlan } from '@/types/admin';
import { adminApi } from '@/utils/server-api';

/** Every plan for the plans page, inactive ones included. */
export async function getAdminPlansPageData(): Promise<TAdminPlan[]> {
  return adminApi.plans.list();
}
