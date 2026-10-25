import { logger } from '@/libs/Logger';
import { notificationsApi } from '@/utils/server-api';

/** A failed fetch is reported through `notificationsError`, never shown as an empty list. */
export async function getLayoutNotificationsData() {
  const [allRes, unreadRes, countRes] = await Promise.allSettled([
    notificationsApi.getMy(),
    notificationsApi.getUnread(),
    notificationsApi.getUnreadCount(),
  ]);

  const failures = [allRes, unreadRes, countRes].filter(result => result.status === 'rejected');
  for (const failure of failures) {
    logger.error('Failed to load notifications for the layout:', { reason: failure.reason });
  }

  return {
    allNotifications: allRes.status === 'fulfilled' ? allRes.value : undefined,
    unreadNotifications: unreadRes.status === 'fulfilled' ? unreadRes.value : undefined,
    unreadCount: countRes.status === 'fulfilled' ? countRes.value : undefined,
    notificationsError: failures.length > 0,
  };
}
