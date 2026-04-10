import type { TNotification } from '@/types/notification';
import { notificationsApi } from '@/utils/server-api';

export async function getNotificationsPageData() {
  let notificationsWithRead: { notification: TNotification; isRead: boolean }[] = [];

  try {
    const res = await notificationsApi.getMy();
    const items = res?.items ?? [];
    notificationsWithRead = items.map((notification) => {
      const isRead = notification.recipients?.[0]?.isRead ?? false;
      return { notification, isRead };
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Notifications page fetch error:', error);
    }
  }

  return { notificationsWithRead };
}
