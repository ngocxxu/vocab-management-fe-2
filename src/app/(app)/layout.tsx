import { notificationsApi } from '@/utils/server-api';
import { LayoutClient } from './LayoutClient';

export const dynamic = 'force-dynamic';

export default async function Layout(props: {
  children: React.ReactNode;
}) {
  // Use Promise.allSettled to handle errors gracefully without try-catch
  const results = await Promise.allSettled([
    notificationsApi.getMy(),
    notificationsApi.getUnread(),
    notificationsApi.getUnreadCount(),
  ]);

  // Extract values, defaulting to undefined if rejected
  const allNotifications = results[0].status === 'fulfilled' ? results[0].value : undefined;
  const unreadNotifications = results[1].status === 'fulfilled' ? results[1].value : undefined;
  const unreadCount = results[2].status === 'fulfilled' ? results[2].value : undefined;

  // Log errors if any occurred
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`Failed to fetch notification data (${index}):`, result.reason);
    }
  });

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
