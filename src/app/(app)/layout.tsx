import { notificationsApi } from '@/utils/server-api';
import { LayoutClient } from './LayoutClient';

export const dynamic = 'force-dynamic';

export default async function Layout(props: {
  children: React.ReactNode;
}) {
  try {
    // Fetch all notification data at server-side
    const [allNotifications, unreadNotifications, unreadCount] = await Promise.all([
      notificationsApi.getMy(),
      notificationsApi.getUnread(),
      notificationsApi.getUnreadCount(),
    ]);

    return (
      <LayoutClient
        initialAllNotifications={allNotifications}
        initialUnreadNotifications={unreadNotifications}
        initialUnreadCount={unreadCount}
      >
        {props.children}
      </LayoutClient>
    );
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    // Return LayoutClient without initial data if fetch fails
    return (
      <LayoutClient>
        {props.children}
      </LayoutClient>
    );
  }
}
