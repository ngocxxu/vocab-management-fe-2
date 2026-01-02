import { notificationsApi } from '@/utils/server-api';
import { LayoutClient } from './LayoutClient';

export const dynamic = 'force-dynamic';

export default async function Layout(props: {
  children: React.ReactNode;
}) {
  let allNotifications;
  let unreadNotifications;
  let unreadCount;

  try {
    const [allRes, unreadRes, countRes] = await Promise.allSettled([
      notificationsApi.getMy().catch(() => undefined),
      notificationsApi.getUnread().catch(() => undefined),
      notificationsApi.getUnreadCount().catch(() => undefined),
    ]);

    allNotifications = allRes.status === 'fulfilled' ? allRes.value : undefined;
    unreadNotifications = unreadRes.status === 'fulfilled' ? unreadRes.value : undefined;
    unreadCount = countRes.status === 'fulfilled' ? countRes.value : undefined;
  } catch (error) {
    // Silently fail - production doesn't need error details
    if (process.env.NODE_ENV === 'development') {
      console.error('Layout fetch error:', error);
    }
  }

  return (
    <LayoutClient
      initialAllNotifications={allNotifications}
      initialUnreadNotifications={unreadNotifications}
      initialUnreadCount={unreadCount}
    >
      {props.children}
    </LayoutClient>
  );
}
