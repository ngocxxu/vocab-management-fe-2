import { notificationsApi } from '@/utils/server-api';

/** Every broadcast with its recipient count, newest first. */
export async function getAdminBroadcastPageData() {
  const response = await notificationsApi.broadcastHistory();

  return response.items;
}
