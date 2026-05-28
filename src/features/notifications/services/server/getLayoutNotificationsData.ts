import { DEFAULT_NOTIFICATION_QUERY_PARAMS } from '@/utils/api-config';
import { notificationsApi } from '@/utils/server-api';

export async function getLayoutNotificationsData() {
  try {
    const [allRes, unreadRes, countRes] = await Promise.allSettled([
      notificationsApi.getMy(DEFAULT_NOTIFICATION_QUERY_PARAMS).catch(() => undefined),
      notificationsApi.getUnread(DEFAULT_NOTIFICATION_QUERY_PARAMS).catch(() => undefined),
      notificationsApi.getUnreadCount().catch(() => undefined),
    ]);

    return {
      allNotifications: allRes.status === 'fulfilled' ? allRes.value : undefined,
      unreadNotifications: unreadRes.status === 'fulfilled' ? unreadRes.value : undefined,
      unreadCount: countRes.status === 'fulfilled' ? countRes.value : undefined,
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Layout fetch error:', error);
    }
    return { allNotifications: undefined, unreadNotifications: undefined, unreadCount: undefined };
  }
}
