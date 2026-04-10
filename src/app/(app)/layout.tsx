import { getLayoutNotificationsData } from '@/features/notifications/services/server/getLayoutNotificationsData';
import { LayoutClient } from './LayoutClient';

export const dynamic = 'force-dynamic';

export default async function Layout(props: {
  children: React.ReactNode;
}) {
  const { allNotifications, unreadNotifications, unreadCount } = await getLayoutNotificationsData();

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
