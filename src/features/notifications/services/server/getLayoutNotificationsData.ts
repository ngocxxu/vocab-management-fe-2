import { notificationsApi } from '@/utils/server-api';

export async function getLayoutNotificationsData() {
  try {
    const [allRes, unreadRes, countRes] = await Promise.allSettled([
      notificationsApi.getMy().catch(() => undefined),
      notificationsApi.getUnread().catch(() => undefined),
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
